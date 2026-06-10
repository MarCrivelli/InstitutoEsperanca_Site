import styles from "./home.module.css";
import Header from "../../HeaderVisitantes/app";
import Footer from "../../Footer/app";
import BotaoParaPaginaDeAdms from "../../BotaoParaPaginaDeAdms/app";
import SeccaoCarrossel from "../SeccaoCarrossel/ComponentePrincipal/app";
import QuadroDeAvisos from "../../QuadroDeAvisos/app";

import { Link } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useState, useEffect } from "react";

export default function PaginaInicialVisitantes() {

  const [ehMobile, setEhMobile] = useState(false);

  useEffect(() => {
    const lidarComRedimensionamento = () => {
      setEhMobile(window.innerWidth <= 768);
    };

    lidarComRedimensionamento();
    window.addEventListener("resize", lidarComRedimensionamento);

    return () => {
      window.removeEventListener("resize", lidarComRedimensionamento);
    };
  }, []);

  return (
    <div className={styles.paginaInicialVisitantes}>
      <BotaoParaPaginaDeAdms />
      <QuadroDeAvisos/>

      <div className={styles.imagemDeFundo}>
        <Header tipo="padrao" />
        <div className={styles.logoPreLogin}>

          <img
            src={`${import.meta.env.BASE_URL}logos/logoBranca.png`}
            width={800}
            height={400}
            alt="Logo Instituto Esperança"
          />
          <div className={styles.textoLogoPreLogin}>
            <h1>Instituto Esperança</h1>
            <p>A voz dos animais</p>
          </div>
        </div>
      </div>

      <div className={styles.alinharCards}>
        <div className={`${styles.card} ${styles.card1}`}>
          <img src={`${import.meta.env.BASE_URL}mainVisitantes/cachorroTriste.png`} alt="Cachorro triste" />
          <div className={styles.descricaoCard}>
            <h1>Precisa de ajuda para realizar uma denúncia?</h1>
            <p>
              É importante zelarmos pela saúde dos animais, mesmo que não sejam
              os nossos. Caso você tenha presenciado alguma situação que precise
              de uma atenção das autoridades responsáveis, clique no botão
              abaixo:
            </p>
          </div>
          <Link className={styles.linkBotaoVerMais} to={"denuncie"}>
            <button className={styles.botaoVerMais}>ver mais</button>
          </Link>
        </div>

        <div className={`${styles.card} ${styles.card2}`}>
          <img src={`${import.meta.env.BASE_URL}mainVisitantes/dinheiro.png`} alt="Dinheiro" />
          <div className={styles.descricaoCard}>
            <h1>Quer saber como contribuir para a nossa causa?</h1>
            <p>
              Você pode ajudar os animais que foram resgatados contribuindo com
              qualquer quantia de dinheiro ou doando equipamentos e mantimentos
              para que serão usados no tratamento dos pets.
            </p>
          </div>
          <Link className={styles.linkBotaoVerMais} to={"como_doar"}>
            <button className={styles.botaoVerMais}>ver mais</button>
          </Link>
        </div>

        <div className={`${styles.card} ${styles.card3}`}>
          <img src={`${import.meta.env.BASE_URL}mainVisitantes/adocao.png`} alt="Adoção" />
          <div className={styles.descricaoCard}>
            <h1>Tem interesse em adotar um animalzinho?</h1>
            <p>
              Caso tenha interesse em adotar algum pet, será necessário fazer
              uma avaliação para determinar sua aptidão ao cuidar de um amigo de
              quatro patas, para que assim tenhamos certeza de que eles serão
              entregues em boas mãos.
            </p>
          </div>
          <Link className={styles.linkBotaoVerMais} to={"quero_adotar"}>
            <button className={styles.botaoVerMais}>ver mais</button>
          </Link>
        </div>

        <div className={`${styles.card} ${styles.card4}`}>
          <img src={`${import.meta.env.BASE_URL}mainVisitantes/colaborador.png`} alt="Colaborador" />
          <div className={styles.descricaoCard}>
            <h1>Gostaria de se juntar a nossa equipe de voluntários?</h1>
            <p>
              Há outras formas de contribuir além das doações em dinheiro e uma
              delas é se juntar ao nosso time de voluntários para ajudar na
              limpeza e no cuidado para com os animais abrigados.
            </p>
          </div>
          <Link className={styles.linkBotaoVerMais} to={"autenticar"}>
            <button className={styles.botaoVerMais}>ver mais</button>
          </Link>
        </div>
      </div>

      <SeccaoCarrossel/>

      <Footer />
    </div>
  );
}
