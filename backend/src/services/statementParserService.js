const crypto = require("crypto");

const MONTHS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Main entry point: Parses bank statement text from PDF, CSV, or TXT.
 */
function parseBankStatement(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  // 1. Try CSV / Delimited parser first if text has comma/tab separated structure with headers
  const csvTransactions = tryParseCSV(text);
  if (csvTransactions.length > 0) {
    return csvTransactions;
  }

  // 2. Line-by-line statement parser
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // If a single line contains multiple dates (e.g. from condensed PDF extraction), break into separate rows
  const lines = [];
  const multiDateRegex = /\b((?:20\d{2}[-\/](?:0?[1-9]|1[0-2])[-\/](?:0?[1-9]|[12]\d|3[01]))|(?:(?:0?[1-9]|[12]\d|3[01])[-\/\.](?:0?[1-9]|1[0-2])[-\/\.](?:20\d{2}|\d{2}))|(?:(?:0?[1-9]|[12]\d|3[01])[-\s][A-Za-z]{3,9}[-\s](?:20\d{2}|\d{2})))\b/g;

  for (const rawLine of rawLines) {
    const dateMatches = [...rawLine.matchAll(multiDateRegex)];
    if (dateMatches.length >= 2) {
      for (let i = 0; i < dateMatches.length; i++) {
        const start = dateMatches[i].index;
        const end = i + 1 < dateMatches.length ? dateMatches[i + 1].index : rawLine.length;
        const sub = rawLine.substring(start, end).trim();
        if (sub) lines.push(sub);
      }
    } else {
      lines.push(rawLine);
    }
  }

  let transactions = [];

  for (const line of lines) {
    const tx = parseTransactionLine(line);
    if (tx) {
      transactions.push(tx);
    }
  }

  // 3. Fallback: If line-by-line yielded 0 transactions, split contiguous stream
  if (transactions.length === 0) {
    transactions = parseContiguousTextStream(text);
  }

  return transactions;
}

/**
 * Parses a single statement line into a candidate transaction.
 */
function parseTransactionLine(line) {
  if (!line || line.length < 6) return null;

  // Skip common header/footer lines
  const lower = line.toLowerCase();
  if (
    lower.includes("statement of account") ||
    lower.includes("page ") ||
    lower.includes("opening balance") ||
    lower.includes("closing balance") ||
    (lower.includes("date") && (lower.includes("narration") || lower.includes("particulars") || lower.includes("balance")))
  ) {
    return null;
  }

  const dateResult = extractDateFromText(line);
  if (!dateResult) return null;

  const { date, rawDate } = dateResult;

  // Extract all numeric money patterns
  // Extract all numeric money patterns (requires boundary or currency symbol)
  const amountRegex = /(?:^|[\s,₹\$]|Rs\.?|INR)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})|[0-9]+(?:\.[0-9]{1,2})|[0-9]{2,8})(?=[\s,A-Za-z]|$)/gi;
  const matches = [...line.matchAll(amountRegex)];

  if (matches.length === 0) return null;

  // Filter out candidates that are actually part of the date or pure integers > 1900 < 2100 (years)
  const validAmounts = [];
  for (const m of matches) {
    const rawVal = m[1].replace(/,/g, "");
    const num = parseFloat(rawVal);
    const matchIndex = m.index;

    // Check if this number is within the matched date substring
    const isPartOfDate =
      matchIndex >= line.indexOf(rawDate) &&
      matchIndex <= line.indexOf(rawDate) + rawDate.length;

    if (!isPartOfDate && Number.isFinite(num) && num > 0) {
      validAmounts.push({ num, rawStr: m[0], valueStr: m[1] });
    }
  }

  if (validAmounts.length === 0) return null;

  // In Indian / standard statements:
  // If multiple amounts appear, usually: [Debit/Credit Amount, Running Balance]
  // We prefer the transaction amount (not the running balance if multiple are present)
  let chosenAmount = validAmounts[0].num;

  // Extract merchant / description
  let description = line
    .replace(rawDate, " ")
    .replace(/(?:₹|Rs\.?|INR|\$)?\s*[0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?/gi, " ")
    .replace(/[,\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Clean description of bank noise
  const cleanMerchant = cleanMerchantDescription(description);

  // Determine Type (Expense vs Income)
  const upperLine = line.toUpperCase();
  let type = "expense";
  if (
    upperLine.includes(" CREDIT ") ||
    upperLine.includes("/CR/") ||
    upperLine.endsWith(" CR") ||
    upperLine.includes(" CR ") ||
    upperLine.includes("SALARY") ||
    upperLine.includes("REFUND") ||
    upperLine.includes("INTEREST PAID") ||
    upperLine.includes("CASH DEPOSIT")
  ) {
    type = "income";
  }

  return {
    id: crypto.randomUUID(),
    date,
    merchant: cleanMerchant || "Bank Transaction",
    originalDescription: description || cleanMerchant || "Bank Transaction",
    amount: chosenAmount,
    type,
    category: "Uncategorized",
    source: "bank_statement",
    status: "pending_review",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Extracts and normalizes any standard date pattern from a text line.
 */
function extractDateFromText(line) {
  // Pattern 1: ISO format YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = line.match(/\b(20\d{2}[-\/](?:0?[1-9]|1[0-2])[-\/](?:0?[1-9]|[12]\d|3[01]))\b/);
  if (isoMatch) {
    const parts = isoMatch[1].split(/[-\/]/);
    const y = parts[0];
    const m = parts[1].padStart(2, "0");
    const d = parts[2].padStart(2, "0");
    return { date: `${y}-${m}-${d}`, rawDate: isoMatch[1] };
  }

  // Pattern 2: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (or with 2-digit year)
  const dmyMatch = line.match(/\b((?:0?[1-9]|[12]\d|3[01])[-\/\.](?:0?[1-9]|1[0-2])[-\/\.](?:20\d{2}|\d{2}))\b/);
  if (dmyMatch) {
    const parts = dmyMatch[1].split(/[-\/\.]/);
    let d = parts[0].padStart(2, "0");
    let m = parts[1].padStart(2, "0");
    let y = parts[2];
    if (y.length === 2) y = `20${y}`;
    return { date: `${y}-${m}-${d}`, rawDate: dmyMatch[1] };
  }

  // Pattern 3: DD MMM YYYY or DD-MMM-YYYY or DD-MMM-YY (e.g., 19 Sep 2026, 19-Sep-2026, 01-Jan-24)
  const namedMonthMatch = line.match(/\b((?:0?[1-9]|[12]\d|3[01])[-\s]([A-Za-z]{3,9})[-\s](?:20\d{2}|\d{2}))\b/i);
  if (namedMonthMatch) {
    const raw = namedMonthMatch[1];
    const d = namedMonthMatch[1].split(/[-\s]/)[0].padStart(2, "0");
    const monthKey = namedMonthMatch[2].toLowerCase();
    const monthNum = MONTHS[monthKey];
    let y = namedMonthMatch[1].split(/[-\s]/)[2];
    if (y.length === 2) y = `20${y}`;
    if (monthNum) {
      return {
        date: `${y}-${String(monthNum).padStart(2, "0")}-${d}`,
        rawDate: raw,
      };
    }
  }

  // Pattern 4: MMM DD, YYYY or MMM DD YYYY (e.g., Sep 19, 2026)
  const monthFirstMatch = line.match(/\b(([A-Za-z]{3,9})\s+([0-9]{1,2}),?\s+(20\d{2}))\b/i);
  if (monthFirstMatch) {
    const monthKey = monthFirstMatch[2].toLowerCase();
    const monthNum = MONTHS[monthKey];
    const d = monthFirstMatch[3].padStart(2, "0");
    const y = monthFirstMatch[4];
    if (monthNum) {
      return {
        date: `${y}-${String(monthNum).padStart(2, "0")}-${d}`,
        rawDate: monthFirstMatch[1],
      };
    }
  }

  return null;
}

/**
 * Handles contiguous streams where dates and transactions are present without newlines.
 */
function parseContiguousTextStream(text) {
  const dateRegex = /\b((?:20\d{2}[-\/](?:0?[1-9]|1[0-2])[-\/](?:0?[1-9]|[12]\d|3[01]))|(?:(?:0?[1-9]|[12]\d|3[01])[-\/\.](?:0?[1-9]|1[0-2])[-\/\.](?:20\d{2}|\d{2}))|(?:(?:0?[1-9]|[12]\d|3[01])[-\s][A-Za-z]{3,9}[-\s](?:20\d{2}|\d{2})))\b/g;
  const matches = [...text.matchAll(dateRegex)];

  if (matches.length < 2) return [];

  const chunks = [];
  for (let i = 0; i < matches.length; i++) {
    const startIndex = matches[i].index;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const chunk = text.substring(startIndex, endIndex).trim();
    if (chunk.length > 5 && chunk.length < 300) {
      chunks.push(chunk);
    }
  }

  const results = [];
  for (const chunk of chunks) {
    const tx = parseTransactionLine(chunk);
    if (tx) {
      results.push(tx);
    }
  }

  return results;
}

/**
 * Delimited CSV parser supporting standard bank exports (HDFC, SBI, ICICI, etc.).
 */
function tryParseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  // Detect delimiter: comma, semicolon, or tab
  const headerCandidates = lines.slice(0, 10);
  let delimiter = ",";
  let headerIndex = -1;
  let headers = [];

  for (let i = 0; i < headerCandidates.length; i++) {
    const rawLine = headerCandidates[i];
    for (const d of [",", ";", "\t"]) {
      const parts = splitCSVLine(rawLine, d).map((s) => s.toLowerCase().trim());
      const hasDate = parts.some((p) => p.includes("date"));
      const hasAmountOrDebit = parts.some((p) => p.includes("amount") || p.includes("debit") || p.includes("withdrawal") || p.includes("credit"));
      if (hasDate && hasAmountOrDebit) {
        delimiter = d;
        headerIndex = i;
        headers = parts;
        break;
      }
    }
    if (headerIndex !== -1) break;
  }

  if (headerIndex === -1) return [];

  // Identify column indices
  let dateCol = headers.findIndex((h) => h.includes("date") && !h.includes("value"));
  if (dateCol === -1) dateCol = headers.findIndex((h) => h.includes("date"));

  let descCol = headers.findIndex((h) => h.includes("narration") || h.includes("description") || h.includes("particulars") || h.includes("remarks") || h.includes("details"));
  if (descCol === -1) descCol = headers.findIndex((h) => h.includes("merchant") || h.includes("payee") || h.includes("party"));

  const debitCol = headers.findIndex((h) => h.includes("debit") || h.includes("withdrawal") || h.includes("dr"));
  const creditCol = headers.findIndex((h) => h.includes("credit") || h.includes("deposit") || h.includes("cr"));
  const amountCol = headers.findIndex((h) => h.includes("amount") && !h.includes("balance"));
  const typeCol = headers.findIndex((h) => h === "type" || h === "dr/cr" || h === "cr/dr");

  const transactions = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i], delimiter);
    if (row.length < 2) continue;

    const rawDateStr = dateCol !== -1 && row[dateCol] ? row[dateCol].trim() : "";
    const dateObj = extractDateFromText(rawDateStr);
    if (!dateObj) continue;

    let desc = descCol !== -1 && row[descCol] ? row[descCol].trim() : "Transaction";
    let amount = 0;
    let type = "expense";

    // Handle separate Debit & Credit columns
    if (debitCol !== -1 && creditCol !== -1) {
      const debitVal = parseNumeric(row[debitCol]);
      const creditVal = parseNumeric(row[creditCol]);

      if (debitVal > 0) {
        amount = debitVal;
        type = "expense";
      } else if (creditVal > 0) {
        amount = creditVal;
        type = "income";
      }
    } else if (amountCol !== -1) {
      amount = parseNumeric(row[amountCol]);
      if (typeCol !== -1 && row[typeCol]) {
        const t = row[typeCol].toLowerCase();
        if (t.includes("cr") || t.includes("credit") || t.includes("deposit")) {
          type = "income";
        }
      } else if (row[amountCol] && row[amountCol].includes("+")) {
        type = "income";
      }
    }

    if (amount > 0) {
      transactions.push({
        id: crypto.randomUUID(),
        date: dateObj.date,
        merchant: cleanMerchantDescription(desc),
        originalDescription: desc,
        amount,
        type,
        category: "Uncategorized",
        source: "bank_statement",
        status: "pending_review",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return transactions;
}

function splitCSVLine(line, delimiter = ",") {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

function parseNumeric(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9.]/g, "");
  const val = parseFloat(cleaned);
  return Number.isFinite(val) ? val : 0;
}

/**
 * Cleans bank narrative noise like "UPI/12345/SWIGGY/P2M" into "SWIGGY".
 */
function cleanMerchantDescription(rawDesc) {
  if (!rawDesc) return "Transaction";

  let clean = rawDesc
    .replace(/^[,"'/\-\s]+|[,"'/\-\s]+$/g, "")
    .replace(/\b(UPI|POS|NEFT|IMPS|RTGS|ACH|BILLDESK|INF|INB|EAW)\b[\/: -]*/gi, " ")
    .replace(/\b(P2M|P2P|CR|DR|DEBIT|CREDIT|TRANSFER)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // If narrative is split by '/' or '-', take the most descriptive word chunk
  if (clean.includes("/")) {
    const parts = clean.split("/").map((p) => p.trim()).filter((p) => p.length > 2 && !/^\d+$/.test(p));
    if (parts.length > 0) {
      clean = parts[0];
    }
  }

  // Remove long trailing transaction reference numbers
  clean = clean.replace(/[-_ ]\d{6,}\b/g, "").replace(/^[,"'/\-\s]+|[,"'/\-\s]+$/g, "").trim();

  return clean || rawDesc;
}

module.exports = {
  parseBankStatement,
};