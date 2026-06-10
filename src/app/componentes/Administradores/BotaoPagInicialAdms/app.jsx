import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./botaoPagInicialAdms.module.css";

export default function BotaoPagInicial() {
  const [clicked, setClicked] = useState(false); // Rastrea o clique no botão
  const [isMobile, setIsMobile] = useState(false); // Detecta dispositivos móveis
  const navigate = useNavigate(); // Para redirecionamento

  // Detecta dispositivos móveis com base no tamanho da tela
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1100); // Define dispositivo móvel para telas menores que 1100px
    };

    checkIfMobile(); // Checa ao carregar o componente
    window.addEventListener("resize", checkIfMobile); // Atualiza em caso de redimensionamento

    return () => {
      window.removeEventListener("resize", checkIfMobile); // Remove o evento ao desmontar
    };
  }, []);

  const handleClick = () => {
    if (isMobile) {
      // Comportamento para dispositivos móveis
      if (!clicked) {
        setClicked(true); // Primeiro clique ativa a animação
        setTimeout(() => setClicked(false), 2000); // Reseta após 2 segundos
        return; // Impede o redirecionamento no primeiro clique
      }
    }
  
    // Redireciona no segundo clique ou para desktops
    navigate("/");
  };
  

  return (
    <div className={styles.linkBotaoSolto} >
      <div
        className={`${styles.botaoPagInicial} ${
          clicked && isMobile ? styles.active : ""
        }`}
        onClick={handleClick}
      >
        <img src="homeAdms/home.png" alt="Ícone de Página Inicial" />
      </div>
    </div>
  );
}
