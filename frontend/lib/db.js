import Dexie from "dexie";

export const db = new Dexie("PennyPalDB");

db.version(1).stores({
    messages: "++id, conversationId, role, createdAt"
});
