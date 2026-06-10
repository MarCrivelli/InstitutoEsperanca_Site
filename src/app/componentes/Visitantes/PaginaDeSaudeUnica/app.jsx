import Header from "../HeaderVisitantes/app";
import Footer from "../Footer/app";
import styles from "./saudeUnica.module.css";
import { useEffect } from "react";

export default function SaudeUnica() {
  useEffect(() => {
    const card = document.querySelectorAll(`.${styles.card}`);

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          const progresso = entrada.intersectionRatio;

          entrada.target.style.setProperty("--progresso", progresso);
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, indice) => indice / 100),
      },
    );

    card.forEach((cartao) => observador.observe(cartao));

    return () => {
      observador.disconnect();
    };
  }, []);

  return (
    <>
      <main>
        <section
          className={`${styles.secao} ${styles.parallax} ${styles.parallax1}`}
        >
          <Header />
          <h1>O que é Saúde Única?</h1>
        </section>

        <section
          className={`${styles.secao} ${styles.conteudo} ${styles.conteudo1}`}
        >
          <div className={styles.painel}>
            <p>
              A <strong>Saúde Única é uma abordagem integrada e interdisciplinar
              proposta por organizações internacionais,</strong> como a Organização
              Mundial da Saúde &#40;OMS&#41;, a Organização Mundial da Saúde
              Animal &#40;OIE&#41; e a Organização das Nações Unidas para
              Alimentação e Agricultura &#40;FAO&#41;, <strong>que reconhece que a saúde
              humana, a saúde animal e a saúde ambiental estão interligadas</strong>. Ou
              seja, para garantir a saúde das pessoas, é necessário também
              cuidar dos animais e do meio ambiente.
            </p>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}pagSaudeUnica/arvore.png`}
          />
        </section>

        <section
          className={`${styles.secao} ${styles.parallax} ${styles.parallax2}`}
        >
          <h1>
            Em quais ocasiões a saúde humana, animal e ambiental se interligam?
          </h1>
        </section>
        <section
          className={`${styles.secao} ${styles.conteudo} ${styles.conteudo2}`}
        >
          <div className={styles.card}>
            <p>
              <strong className={styles.strong}>
                1 - Propagação de doenças infecciosas:{" "}
              </strong>{" "}
              algumas doenças infecciosas como a Zoonose, Raiva ou Leptospirose,
              por exemplo, não se limitam apenas a animais ou humanos, podendo
              ser transmitida de um para o outro, sendo extremamente mortais
              caso não haja um tratamento imediato.
            </p>
          </div>
          <div className={styles.card}>
            <p>
              <strong className={styles.strong}>
                2 - Contaminação do lençol freático:{" "}
              </strong>{" "}
              Quando rios, poços ou nascentes recebem esgoto, lixo, agrotóxicos
              ou fezes de animais e não recebem o devido tratamento, além de
              prejudicar diretamente a natureza pela contaminação do solo e do
              lençol freático, acaba por prejudicar a todos que dependem dessas
              fontes para sobreviver: os humanos e os animais.
            </p>
          </div>
          <div className={styles.card}>
            <p>
              <strong className={styles.strong}>
                3 - Queimadas e suas consequências:{" "}
              </strong>{" "}
              As queimadas prejudicam a fauna, destroem vegetação, empobrecem o
              solo e comprometem os pulmões de quem respira sua fumação por
              tempo demais.
            </p>
          </div>
          <div className={styles.card}>
            <p>
              <strong className={styles.strong}>
                4 - Dengue, zika e chikungunya:{" "}
              </strong>{" "}
              O acúmulo de lixo, água parada e falta de limpeza ambiental
              favorece a ploriferação do mosquito da dengue, zika e chikungunya,
              que por sua vez são perigosos para humanos e animais também.
            </p>
          </div>
          <div className={styles.card}>
            <p>
              <strong className={styles.strong}>
                5 - Resíduos e lixo descartados de forma errada:{" "}
              </strong>{" "}
              a reciclagem e o descarte ideal para cada tipo de lixo são
              fundamentais para preservar o meio-ambiente, pois evita que lixo
              se acumule, atraindo insetos e animais que podem propagar doenças,
              além de, claro, adoecer àqueles que convivem com ele diariamente.
            </p>
          </div>
          <div className={styles.card}>
            <p>
              <strong className={styles.strong}>
                6 - Desmatamento e perda de habitat:{" "}
              </strong>{" "}
              o desmatamento contribui para dois problemas sérios na saúde
              única: quanto menos árvores, menor é a eficiência de filtragem do
              CO², gerando danos à camada de ozônio e consequentemente,
              superaquecendo o planeta; o desmatamento contribui também para a
              migração de animais selvagens para as cidades, o que prejudica
              tanto as pessoas, que podem ser atacadas, quanto os animais, que
              podem ser atropelados ou caçados.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
