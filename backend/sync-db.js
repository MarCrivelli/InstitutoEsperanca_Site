require("dotenv").config();

const { sequelize } = require("./config/connection");

// Importar models
require("./models/Animais");
require("./models/CarrosselDeAnimais");
require("./models/Usuarios");
require("./models/Doadores");
require("./models/Avisos");
require("./models/Documentos");

async function sincronizarBanco() {
  try {
    console.log("🔄 Iniciando sincronização do banco...");

    await sequelize.sync({ alter: true });

    console.log("✅ Banco sincronizado com sucesso.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao sincronizar banco:", error);
    process.exit(1);
  }
}

sincronizarBanco();