/**
 * Client-Side Statement Text Extractor
 * Extracts raw textual data from PDF, CSV, and TXT files directly in the browser
 * so only extracted text is transmitted to the backend gateway.
 */

export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error("No file provided for extraction.");
  }

  const fileName = file.name || "";
  const fileExt = fileName.split(".").pop().toLowerCase();

  // 1. Text & CSV files: Read directly using Web File API
  if (fileExt === "csv" || fileExt === "txt" || fileExt === "tsv") {
    const text = await file.text();
    if (!text || text.trim().length === 0) {
      throw new Error("The selected file is empty.");
    }
    return text;
  }

  // 2. PDF files: Extract using pdfjs-dist
  if (fileExt === "pdf") {
    return await extractTextFromPDF(file);
  }

  // Fallback: Attempt to read as text
  try {
    const fallbackText = await file.text();
    if (fallbackText && fallbackText.trim().length > 0) {
      return fallbackText;
    }
  } catch {
    // Ignore and proceed to error
  }

  throw new Error(`Unsupported file type: .${fileExt}. Please upload a PDF, CSV, or TXT bank statement.`);
}

/**
 * Extract all textual content from a PDF document across all pages.
 */
async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Dynamic import to support client-side bundling
    const pdfjs = await import("pdfjs-dist/build/pdf.mjs");

    // Set worker source
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || "4.10.38"}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStrings = textContent.items
        .map((item) => item.str)
        .filter(Boolean);

      fullText += pageStrings.join(" ") + "\n";
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("Could not extract any text from this PDF. It might be a scanned image.");
    }

    return fullText;
  } catch (err) {
    console.error("PDF Extraction failed:", err);
    throw new Error(err.message || "Failed to parse PDF statement.");
  }
}
