const { Ollama } = require("ollama");
const dotenv = require("dotenv");

dotenv.config();

const ollamaClient = new Ollama({
  host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434"
});

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "llama3.1:8b";

module.exports = {
  ollamaClient,
  OLLAMA_MODEL
};