const databaseConfig = {
    type: "local-first",
    storage: "IndexedDB",
    wrapper: "Dexie.js",
};

function getDatabaseInfo() {
    return databaseConfig;
}

module.exports = {
    databaseConfig,
    getDatabaseInfo,
};
