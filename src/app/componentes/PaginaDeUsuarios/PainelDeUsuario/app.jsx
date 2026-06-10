"use client";

//================ Importações externas ================//
import { useState, useEffect, useRef } from "react";
import Select from "react-select";

//================ Minhas importações ================//
import styles from "./painelUsuario.module.css";
import HeaderVisitantes from "../../Visitantes/HeaderVisitantes/app";
import opcoes from "/src/app/componentes/Administradores/OpcoesDeSelecao/opcoes";

export default function PainelUsuario({
  usuarioLogado,
  funcaoDeslogarRequerida,
  onUsuarioAtualizado,
}) {
  //================ Estados do botões com switch ================//
  const [emailAtivado, setEmailAtivado] = useState(
    usuarioLogado?.receberEmailEventos || false,
  );
  const [whatsappAtivado, setWhatsappAtivado] = useState(
    usuarioLogado?.receberMensagensEventos || false,
  );

  //================ Estados para exclusão de conta ================//
  const [overlayExclusaoAtivo, setOverlayExclusaoAtivo] = useState(false);
  const [dadosExclusao, setDadosExclusao] = useState({
    nome: "",
    email: "",
  });
  const [carregandoExclusao, setCarregandoExclusao] = useState(false);

  //================ Estados para Google Login ================//
  const googleButtonRef = useRef(null);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const [googleScriptCarregado, setGoogleScriptCarregado] = useState(false);

  //================ useEffect para sincronizar estados com usuário ================//
  useEffect(() => {
    if (usuarioLogado) {
      setEmailAtivado(usuarioLogado.receberEmailEventos || false);
      setWhatsappAtivado(usuarioLogado.receberMensagensEventos || false);
    }
  }, [usuarioLogado]);

  //================ useEffect para Google Login ================//
  useEffect(() => {
    const carregarGoogleScript = async () => {
      // Verificar se já existe o script
      if (document.querySelector('script[src*="accounts.google.com"]')) {
        setGoogleScriptCarregado(true);
        return;
      }

      // Verificar se o token ainda é válido antes de carregar
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] ||
        sessionStorage.getItem("token") ||
        new URLSearchParams(window.location.search).get("token");

      if (!token) {
        console.warn("Token não encontrado para Google Login");
        return;
      }

      try {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log("Google Script carregado");
          setGoogleScriptCarregado(true);
        };

        script.onerror = () => {
          console.error("Erro ao carregar script do Google");
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("Erro ao adicionar script do Google:", error);
      }
    };

    carregarGoogleScript();
  }, []);

  //================ useEffect para inicializar botão Google ================//
  useEffect(() => {
    if (googleScriptCarregado && !usuarioLogado?.googleId && window.google) {
      initializeGoogleButton();
    }
  }, [googleScriptCarregado, usuarioLogado?.googleId]);

  //================ Função para inicializar botão do Google ================//
  const initializeGoogleButton = () => {
    if (googleButtonRef.current && window.google) {
      googleButtonRef.current.innerHTML = "";

      try {
        window.google.accounts.id.initialize({
          client_id:
            "173898638940-la9trlrtts8ngmsj8t2mv455og5s8g86.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "medium",
          text: "signin_with",
          shape: "rectangular",
          width: 200,
        });

        console.log("Botão Google inicializado");
      } catch (error) {
        console.error("Erro ao inicializar botão do Google:", error);
      }
    }
  };

  //================ Função para lidar com resposta do Google ================//
  const handleGoogleResponse = async (response) => {
    setCarregandoGoogle(true);
    try {
      const decoded = parseJwt(response.credential);
      const dadosGoogle = {
        nome: decoded.name,
        email: decoded.email,
        foto: decoded.picture,
        googleId: decoded.sub,
      };

      await processarLoginGoogle(dadosGoogle, response.credential);
    } catch (error) {
      console.error("Erro ao processar login do Google:", error);
    } finally {
      setCarregandoGoogle(false);
    }
  };

  //================ Função para processar login do Google ================//
  const processarLoginGoogle = async (dadosGoogle, token) => {
    try {
      const urlApi = "http://localhost:3003";
      const tokenAuth = obterToken();

      if (!tokenAuth) {
        console.error("Token de autenticação não encontrado");
        return;
      }

      const resposta = await fetch(`${urlApi}/usuarios/${usuarioLogado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAuth}`,
        },
        body: JSON.stringify({
          googleId: dadosGoogle.googleId,
          foto: dadosGoogle.foto,
        }),
      });

      const dados = await resposta.json();

      if (resposta.status === 401) {
        console.error("Sessão expirada");
        return;
      }

      if (resposta.ok && !dados.erro) {
        console.log("Conta conectada com Google com sucesso!");
        if (onUsuarioAtualizado && dados.usuario) {
          onUsuarioAtualizado(dados.usuario);
        }
      } else {
        console.error(
          `Erro: ${dados.mensagem || "Erro ao conectar com Google"}`,
        );
      }
    } catch (erro) {
      console.error("Erro ao conectar com Google:", erro);
    }
  };

  //================ Função para decodificar JWT do Google ================//
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  //================ Função para obter token de autenticação ================//
  const obterToken = () => {
    // Debug: verificar todas as fontes de token
    const localStorageToken = localStorage.getItem("token");
    const sessionStorageToken = sessionStorage.getItem("token");
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    console.log("Debug - Tokens disponíveis:");
    console.log("localStorage:", localStorageToken ? "EXISTS" : "NULL");
    console.log("sessionStorage:", sessionStorageToken ? "EXISTS" : "NULL");
    console.log("cookie:", cookieToken ? "EXISTS" : "NULL");

    // Tentar múltiplas fontes de token
    const token = localStorageToken || sessionStorageToken || cookieToken;

    if (!token) {
      console.error("NENHUM TOKEN ENCONTRADO EM LUGAR ALGUM!");
      console.log("localStorage keys:", Object.keys(localStorage));
      console.log("sessionStorage keys:", Object.keys(sessionStorage));
      console.log("document.cookie:", document.cookie);
    }

    return token;
  };

  //================ Debug da autenticação ================//
  useEffect(() => {
    console.log("=== DEBUG AUTENTICAÇÃO ===");
    console.log("usuarioLogado:", usuarioLogado);
    console.log("Token check:", obterToken() ? "EXISTE" : "NÃO EXISTE");

    // Verificar se o componente pai está passando as informações corretas
    if (!usuarioLogado) {
      console.error("PROBLEMA: usuarioLogado está undefined/null");
    }

    if (!funcaoDeslogarRequerida) {
      console.error("PROBLEMA: funcaoDeslogarRequerida não foi passada");
    }

    if (!onUsuarioAtualizado) {
      console.error("PROBLEMA: onUsuarioAtualizado não foi passada");
    }
  }, [usuarioLogado]);

  //================ Função para ativar ou desativar e-mail ================//
  const ativarEmail = async () => {
    const novoEstado = !emailAtivado;

    try {
      const urlApi = "http://localhost:3003";
      const token = obterToken();

      if (!token) {
        console.error("Token de autenticação não encontrado");
        return;
      }

      console.log(
        "Enviando requisição para:",
        `${urlApi}/usuarios/${usuarioLogado.id}`,
      );
      console.log("Token presente:", !!token);

      const resposta = await fetch(`${urlApi}/usuarios/${usuarioLogado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receberEmailEventos: novoEstado,
        }),
      });

      const dados = await resposta.json();
      console.log("Resposta da API:", dados);

      if (resposta.ok && !dados.erro) {
        setEmailAtivado(novoEstado);
        if (onUsuarioAtualizado && dados.usuario) {
          onUsuarioAtualizado(dados.usuario);
        }
      } else {
        console.error(
          `Erro: ${dados.mensagem || "Erro ao atualizar configuração"}`,
        );
      }
    } catch (erro) {
      console.error("Erro ao atualizar configuração de e-mail:", erro);
    }
  };

  //================ Função para ativar ou desativar mensagens ================//
  const ativarMensagensWhatsapp = async () => {
    const novoEstado = !whatsappAtivado;

    try {
      const urlApi = "http://localhost:3003";
      const token = obterToken();

      if (!token) {
        console.error("Token de autenticação não encontrado");
        return;
      }

      const resposta = await fetch(`${urlApi}/usuarios/${usuarioLogado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receberMensagensEventos: novoEstado,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        setWhatsappAtivado(novoEstado);
        if (onUsuarioAtualizado && dados.usuario) {
          onUsuarioAtualizado(dados.usuario);
        }
      } else {
        console.error(
          `Erro: ${dados.mensagem || "Erro ao atualizar configuração"}`,
        );
      }
    } catch (erro) {
      console.error("Erro ao atualizar configuração de WhatsApp:", erro);
    }
  };

  //================ Funções para exclusão de conta ================//
  const abrirOverlayExclusao = () => {
    setOverlayExclusaoAtivo(true);
    setDadosExclusao({ nome: "", email: "" });
  };

  const fecharOverlayExclusao = () => {
    setOverlayExclusaoAtivo(false);
    setDadosExclusao({ nome: "", email: "" });
  };

  const handleExcluirConta = async (evento) => {
    evento.preventDefault();

    // Validar se os dados digitados correspondem ao usuário logado
    if (
      dadosExclusao.nome.trim() !== usuarioLogado.nome.trim() ||
      dadosExclusao.email.trim().toLowerCase() !==
        usuarioLogado.email.trim().toLowerCase()
    ) {
      console.error("Os dados digitados não correspondem ao usuário logado!");
      return;
    }

    if (
      !window.confirm(
        "Esta ação é irreversível! Tem certeza que deseja excluir sua conta permanentemente?",
      )
    ) {
      return;
    }

    setCarregandoExclusao(true);

    try {
      const urlApi = "http://localhost:3003";
      const token = obterToken();

      if (!token) {
        console.error("Token de autenticação não encontrado");
        setCarregandoExclusao(false);
        return;
      }

      const resposta = await fetch(`${urlApi}/usuarios/${usuarioLogado.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        console.log("Conta excluída com sucesso!");
        onUsuarioAtualizado(null);
        setOverlayExclusaoAtivo(false);
      } else {
        console.error(`Erro: ${dados.mensagem || "Erro ao excluir conta"}`);
      }
    } catch (erro) {
      console.error("Erro ao excluir conta:", erro);
    } finally {
      setCarregandoExclusao(false);
    }
  };

  //================ Renderizar botão do Google ================//
  const renderizarBotaoGoogle = () => {
    if (usuarioLogado?.id) {
      // Usuário já está conectado

      return (
        <button
          className={`${styles.botaoDadoGoogle} ${styles.contaConectada}`}
          disabled
        >
          <img
            className={styles.iconeLog}
            src={`${import.meta.env.BASE_URL}pagAutenticacao/Google.png`}
            alt="Google"
          />
          <label className={styles.textoBotaoLog}>Conectado</label>
        </button>
      );
    }

    if (carregandoGoogle) {
      return (
        <button className={styles.botaoDadoGoogle} disabled>
          <img
            className={styles.iconeLog}
            src={`${import.meta.env.BASE_URL}pagAutenticacao/Google.png`}
            alt="Google"
          />
          <label className={styles.textoBotaoLog}>Conectando...</label>
        </button>
      );
    }

    if (!googleScriptCarregado) {
      return (
        <button className={styles.botaoDadoGoogle} disabled>
          <img
            className={styles.iconeLog}
            src={`${import.meta.env.BASE_URL}pagAutenticacao/Google.png`}
            alt="Google"
          />
          <label className={styles.textoBotaoLog}>Carregando Google...</label>
        </button>
      );
    }

    return (
      <div className={styles.containerBotaoGoogle}>
        <div ref={googleButtonRef}></div>
      </div>
    );
  };

  //================ Conteúdo do bloco DADOS DE USUÁRIO ================//
  const ConteudoDadosUsuario = (
    <>
      <div
        className={`${styles.alinharDadoEDescricaoDado} ${styles.excessaoIconeUsuario}`}
      >
        <p className={styles.descricaoDado}>Ícone de usuário</p>
        <div className={styles.espacamentoDado}>
          <img
            className={styles.iconeUsuario}
            src={usuarioLogado.foto || `${import.meta.env.BASE_URL}user.png`}
            alt="Avatar do usuário"
          />
        </div>
      </div>
      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>Nome</p>
        <div className={styles.espacamentoDado}>
          <input
            className={styles.inputDado}
            placeholder={usuarioLogado.nome}
          />
        </div>
      </div>
      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>E-mail</p>
        <div className={styles.espacamentoDado}>
          <input
            className={`${styles.inputDado} ${styles.dadoEmail}`}
            placeholder={usuarioLogado.email}
            disabled
          />
        </div>
      </div>
      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>Senha</p>
        <div className={styles.espacamentoDado}>
          <input
            className={styles.inputDado}
            type="password"
            placeholder="Digite a nova senha"
          />
        </div>
      </div>
      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>Telefone</p>
        <div className={styles.espacamentoDado}>
          <input
            className={styles.inputDado}
            placeholder={usuarioLogado.telefone || "Inserir número de telefone"}
          />
        </div>
      </div>
    </>
  );

  //================ Conteúdo do bloco CONFIGURAÇÕES ================//
  const ConteudoConfiguracoes = (
    <>
      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>Receber e-mails</p>
        <div className={styles.espacamentoDado}>
          <button
            className={`${styles.botaoComSwitch} ${
              emailAtivado ? styles.botaoAtivado : ""
            }`}
            onClick={ativarEmail}
          >
            <div className={styles.switch}></div>
          </button>
        </div>
      </div>
      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>Receber mensagens via Whatsapp</p>
        <div className={styles.espacamentoDado}>
          <button
            className={`${styles.botaoComSwitch} ${
              whatsappAtivado ? styles.botaoAtivado : ""
            }`}
            onClick={ativarMensagensWhatsapp}
          >
            <div className={styles.switch}></div>
          </button>
        </div>
      </div>

      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>Contas conectadas</p>

        <div className={`${styles.espacamentoDado} ${styles.seccaoContas}`}>
          {renderizarBotaoGoogle()}
        </div>
      </div>
      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>Sair da conta</p>
        <div className={styles.espacamentoDado}>
          <button
            className={`${styles.botaoDado} ${styles.botaoDeslogar}`}
            onClick={funcaoDeslogarRequerida}
          >
            Deslogar
          </button>
        </div>
      </div>
      <div className={styles.alinharDadoEDescricaoDado}>
        <p className={styles.descricaoDado}>Excluir conta</p>
        <div className={styles.espacamentoDado}>
          <button
            className={`${styles.botaoDado} ${styles.botaoExcluir}`}
            onClick={abrirOverlayExclusao}
          >
            Excluir
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className={styles.fundoDaPagina}>
        <HeaderVisitantes />
        <div className={`${styles.fundoBloco} ${styles.fundoBloco1}`}>
          <h1 className={styles.tituloPainel}>Dados de usuário</h1>
          <div className={styles.bloco}>
            {ConteudoDadosUsuario}
          </div>
        </div>
      </div>

      <div className={`${styles.fundoBloco} ${styles.fundoBloco2}`}>
        <h1 className={styles.tituloPainel}>Configurações</h1>
        <div className={styles.bloco}>
          {ConteudoConfiguracoes}
        </div>
      </div>

      {/* Overlay de Exclusão de Conta */}
      {overlayExclusaoAtivo && (
        <div className={styles.overlayExclusao}>
          <div className={styles.cardExclusao}>
            <h2 className={styles.tituloExclusao}>Excluir Conta</h2>
            <p className={styles.avisoExclusao}>
              Para confirmar a exclusão da sua conta, insira seu nome{" "}
              <span>&#40;{usuarioLogado.nome}&#41;</span> e e-mail{" "}
              <span>&#40;{usuarioLogado.email}&#41;</span> nos campos abaixo:
            </p>

            <form
              onSubmit={handleExcluirConta}
              className={styles.formularioExclusao}
            >
              <input
                type="text"
                placeholder="Digite seu nome completo"
                value={dadosExclusao.nome}
                onChange={(e) =>
                  setDadosExclusao({ ...dadosExclusao, nome: e.target.value })
                }
                className={styles.campoExclusao}
                required
                disabled={carregandoExclusao}
              />

              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={dadosExclusao.email}
                onChange={(e) =>
                  setDadosExclusao({ ...dadosExclusao, email: e.target.value })
                }
                className={styles.campoExclusao}
                required
                disabled={carregandoExclusao}
              />

              <div className={styles.botoesExclusao}>
                <button
                  type="button"
                  onClick={fecharOverlayExclusao}
                  className={styles.botaoExclusaoSecundario}
                  disabled={carregandoExclusao}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.botaoExclusaoPrincipal}
                  disabled={carregandoExclusao}
                >
                  {carregandoExclusao ? "Excluindo..." : "Confirmar Exclusão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
