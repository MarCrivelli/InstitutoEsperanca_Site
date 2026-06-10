import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./botaoPagInicialVisitantes.module.css";

export default function BotaoParaPaginaDeAdms() {
  const [clicked, setClicked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [usuarioAutorizado, setUsuarioAutorizado] = useState(false);
  const navigate = useNavigate();

  // Detecta dispositivos móveis com base no tamanho da tela
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1100);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Verifica se o usuário tem permissão para ver o botão
  useEffect(() => {
    const verificarPermissao = () => {
      try {
        const dadosUsuario = localStorage.getItem("usuario");
        
        if (!dadosUsuario) {
          setUsuarioAutorizado(false);
          return;
        }

        const usuario = JSON.parse(dadosUsuario);
        const niveisAutorizados = ["contribuinte", "subAdministrador", "administrador"];
        
        // Verifica se o nível de acesso do usuário está na lista de autorizados
        if (usuario.nivelDeAcesso && niveisAutorizados.includes(usuario.nivelDeAcesso)) {
          setUsuarioAutorizado(true);
        } else {
          setUsuarioAutorizado(false);
        }
      } catch (error) {
        console.error("Erro ao verificar permissão do usuário:", error);
        setUsuarioAutorizado(false);
      }
    };

    verificarPermissao();

    // Verificar periodicamente se o usuário ainda está logado
    const intervalo = setInterval(verificarPermissao, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(intervalo);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      if (!clicked) {
        setClicked(true);
        setTimeout(() => setClicked(false), 2000);
        return;
      }
    }
  
    navigate("/administracao");
  };

  // Não renderiza nada se o usuário não tiver permissão
  if (!usuarioAutorizado) {
    return null;
  }

  return (
    <div className={styles.linkBotaoSolto}>
      <div
        className={`${styles.botaoPagInicial} ${
          clicked && isMobile ? styles.active : ""
        }`}
        onClick={handleClick}
      >
        <img src={`${import.meta.env.BASE_URL}logos/logoBranca.png`} alt="Ícone de Página Inicial" />
      </div>
    </div>
  );
}