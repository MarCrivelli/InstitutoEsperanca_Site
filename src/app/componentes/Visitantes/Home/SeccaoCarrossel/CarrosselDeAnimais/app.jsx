//================ Importações externas ================//
import { useState, useEffect } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

//================ Minhas importações ================//
import styles from "./carrosselAnimais.module.css";

export default function CarrosselDeAnimaisVisitantes({ ehMobile }) {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [estadosAntesDepois, setEstadosAntesDepois] = useState({});

  useEffect(() => {
    carregarAnimaisCarrossel();
  }, []);

  const carregarAnimaisCarrossel = async () => {
    try {
      setCarregando(true);
      setErro("");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/carrossel/animais`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Dados recebidos do carrossel:", data);

      // Processar dados para o formato esperado pelo carrossel de visitantes
      const animaisProcessados = Array.isArray(data.data) 
        ? data.data
            .filter(item => item?.animal) // Filtrar apenas itens válidos
            .map(item => ({
              id: item.animal.id,
              nome: item.animal.nome || "Animal sem nome",
              antes: item.animal.imagemEntrada 
                ? `${import.meta.env.VITE_API_URL}/uploads/${item.animal.imagemEntrada}`
                : "paraErros/semImagem.png",
              depois: item.animal.imagemSaida 
                ? `${import.meta.env.VITE_API_URL}/uploads/${item.animal.imagemSaida}`
                : "paraErros/semImagem.png",
              descricaoAntes: item.animal.descricaoEntrada || "Sem descrição de entrada",
              descricaoDepois: item.descricaoSaida || item.animal.descricaoSaida || "Sem descrição de saída"
            }))
        : [];

      console.log("Animais processados:", animaisProcessados);
      setAnimais(animaisProcessados);

      // Inicializar estados antes/depois para todos os animais
      const estadosIniciais = animaisProcessados.reduce((acc, animal) => {
        acc[animal.id] = true; // true = antes, false = depois
        return acc;
      }, {});
      setEstadosAntesDepois(estadosIniciais);

    } catch (error) {
      console.error("Erro ao carregar animais do carrossel:", error);
      setErro("Erro ao carregar os animais. Tente novamente mais tarde.");
      setAnimais([]);
      setEstadosAntesDepois({});
    } finally {
      setCarregando(false);
    }
  };

  const alternarAntesDepois = (animalId) => {
    setEstadosAntesDepois(prev => ({
      ...prev,
      [animalId]: !prev[animalId]
    }));
  };

  // Estado de carregamento
  if (carregando) {
    return (
      <div className={styles.containerCarregamento}>
        <img 
          src="paraErros/carregando.svg" 
          alt="Carregando animais..." 
          className={styles.iconeCarregamento}
        />
        <p>Carregando animais...</p>
      </div>
    );
  }

  // Estado de erro
  if (erro) {
    return (
      <div className={styles.containerErro}>
        <p className={styles.mensagemErro}>{erro}</p>
        <button 
          onClick={carregarAnimaisCarrossel}
          className={styles.botaoTentarNovamente}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Se não há animais no carrossel
  if (animais.length === 0) {
    return (
      <div className={styles.containerVazio}>
        <p className={styles.mensagemVazia}>
          Ainda não há animais cadastrados no carrossel.
        </p>
      </div>
    );
  }

  return (
    <Carousel
      showArrows={!ehMobile}
      showIndicators={!ehMobile}
      showThumbs={false}
      showStatus={false}
      infiniteLoop={true}
      swipeable={true}
      emulateTouch={true}
      preventMovementUntilSwipeScrollTolerance={true}
      swipeScrollTolerance={40}
      renderArrowPrev={
        ehMobile
          ? () => null
          : (onClickHandler, hasPrev, label) => (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className={`${styles.setaCarrossel} ${styles.setaEsquerda}`}
                disabled={!hasPrev}
              >
                <FaChevronLeft />
              </button>
            )
      }
      renderArrowNext={
        ehMobile
          ? () => null
          : (onClickHandler, hasNext, label) => (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className={`${styles.setaCarrossel} ${styles.setaDireita}`}
                disabled={!hasNext}
              >
                <FaChevronRight />
              </button>
            )
      }
    >
      {animais.map((animal) => (
        <div key={animal.id} className={styles.itemCarrosselAnimal}>
          <div className={styles.conteudoAnimal}>
            
            <div className={styles.containerImagem}>
              <h2>{estadosAntesDepois[animal.id] ? "Antes" : "Depois"}</h2>
              <img
                src={estadosAntesDepois[animal.id] ? animal.antes : animal.depois}
                alt={`${animal.nome} ${
                  estadosAntesDepois[animal.id] ? "antes" : "depois"
                }`}
                className={styles.imagemAnimal}
                onError={(e) => {
                  e.target.src = "paraErros/semImagem.png";
                  e.target.onerror = null;
                }}
              />
            </div>

            <div className={styles.containerDescricao}>
              <h1>{animal.nome}</h1>
              <p className={styles.descricaoAnimal}>
                {estadosAntesDepois[animal.id]
                  ? animal.descricaoAntes
                  : animal.descricaoDepois}
              </p>
              <button
                className={styles.botaoProximo}
                onClick={() => alternarAntesDepois(animal.id)}
              >
                {estadosAntesDepois[animal.id] ? "Próxima imagem" : "Imagem anterior"}
              </button>
            </div>

          </div>
        </div>
      ))}
    </Carousel>
  );
}