import styles from "./botaoScroll.module.css";
import { useState, useEffect, useRef } from "react";

function RolarPCima() {
  const [mostrarBotao, setMostrarBotao] = useState(false);
  const ultimaPosicaoScroll = useRef(window.scrollY);
  const timeoutInatividade = useRef(null);

  const rolarParaTopo = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const verificarScroll = () => {
      const posicaoAtual = window.scrollY;
      const limiteScroll = window.innerHeight * 0.2;

      // Mostra/esconde o botão baseado na posição do scroll
      setMostrarBotao(posicaoAtual > limiteScroll);

      // Detecta quando o scroll para (mobile/desktop)
      clearTimeout(timeoutInatividade.current);
      timeoutInatividade.current = setTimeout(() => {
        if (posicaoAtual <= 5) { // Margem de 5px para overscroll
          setMostrarBotao(false);
        }
      }, 100); // Ajuste este tempo conforme necessário (100ms é padrão para "scroll parado")
      
      ultimaPosicaoScroll.current = posicaoAtual;
    };

    window.addEventListener("scroll", verificarScroll);
    return () => {
      window.removeEventListener("scroll", verificarScroll);
      clearTimeout(timeoutInatividade.current);
    };
  }, []);

  return (
    <button
      onClick={rolarParaTopo}
      className={`${styles.botaoScroll} ${mostrarBotao ? styles.visivel : ""}`}
      aria-label="Voltar ao topo"
    >
      <img 
        className={styles.imagemBotao} 
        src={`${import.meta.env.BASE_URL}SetaPCima.png`} 
        alt="Ícone de seta para cima" 
      />
    </button>
  );
}

export default RolarPCima;