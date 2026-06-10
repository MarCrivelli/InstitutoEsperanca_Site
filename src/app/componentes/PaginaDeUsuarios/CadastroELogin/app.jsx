"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./cadastroELogin.module.css";
import HeaderVisitantes from "../../Visitantes/HeaderVisitantes/app";

export default function CadastroELogin({ onLoginSucesso }) {
  const googleButtonCadastroRef = useRef(null);
  const googleButtonLoginRef = useRef(null);

  const [painelDireitoAtivo, setPainelDireitoAtivo] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Estado para os formulários de login/cadastro
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  // Inicializar Google Login
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    console.log("🌐 URL atual:", window.location.origin);
    console.log(
      "🔑 Client ID:",
      "173898638940-la9trlrtts8ngmsj8t2mv455og5s8g86.apps.googleusercontent.com"
    );

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "173898638940-la9trlrtts8ngmsj8t2mv455og5s8g86.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });

        if (googleButtonCadastroRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonCadastroRef.current,
            {
              theme: "outline",
              size: "large",
              text: "signup_with",
              shape: "rectangular",
              width: 280,
            }
          );
        }

        if (googleButtonLoginRef.current) {
          window.google.accounts.id.renderButton(googleButtonLoginRef.current, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: 280,
          });
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [painelDireitoAtivo]);

  // Função para lidar com a resposta do Google
  const handleGoogleResponse = async (response) => {
    try {
      const decoded = parseJwt(response.credential);
      console.log("Dados do Google:", decoded);

      const dadosGoogle = {
        nome: decoded.name,
        email: decoded.email,
        foto: decoded.picture,
        googleId: decoded.sub,
      };

      await processarLoginGoogle(dadosGoogle, response.credential);
    } catch (error) {
      console.error("Erro ao processar login do Google:", error);
      alert("Erro ao fazer login com Google");
    }
  };

  const processarLoginGoogle = async (dadosGoogle, token) => {
    setCarregando(true);

    try {
      const urlApi = `${import.meta.env.VITE_API_URL}`;

      const resposta = await fetch(`${urlApi}/login-google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: dadosGoogle.nome,
          email: dadosGoogle.email,
          googleId: dadosGoogle.googleId,
          foto: dadosGoogle.foto,
          googleToken: token,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        alert("Login com Google realizado com sucesso!");

        const dadosParaSalvar = {
          ...dados.usuario,
          foto: dadosGoogle.foto,
        };

        onLoginSucesso(dadosParaSalvar, dados.token);
      } else {
        alert(`Erro: ${dados.mensagem || "Erro ao fazer login com Google"}`);
      }
    } catch (erro) {
      console.error("Erro ao processar login do Google:", erro);
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // Decodificar JWT do Google
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const alterarEmail = (novoEmail) => {
    setUsuario((valoresAnteriores) => ({
      ...valoresAnteriores,
      email: novoEmail,
    }));
  };

  const alterarSenha = (novaSenha) => {
    setUsuario((valoresAnteriores) => ({
      ...valoresAnteriores,
      senha: novaSenha,
    }));
  };

  const manipularCadastro = async (evento) => {
    evento.preventDefault();

    if (!usuario.nome || !usuario.email || !usuario.senha) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    if (usuario.senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setCarregando(true);

    try {
      const urlApi = `${import.meta.env.VITE_API_URL}`;

      const resposta = await fetch(`${urlApi}/cadastro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: usuario.nome,
          email: usuario.email,
          senha: usuario.senha,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        if (dados.loginAutomatico && dados.token) {
          alert(`${dados.mensagem}`);
          onLoginSucesso(dados.usuario, dados.token);
        } else {
          alert("Usuário cadastrado com sucesso!");
          setPainelDireitoAtivo(false);
        }
        setUsuario({ nome: "", email: "", senha: "" });
      } else {
        alert(`Erro: ${dados.mensagem || "Erro desconhecido"}`);
      }
    } catch (erro) {
      console.error("Erro ao cadastrar o usuário:", erro);
      alert("Erro de conexão. Verifique se o servidor está rodando.");
    } finally {
      setCarregando(false);
    }
  };

  const manipularLogin = async (evento) => {
    evento.preventDefault();

    if (!usuario.email || !usuario.senha) {
      alert("Por favor, preencha email e senha");
      return;
    }

    setCarregando(true);

    try {
      const urlApi = `${import.meta.env.VITE_API_URL}`;

      const resposta = await fetch(`${urlApi}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuario.email,
          senha: usuario.senha,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        alert("Login realizado com sucesso!");
        onLoginSucesso(dados.usuario, dados.token);
        setUsuario({ nome: "", email: "", senha: "" });
      } else {
        alert(`Erro: ${dados.mensagem || "Email ou senha incorretos"}`);
      }
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      alert("Erro de conexão. Verifique se o servidor está rodando.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <HeaderVisitantes tipo="modoDark" />
      <div className={styles.alinharFormulario}>
        <div
          className={`${styles.containerAutenticacao} ${
            painelDireitoAtivo ? styles.painelAtivo : ""
          }`}
        >
          {/* Formulário de Cadastro */}
          <div
            className={`${styles.painelFormulario} ${styles.painelCadastro}`}
          >
            <form
              className={styles.formulario}
              onSubmit={manipularCadastro}
            >
              <h1 className={styles.tituloFormulario}>Crie sua Conta</h1>

              <div
                style={{
                  margin: "20px 0",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div ref={googleButtonCadastroRef}></div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "20px 0",
                  color: "#666",
                }}
              >
                <hr
                  style={{
                    flex: 1,
                    border: "none",
                    borderTop: "1px solid #ccc",
                  }}
                />
                <span style={{ padding: "0 15px", fontSize: "14px" }}>
                  ou
                </span>
                <hr
                  style={{
                    flex: 1,
                    border: "none",
                    borderTop: "1px solid #ccc",
                  }}
                />
              </div>

              <input
                className={styles.campoInput}
                type="text"
                placeholder="Digite seu nome de usuário"
                value={usuario.nome}
                onChange={(e) =>
                  setUsuario({ ...usuario, nome: e.target.value })
                }
                disabled={carregando}
                required
              />

              <input
                className={styles.campoInput}
                type="email"
                placeholder="Digite seu e-mail"
                value={usuario.email}
                onChange={(e) => alterarEmail(e.target.value)}
                disabled={carregando}
                required
              />

              <input
                className={styles.campoInput}
                type="password"
                placeholder="Digite sua senha (min. 6 caracteres)"
                value={usuario.senha}
                onChange={(e) => alterarSenha(e.target.value)}
                disabled={carregando}
                required
                minLength="6"
              />

              <button
                className={styles.botaoPrincipal}
                type="submit"
                disabled={carregando}
              >
                {carregando ? "Cadastrando..." : "Cadastrar e Entrar"}
              </button>
            </form>
          </div>

          {/* Formulário de login */}
          <div
            className={`${styles.painelFormulario} ${styles.painelLogin}`}
          >
            <form className={styles.formulario} onSubmit={manipularLogin}>
              <h1 className={styles.tituloFormulario}>Fazer Login</h1>

              <div
                style={{
                  margin: "20px 0",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div ref={googleButtonLoginRef}></div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "20px 0",
                  color: "#666",
                }}
              >
                <hr
                  style={{
                    flex: 1,
                    border: "none",
                    borderTop: "1px solid #ccc",
                  }}
                />
                <span style={{ padding: "0 15px", fontSize: "14px" }}>
                  ou
                </span>
                <hr
                  style={{
                    flex: 1,
                    border: "none",
                    borderTop: "1px solid #ccc",
                  }}
                />
              </div>

              <input
                className={styles.campoInput}
                type="email"
                placeholder="Digite seu e-mail"
                value={usuario.email}
                onChange={(e) => alterarEmail(e.target.value)}
                disabled={carregando}
                required
              />

              <input
                className={styles.campoInput}
                type="password"
                placeholder="Digite sua senha"
                value={usuario.senha}
                onChange={(e) => alterarSenha(e.target.value)}
                disabled={carregando}
                required
              />

              <button
                className={styles.botaoPrincipal}
                type="submit"
                disabled={carregando}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>

          <div className={styles.containerOverlay}>
            <div className={styles.overlay}>
              <div
                className={`${styles.painelOverlay} ${styles.painelOverlayEsquerdo}`}
              >
                <h1 className={styles.tituloFormulario}>
                  Bem Vindo De Volta!
                </h1>
                <p className={styles.textoFormulario}>
                  Para se manter conectado conosco, faça login com sua
                  conta.
                </p>
                <button
                  className={`${styles.botaoPrincipal} ${styles.botaoSecundario}`}
                  onClick={() => setPainelDireitoAtivo(false)}
                  type="button"
                  disabled={carregando}
                >
                  Logar
                </button>
              </div>

              <div
                className={`${styles.painelOverlay} ${styles.painelOverlayDireito}`}
              >
                <h1 className={styles.tituloFormulario}>
                  Ainda não tem conta?
                </h1>
                <p className={styles.textoFormulario}>
                  Cadastre-se e seja automaticamente logado! Fique por
                  dentro de todas as dicas e informações que o Instituto tem
                  a oferecer!
                </p>
                <button
                  className={`${styles.botaoPrincipal} ${styles.botaoSecundario}`}
                  onClick={() => setPainelDireitoAtivo(true)}
                  type="button"
                  disabled={carregando}
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}