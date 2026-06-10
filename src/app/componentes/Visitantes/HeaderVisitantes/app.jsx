import styles from "./headerVisitantes.module.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function HeaderVisitantes({ tipo = "padrao" }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Configurações para cada tipo de header
  const tiposConfig = {
    padrao: {
      logoSrc: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
      headerClass: styles.headerPadrao,
      linksClass: styles.linksPadrao,
      hamburguerClass: styles.hamburguerPadrao,
    },
    linkPreto: {
      logoSrc: `${import.meta.env.BASE_URL}logos/logoPreta.png`,
      headerClass: styles.headerLinkPreto,
      linksClass: styles.linksPreto,
      hamburguerClass: styles.hamburguerPreto,
    },
    modoDark: {
      logoSrc: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
      headerClass: styles.headerModoDark,
      linksClass: styles.linksModoDark,
      hamburguerClass: styles.hamburguerModoDark,
    },
  };

  const config = tiposConfig[tipo] || tiposConfig.padrao;

  useEffect(() => {
    const carregarUsuario = () => {
      try {
        const dadosUsuario = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        if (dadosUsuario && token) {
          const usuario = JSON.parse(dadosUsuario);
          setUsuarioLogado(usuario);
          console.log("👤 Usuário logado carregado:", usuario);
        } else {
          console.log("❌ Nenhum usuário logado encontrado");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    carregarUsuario();
  }, []);

  // Fecha o menu quando a tela for redimensionada para mais de 700px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700) {
        setMenuAberto(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Impede rolagem quando o menu está aberto
  useEffect(() => {
    if (menuAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuAberto]);

  return (
    <>
      <header className={`${styles.headerVisitantes} ${config.headerClass}`}>
        <Link className={styles.linkLogo} to="/" title="Instituto Esperança">
          <img
            src={config.logoSrc}
            className={styles.logo}
            alt="Logo do Instituto Esperança"
          />
        </Link>

        <nav className={styles.nav}>
          <ul className={styles.menu} role="menu">
            <li>
              <Link
                to="/quero_adotar"
                className={`${styles.linkSubPaginas} ${config.linksClass}`}
              >
                Quero adotar!
              </Link>
            </li>
            <li>
              <Link
                to="/como_doar"
                className={`${styles.linkSubPaginas} ${config.linksClass}`}
              >
                Como doar?
              </Link>
            </li>
            <li>
              <Link
                to="/denuncie"
                className={`${styles.linkSubPaginas} ${config.linksClass}`}
              >
                Denuncie
              </Link>
            </li>
            <li>
              <Link
                to="/saude_unica"
                className={`${styles.linkSubPaginas} ${config.linksClass}`}
              >
                Saúde única
              </Link>
            </li>
            <li>
              <Link
                className={styles.linkUsuario}
                to="/autenticar"
                title={
                  usuarioLogado
                    ? `Logado como: ${usuarioLogado.nome}`
                    : "Fazer login"
                }
              >
                <img
                  src={usuarioLogado?.foto || `${import.meta.env.BASE_URL}user.png`}
                  alt="perfil"
                  className={styles.iconeUsuario}
                />
              </Link>
            </li>
            <li>
              <button
                className={styles.btnMobile}
                onClick={() => setMenuAberto(!menuAberto)}
                aria-label="Menu"
              >
                <span
                  className={`${styles.hamburguerVisitantes} ${config.hamburguerClass}`}
                ></span>
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Overlay escuro */}
      {menuAberto && (
        <div className={styles.overlay} onClick={() => setMenuAberto(false)} />
      )}

      {/* Menu lateral */}
      <div
        className={`${styles.menuLateral} ${
          menuAberto ? styles.menuAberto : ""
        } ${tipo === "modoDark" ? styles.menuLateralDark : ""}`}
      >
        {/* Botão de fechar */}
        <button
          className={styles.botaoFechar}
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu"
        >
          ×
        </button>

        <nav>
          <ul>
            <li>
              <Link
                to="/quero_adotar"
                className={styles.linkMenuMobile}
                onClick={() => setMenuAberto(false)}
              >
                Quero adotar!
              </Link>
            </li>
            <li>
              <Link
                to="/como_doar"
                className={styles.linkMenuMobile}
                onClick={() => setMenuAberto(false)}
              >
                Como doar?
              </Link>
            </li>
            <li>
              <Link
                to="/denuncie"
                className={styles.linkMenuMobile}
                onClick={() => setMenuAberto(false)}
              >
                Denuncie
              </Link>
            </li>
            <li>
              <Link
                to="/saude_unica"
                className={styles.linkMenuMobile}
                onClick={() => setMenuAberto(false)}
              >
                Saúde única
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
