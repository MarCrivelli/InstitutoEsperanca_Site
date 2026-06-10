const Usuario = require("../models/Usuarios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÕES DO ADMINISTRADOR FIXO
// ═══════════════════════════════════════════════════════════════
const ADMIN_FIXO = {
  nome: "",
  email: "",
  senha: "",
  nivelDeAcesso: "administrador",
  telefone: "",
  receberEmailEventos: false,
  receberMensagensEventos: false,
  ativo: true,
};

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO PARA CRIAR ADMINISTRADOR FIXO
// ═══════════════════════════════════════════════════════════════
const garantirAdminFixo = async () => {
  try {
    const adminExistente = await Usuario.findOne({
      where: { email: ADMIN_FIXO.email.toLowerCase().trim() },
    });

    if (adminExistente) {
      // Atualizar campos se necessário
      const camposParaAtualizar = {};
      if (adminExistente.nivelDeAcesso !== "administrador") {
        camposParaAtualizar.nivelDeAcesso = "administrador";
      }
      if (!adminExistente.ativo) {
        camposParaAtualizar.ativo = true;
      }

      if (Object.keys(camposParaAtualizar).length > 0) {
        await Usuario.update(camposParaAtualizar, {
          where: { id: adminExistente.id },
        });
        console.log("🔄 Admin fixo atualizado");
      }
      console.log("✅ Admin fixo já existe no sistema");
      return;
    }

    
    const senhaCriptografada = await bcrypt.hash(ADMIN_FIXO.senha, 10);

    const novoAdmin = await Usuario.create({
      nome: ADMIN_FIXO.nome,
      email: ADMIN_FIXO.email.toLowerCase().trim(),
      senha: senhaCriptografada,
      nivelDeAcesso: ADMIN_FIXO.nivelDeAcesso,
      telefone: ADMIN_FIXO.telefone,
      receberEmailEventos: ADMIN_FIXO.receberEmailEventos,
      receberMensagensEventos: ADMIN_FIXO.receberMensagensEventos,
      ativo: ADMIN_FIXO.ativo,
      dataUltimoLogin: new Date(),
    });

    console.log("═══════════════════════════════════════");
    console.log("🎉 ADMINISTRADOR FIXO CRIADO!");
    console.log(`📧 Email: ${ADMIN_FIXO.email}`);
    console.log(`🔐 Senha: ${ADMIN_FIXO.senha}`);
    console.log("═══════════════════════════════════════");

    return novoAdmin;
  } catch (error) {
    console.error("❌ Erro ao garantir admin fixo:", error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// 📝 FUNÇÕES DE VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════

const validarTelefone = (telefone) => {
  if (!telefone || telefone.trim() === "") return true; 
  // Regex para telefones brasileiros
  const phoneRegex = /^(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(telefone.replace(/\s/g, ""));
};

const limparTelefone = (telefone) => {
  if (!telefone) return null;
  // Remove espaços e caracteres especiais, mantém apenas números e +
  return telefone.replace(/[^\d+()-\s]/g, "").trim();
};

// ═══════════════════════════════════════════════════════════════
// 📝 CONTROLADORES ATUALIZADOS
// ═══════════════════════════════════════════════════════════════

const cadastrarUsuario = async (req, res) => {
  const {
    nome,
    senha,
    email,
    telefone,
    receberEmailEventos = true,
    receberMensagensEventos = true,
  } = req.body;

  await garantirAdminFixo();

  if (!nome || !senha || !email) {
    return res.status(400).json({
      erro: true,
      mensagem: "Nome, email e senha são obrigatórios",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      erro: true,
      mensagem: "Por favor, insira um email válido",
    });
  }

  if (senha.length < 6) {
    return res.status(400).json({
      erro: true,
      mensagem: "A senha deve ter pelo menos 6 caracteres",
    });
  }

  // Validações dos novos campos
  if (telefone && !validarTelefone(telefone)) {
    return res.status(400).json({
      erro: true,
      mensagem: "Telefone deve estar no formato válido (ex: +55 67 99999-9999)",
    });
  }

  try {
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({
        erro: true,
        mensagem: "Este email já está cadastrado",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      senha: senhaCriptografada,
      email: email.toLowerCase().trim(),
      telefone: limparTelefone(telefone),
      receberEmailEventos: receberEmailEventos !== false,
      receberMensagensEventos: receberMensagensEventos !== false,
      nivelDeAcesso: "usuario",
      ativo: true,
      dataUltimoLogin: new Date(),
    });

    const token = jwt.sign(
      {
        id: novoUsuario.id,
        email: novoUsuario.email,
        nivelDeAcesso: novoUsuario.nivelDeAcesso,
      },
      process.env.SEGREDO || "chave_secreta_desenvolvimento",
      { expiresIn: "300h" } /* Mudar depois */
    );

    res.status(201).json({
      erro: false,
      mensagem:
        "Cadastro realizado com sucesso! Você foi logado automaticamente.",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone,
        receberEmailEventos: novoUsuario.receberEmailEventos,
        receberMensagensEventos: novoUsuario.receberMensagensEventos,
        nivelDeAcesso: novoUsuario.nivelDeAcesso,
        foto: novoUsuario.foto,
      },
      token: token,
      loginAutomatico: true,
    });
    console.log(`✅ Usuário cadastrado: ${email}`);
  } catch (erro) {
    console.error("❌ Erro no cadastro:", erro);

    if (erro.name === "SequelizeValidationError") {
      return res.status(400).json({
        erro: true,
        mensagem: erro.errors[0].message,
      });
    }

    if (erro.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        erro: true,
        mensagem: "Este email já está cadastrado",
      });
    }

    res.status(500).json({
      erro: true,
      mensagem: "Erro interno do servidor",
    });
  }
};

const autenticarUsuario = async (req, res) => {
  const { email, senha } = req.body;

  await garantirAdminFixo();

  if (!email || !senha) {
    return res.status(400).json({
      erro: true,
      mensagem: "Email e senha são obrigatórios",
    });
  }

  try {
    const usuario = await Usuario.findOne({
      where: {
        email: email.toLowerCase().trim(),
        ativo: true, // Apenas usuários permitidos no sistema podem fazer login
      },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: true,
        mensagem: "Email ou senha incorretos",
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: true,
        mensagem: "Email ou senha incorretos",
      });
    }

    // Atualizar data do último login
    await Usuario.update(
      { dataUltimoLogin: new Date() },
      { where: { id: usuario.id } }
    );

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nivelDeAcesso: usuario.nivelDeAcesso,
      },
      process.env.SEGREDO || "chave_secreta_desenvolvimento",
      { expiresIn: "24h" }
    );

    return res.json({
      erro: false,
      mensagem: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        receberEmailEventos: usuario.receberEmailEventos,
        receberMensagensEventos: usuario.receberMensagensEventos,
        nivelDeAcesso: usuario.nivelDeAcesso,
        foto: usuario.foto,
      },
      token: token,
    });
  } catch (erro) {
    console.error("❌ Erro no login:", erro);
    res.status(500).json({
      erro: true,
      mensagem: "Erro interno do servidor",
    });
  }
};

const loginComGoogle = async (req, res) => {
  try {
    await garantirAdminFixo();

    const { nome, email, googleId, foto, googleToken } = req.body;

    console.log("📧 Login Google recebido:", { nome, email, googleId, foto });

    if (!nome || !email) {
      return res.status(400).json({
        erro: true,
        mensagem: "Nome e email são obrigatórios",
      });
    }

    let usuario = await Usuario.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      const senhaPadrao =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

      usuario = await Usuario.create({
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha: senhaCriptografada,
        googleId: googleId,
        foto: foto,
        receberEmailEventos: true,
        receberMensagensEventos: true,
        nivelDeAcesso: "usuario",
        ativo: true,
        dataUltimoLogin: new Date(),
      });

      console.log("✅ Novo usuário criado via Google:", usuario.email);
    } else {
      // Atualizar dados do Google se necessário
      const atualizacoes = {};
      if (foto && foto !== usuario.foto) atualizacoes.foto = foto;
      if (googleId && googleId !== usuario.googleId)
        atualizacoes.googleId = googleId;
      atualizacoes.dataUltimoLogin = new Date();

      if (Object.keys(atualizacoes).length > 0) {
        await Usuario.update(atualizacoes, { where: { id: usuario.id } });
        // Recarregar dados atualizados
        usuario = await Usuario.findOne({ where: { id: usuario.id } });
      }

      console.log("✅ Usuário existente logado via Google:", usuario.email);
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nivelDeAcesso: usuario.nivelDeAcesso,
      },
      process.env.SEGREDO || "chave_secreta_desenvolvimento",
      { expiresIn: "24h" }
    );

    res.json({
      erro: false,
      mensagem: "Login com Google realizado com sucesso!",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        receberEmailEventos: usuario.receberEmailEventos,
        receberMensagensEventos: usuario.receberMensagensEventos,
        nivelDeAcesso: usuario.nivelDeAcesso,
        foto: usuario.foto,
      },
      token: token,
    });
  } catch (error) {
    console.error("❌ Erro no login Google:", error);
    res.status(500).json({
      erro: true,
      mensagem: "Erro interno do servidor: " + error.message,
    });
  }
};

const encontrarUsuario = async (req, res) => {
  try {
    await garantirAdminFixo();

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido",
      });
    }

    const usuario = await Usuario.findOne({
      where: { id },
      attributes: [
        "id",
        "nome",
        "email",
        "telefone",
        "receberEmailEventos",
        "receberMensagensEventos",
        "nivelDeAcesso",
        "foto",
        "ativo",
        "dataUltimoLogin",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!usuario) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado",
      });
    }

    return res.json({
      erro: false,
      usuario: usuario,
    });
  } catch (erro) {
    console.error("❌ Erro ao buscar usuário:", erro);
    res.status(500).json({
      erro: true,
      mensagem: "Ocorreu um erro ao buscar o usuário.",
    });
  }
};

const procurarUsuarios = async (req, res) => {
  try {
    await garantirAdminFixo();

    const usuarios = await Usuario.findAll({
      attributes: [
        "id",
        "nome",
        "email",
        "telefone",
        "receberEmailEventos",
        "receberMensagensEventos",
        "nivelDeAcesso",
        "foto",
        "ativo",
        "dataUltimoLogin",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log(`📋 Listando ${usuarios.length} usuários`);

    return res.json({
      erro: false,
      usuarios: usuarios,
      total: usuarios.length,
    });
  } catch (erro) {
    console.error("❌ Erro ao listar usuários:", erro);
    res.status(500).json({
      erro: true,
      mensagem: "Ocorreu um erro ao listar os usuários.",
    });
  }
};

const deletarUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido",
      });
    }

    const usuario = await Usuario.findOne({ where: { id } });
    if (usuario && usuario.email === ADMIN_FIXO.email.toLowerCase().trim()) {
      return res.status(403).json({
        erro: true,
        mensagem: "Não é possível excluir o administrador fixo do sistema",
      });
    }

    const resultado = await Usuario.destroy({ where: { id } });

    if (resultado === 0) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado",
      });
    }

    res.json({
      erro: false,
      mensagem: "Usuário deletado com sucesso!",
    });
    console.log(`🗑️ Usuário ID ${id} deletado`);
  } catch (erro) {
    console.error("❌ Erro ao deletar usuário:", erro);
    res.status(500).json({
      erro: true,
      mensagem: "Ocorreu um erro ao deletar o usuário.",
    });
  }
};

const modificarDadosUsuario = async (req, res) => {
  const {
    nome,
    senha,
    email,
    telefone,
    receberEmailEventos,
    receberMensagensEventos,
    foto,
    nivelDeAcesso, 
  } = req.body;

  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido",
      });
    }

    // Verificar se o usuário existe
    const usuarioExistente = await Usuario.findOne({ where: { id } });
    if (!usuarioExistente) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado",
      });
    }

    // Verificar se está tentando alterar o admin fixo
    if (usuarioExistente.email === ADMIN_FIXO.email.toLowerCase().trim()) {
      return res.status(403).json({
        erro: true,
        mensagem: "Não é possível alterar o administrador fixo do sistema",
      });
    }

    const dadosParaAtualizar = {};

    if (nome) dadosParaAtualizar.nome = nome.trim();

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          erro: true,
          mensagem: "Por favor, insira um email válido",
        });
      }

      // Verificar se o novo email já existe em outro usuário
      const emailJaExiste = await Usuario.findOne({
        where: {
          email: email.toLowerCase().trim(),
          id: { [require("sequelize").Op.ne]: id }, // Excluir o usuário atual
        },
      });

      if (emailJaExiste) {
        return res.status(400).json({
          erro: true,
          mensagem: "Este email já está sendo usado por outro usuário",
        });
      }

      dadosParaAtualizar.email = email.toLowerCase().trim();
    }

    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({
          erro: true,
          mensagem: "A senha deve ter pelo menos 6 caracteres",
        });
      }
      dadosParaAtualizar.senha = await bcrypt.hash(senha, 10);
    }

    // Validação e atualização do nível de acesso
    if (nivelDeAcesso) {
      const niveisPermitidos = [
        "administrador",
        "subAdministrador",
        "contribuinte",
        "usuario",
      ];
      if (!niveisPermitidos.includes(nivelDeAcesso)) {
        return res.status(400).json({
          erro: true,
          mensagem:
            "Nível de acesso deve ser: administrador, subAdministrador, contribuinte ou usuario",
        });
      }
      dadosParaAtualizar.nivelDeAcesso = nivelDeAcesso;
      console.log(
        `🔑 Alterando nível de acesso do usuário ${id} para: ${nivelDeAcesso}`
      );
    }

    // Novos campos
    if (telefone !== undefined) {
      if (telefone && !validarTelefone(telefone)) {
        return res.status(400).json({
          erro: true,
          mensagem: "Telefone deve estar no formato válido",
        });
      }
      dadosParaAtualizar.telefone = limparTelefone(telefone);
    }

    if (receberEmailEventos !== undefined) {
      dadosParaAtualizar.receberEmailEventos = Boolean(receberEmailEventos);
    }

    if (receberMensagensEventos !== undefined) {
      dadosParaAtualizar.receberMensagensEventos = Boolean(
        receberMensagensEventos
      );
    }

    if (foto !== undefined) {
      dadosParaAtualizar.foto = foto;
    }

    if (Object.keys(dadosParaAtualizar).length === 0) {
      return res.status(400).json({
        erro: true,
        mensagem: "Nenhum dado para atualizar",
      });
    }

    console.log(`📝 Atualizando usuário ${id} com dados:`, dadosParaAtualizar);

    const [numeroDeRegistrosAtualizados] = await Usuario.update(
      dadosParaAtualizar,
      {
        where: { id },
      }
    );

    if (numeroDeRegistrosAtualizados === 0) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado ou nenhuma alteração foi feita",
      });
    }

    // Retornar usuário atualizado
    const usuarioAtualizado = await Usuario.findOne({
      where: { id },
      attributes: [
        "id",
        "nome",
        "email",
        "telefone",
        "receberEmailEventos",
        "receberMensagensEventos",
        "nivelDeAcesso",
        "foto",
        "ativo",
      ],
    });

    res.json({
      erro: false,
      mensagem: "Usuário alterado com sucesso!",
      usuario: usuarioAtualizado,
    });

    console.log(`✅ Usuário ID ${id} atualizado com sucesso`);
  } catch (erro) {
    console.error("❌ Erro ao alterar usuário:", erro);

    if (erro.name === "SequelizeValidationError") {
      return res.status(400).json({
        erro: true,
        mensagem: erro.errors[0].message,
      });
    }

    if (erro.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        erro: true,
        mensagem: "Este email já está sendo usado por outro usuário",
      });
    }

    res.status(500).json({
      erro: true,
      mensagem: "Ocorreu um erro ao alterar o usuário.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// 🚀 INICIALIZAÇÃO DO SISTEMA
// ═══════════════════════════════════════════════════════════════
const inicializarSistema = async () => {
  try {
    console.log("🔄 Inicializando sistema com novos campos...");
    await garantirAdminFixo();
    console.log("✅ Sistema inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro na inicialização do sistema:", error);
  }
};

inicializarSistema();

module.exports = {
  cadastrarUsuario,
  encontrarUsuario,
  procurarUsuarios,
  deletarUsuario,
  modificarDadosUsuario,
  autenticarUsuario,
  loginComGoogle,
  garantirAdminFixo,
  inicializarSistema,
};
