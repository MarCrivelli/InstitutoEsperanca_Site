import { useState, useEffect } from "react";
import Header from "../HeaderVisitantes/app";
import Footer from "../Footer/app";
import carregarAnimais from "../../GerenciarDadosAnimais/CarregarAnimais/carregarAnimais";
import styles from "./adote.module.css";
import opcoes from "/src/app/componentes/Administradores/OpcoesDeSelecao/opcoes";
import { Carousel } from "react-responsive-carousel";

export default function QueroAdotar() {
  const [centerSlidePercentage, setCenterSlidePercentage] = useState(26);

  useEffect(() => {
    const atualizarCenterSlide = () => {
      const largura = window.innerWidth;

      if (largura <= 480) {
        setCenterSlidePercentage(80);
      } else if (largura <= 768) {
        setCenterSlidePercentage(60);
      } else if (largura <= 1024) {
        setCenterSlidePercentage(40);
      } else if (largura <= 1400) {
        setCenterSlidePercentage(37);
      } else {
        setCenterSlidePercentage(26);
      }
    };

    atualizarCenterSlide();
    window.addEventListener("resize", atualizarCenterSlide);

    return () => {
      window.removeEventListener("resize", atualizarCenterSlide);
    };
  }, []);

  const { animaisFiltrados, carregando, erro, recarregarAnimais } =
    carregarAnimais({
      removerAnimaisQuePossuam: {
        statusAdocao: "adotado",
        descricaoEntrada: "__vazio__",
      },
    });

  const [itemAtual, setItemAtual] = useState(0);
  const [animalAbertoId, setAnimalAbertoId] = useState(null);
  if (erro) return <p>Erro: {erro}</p>;

  const ultimoIndice = animaisFiltrados.length - 1;

  const irParaProximo = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setAnimalAbertoId(null);
    setItemAtual((valorAtual) =>
      valorAtual < ultimoIndice ? valorAtual + 1 : valorAtual,
    );
  };

  const irParaAnterior = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setAnimalAbertoId(null);
    setItemAtual((valorAtual) =>
      valorAtual > 0 ? valorAtual - 1 : valorAtual,
    );
  };

  const poucosAnimais = animaisFiltrados.length <= 3;
  const isMobile = window.innerWidth <= 768;

  return (
    <>
      <main>
        <section
          className={`${styles.secao} ${styles.parallax} ${styles.parallax1}`}
        >
          <Header />
          <h1>Animais disponíveis para a adoção</h1>
        </section>

        <section className={styles.secao}>
          <Carousel
            className={`${styles.carrossel} ${
              poucosAnimais && !isMobile ? styles.poucos : ""
            }`}
            selectedItem={itemAtual}
            onChange={(indice) => {
              setItemAtual(indice);
              setAnimalAbertoId(null);
            }}
            showThumbs={false}
            showStatus={false}
            showIndicators={false}
            showArrows={false}
            infiniteLoop={false}
            swipeable={isMobile || !poucosAnimais}
            emulateTouch={isMobile || !poucosAnimais}
            centerMode={true}
            centerSlidePercentage={
              poucosAnimais && isMobile ? 80 : centerSlidePercentage
            }
            transitionTime={800}
            interval={4000}
          >
            {animaisFiltrados.map((animal, indice) => {
              const emFoco = indice === itemAtual;
              const mostrandoDescricao = animal.id === animalAbertoId;

              return (
                <div key={animal.id} className={styles.itemSlide}>
                  <div
                    className={`${styles.cardAnimal} ${
                      emFoco ? styles.cardAtivo : styles.cardInativo
                    }`}
                  >
                    {!mostrandoDescricao ? (
                      <>
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/${animal.imagemEntrada}`}
                          alt={animal.nome}
                          draggable={false}
                          loading="lazy"
                        />

                        <h1>{animal.nome}</h1>

                        <p>
                          <strong>Idade: </strong>
                          {opcoes.vincularLabel(
                            animal.idade?.toString(),
                            "idadeAnimais",
                          )}
                        </p>

                        <p>
                          <strong>Sexo: </strong>
                          {opcoes.vincularLabel(animal.sexo, "sexoDoAnimal")}
                        </p>

                        <p>
                          <strong>Status de castração: </strong>
                          {opcoes.vincularLabel(
                            animal.statusCastracao,
                            "StatusCastracao",
                          )}
                        </p>

                        <button
                          type="button"
                          className={styles.botaoSobre}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAnimalAbertoId(animal.id);
                          }}
                        >
                          Sobre
                        </button>

                        {emFoco && (
                          <div className={styles.acoesCard}>
                            <button
                              type="button"
                              className={`${styles.botaoNavegacao} ${styles.botaoEsquerdo}`}
                              onClick={irParaAnterior}
                              disabled={itemAtual === 0}
                            >
                              &lt;
                            </button>

                            <button
                              type="button"
                              className={`${styles.botaoNavegacao} ${styles.botaoDireito}`}
                              onClick={irParaProximo}
                              disabled={itemAtual === ultimoIndice}
                            >
                              &gt;
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.descricaoAnimal}>
                        <h1 className={styles.nomeAnimal}>{animal.nome}</h1>

                        <p>{animal.descricaoEntrada}</p>

                        <button
                          type="button"
                          className={styles.botaoVoltar}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAnimalAbertoId(null);
                          }}
                        >
                          Voltar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Carousel>
        </section>

        <section
          className={`${styles.secao} ${styles.parallax} ${styles.parallax2}`}
        >
          <h1>Critérios de adoção</h1>
        </section>

        <section className={`${styles.secao} ${styles.conteudo}`}>
          <div className={styles.bloco}>
            <div className={styles.cardInformativo}>
              <img src={`${import.meta.env.BASE_URL}pagAdocao/avaliacao.png`}></img>
              <h2>Avaliação Comportamental</h2>
              <p>
                Um critério muito importante é a avaliação de como o futuro
                &quot;pai de pet&quot; interage com os animais, pois a primeira
                impressão deixada é de suma importância para a avaliação.
              </p>
            </div>
          </div>
          <div className={styles.bloco}>
            <div className={styles.cardInformativo}>
              <img src={`${import.meta.env.BASE_URL}pagAdocao/ficha.png`}></img>
              <h2>Ficha Limpa</h2>
              <p>
                Estamos sempre atentos a denúncias de maus-tratos e podemos
                impedir a adoção de qualquer animal caso chegue ao nosso
                conhecimento um histórico de agressividade ou abandono.
              </p>
            </div>
          </div>
          <div className={styles.bloco}>
            <div className={styles.cardInformativo}>
              <img src={`${import.meta.env.BASE_URL}pagAdocao/lar.png`}></img>
              <h2>Lar adequado</h2>
              <p>
                Antes de adotar um animal, é preciso ter ciência de que é
                necessário um ambiente adequado para recebê-lo, pois do
                contrário, eles podem adoecer ou ficar muito agitados, mesmo que
                seus donos cuidem bem. Quintais ou gaiolas grandes e um ambiente
                limpo são critérios decisivos para a aprovação ou rejeição da
                adoção do animal.
              </p>
            </div>
          </div>
          <div className={styles.bloco}>
            <div className={styles.cardInformativo}>
              <img src={`${import.meta.env.BASE_URL}pagAdocao/rotina.png`}></img>
              <h2>Rotina Adequada</h2>
              <p>
                Os animais domésticos precisam de atenção e cuidados diários
                para se manterem felizes e consequentemente saudáveis, portanto,
                é necessário que os donos tenham tempo para passear, dar banho,
                alimentá-lo e tratá-lo de doenças/ferimentos.
              </p>
            </div>
          </div>
          <div className={styles.bloco}>
            <div className={styles.cardInformativo}>
              <img src="pagAdocao/financeiro.png"></img>
              <h2>Financeiro</h2>
              <p>
                Cuidar de um animal exige um certo gasto para mantê-los, sendo
                necessário uma ração adequada, coleira e guia para o passeio e
                entender que o animal ocasionalmente poderá ficar doente e é
                responsabilidade do dono tratar.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
