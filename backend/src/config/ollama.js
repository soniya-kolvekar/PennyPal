const { Ollama } = require("ollama");
const dotenv = require("dotenv");

dotenv.config();

const ollamaClient = new Ollama({
  host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434"
});

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "llama3.1:8b";

const OLLAMA_TIMEOUT_MS =
  parseInt(process.env.OLLAMA_TIMEOUT_MS, 10) || 120000;

module.exports = {
  ollamaClient,
  OLLAMA_MODEL,
  OLLAMA_TIMEOUT_MS
};