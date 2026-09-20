import Dexie from "dexie";

export const db = new Dexie("PennyPalDB");

db.version(1).stores({
    messages: "++id, conversationId, role, createdAt"
});

db.version(2).stores({
    transactions: "id, vaultId, date, merchant, category, type, source, status, importBatchId, [vaultId+status], [vaultId+date], [vaultId+category]",
    importBatches: "id, vaultId, createdAt, status",
    goals: "id, vaultId, status",
    achievements: "id, vaultId, code",
    userProgress: "id, vaultId",
    chatMessages: "++id, vaultId, conversationId, role, createdAt",
    settings: "id, vaultId"
});

db.version(3).stores({
    bosses: "id, vaultId, category, status"
});
