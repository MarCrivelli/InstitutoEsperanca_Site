//================ Importações externas ================//
import { useState, useEffect } from "react";
import api from "../../../../../../services/api";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

//================ Minhas importações ================//
import styles from "./carrosselDoadores.module.css";

export default function CarrosselDoadoresVisitantes({ ehMobile }) {
  const [doadores, setDoadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarDoadores = async () => {
      try {
        const response = await api.get("/doadores");
        setDoadores(response.data);
        setErro(null);
      } catch (error) {
        console.error("Erro ao carregar doadores:", error);
        setErro(
          "Não foi possível carregar os doadores. Tente novamente mais tarde."
        );
      } finally {
        setCarregando(false);
      }
    };

    carregarDoadores();
  }, []);

  if (carregando) {
    return (
      <div className={styles.carregando}>
        <h2>Carregando doadores...</h2>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={styles.erro}>
        <h2>ops, parece que ocorreu um erro ¯\_(ツ)_/¯</h2>
      </div>
    );
  }

  if (doadores.length === 0) {
    return (
      <div className={styles.semDoadores}>
        <h2>Nenhum doador por enquanto :&#40;</h2>
      </div>
    );
  }

  return (
    <Carousel
      className={styles.carrossel}
      showArrows={!ehMobile}
      showThumbs={false}
      showStatus={false}
      showIndicators={!ehMobile}
      infiniteLoop={true}
      swipeable={true}
      emulateTouch={true}
      renderArrowPrev={(onClickHandler, hasPrev, label) =>
        ehMobile ? null : (
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
      renderArrowNext={(onClickHandler, hasNext, label) =>
        ehMobile ? null : (
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
      {doadores.map((doador) => (
        <div key={doador.id} className={styles.renderizacaoSlideDoadores}>
          <div className={styles.bordaImagem}>
            <img
              src={`${import.meta.env.VITE_API_URL}/uploads/${doador.imagem}`}
              alt={doador.nome}
              className={styles.fotoDoador}
              onError={(e) => {
                console.error("Erro ao carregar imagem:", e.target.src);
                e.target.onerror = null;
                e.target.src = "/imagem-padrao-doador.jpg";
              }}
            />
          </div>
          <div className={styles.infoDoador}>
            <h1 className={styles.nomeDoador}>{doador.nome}</h1>
            <p className={styles.descricaoDoador}>{doador.descricao}</p>
          </div>
        </div>
      ))}
    </Carousel>
  );
}
