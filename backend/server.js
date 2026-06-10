const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3003;

// ============================================================================
// CONFIGURAÇÃO DE CORS
// ============================================================================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",

      // GitHub Pages
      "https://MarCrivelli.github.io",
      "https://marcrivelli.github.io",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// ============================================================================
// MIDDLEWARES
// ============================================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Servir arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log de requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get("origin")}`);
  next();
});

// ============================================================================
// ROTA DE TESTE
// ============================================================================

app.get("/", (req, res) => {
  res.json({
    erro: false,
    mensagem: "Backend do Instituto Esperança funcionando!",
    status: "online",
  });
});

app.get("/teste-cors", (req, res) => {
  res.json({
    erro: false,
    mensagem: "Backend funcionando e CORS liberado!",
    timestamp: new Date().toISOString(),
    origin: req.get("origin"),
  });
});

// ============================================================================
// ROTAS PRINCIPAIS
// ============================================================================

const routes = require("./routers/routes");
app.use("/", routes);

// ============================================================================
// TRATAMENTO DE ERROS
// ============================================================================
app.use((err, req, res, next) => {
  console.error("❌ Erro não tratado:", err);
  res.status(500).json({
    erro: true,
    mensagem: "Erro interno do servidor",
  });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
