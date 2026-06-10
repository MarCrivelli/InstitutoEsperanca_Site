import styles from "./animais.module.css";
import { useState, useEffect } from "react";
import HeaderAdms from "../../HeaderAdms/app";
import RolarPCima from "../../../BotaoScroll/app";
import BotaoPagInicial from "../../BotaoPagInicialAdms/app";
import FiltroDeAnimais from "../FiltroDeAnimais/app";
import CadastroDeAnimais from "../CadastroDeAnimais/app";
import ExibicaoDeAnimais from "../ExibicaoDeAnimais/app";
import carregarAnimais from "../../../GerenciarDadosAnimais/CarregarAnimais/carregarAnimais";
import { criarFiltrosAnimaisPadrao } from "../../../GerenciarDadosAnimais/FiltrarAnimais/filtrarAnimais";

export default function FichasDeAnimais() {
  const [filtros, setFiltros] = useState(criarFiltrosAnimaisPadrao());
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modoSelecaoPostagem, setModoSelecaoPostagem] = useState(false);
  const [animaisSelecionados, setAnimaisSelecionados] = useState([]);

  const {
    animaisFiltrados,
    carregando,
    erro,
    recarregarAnimais,
    filtrosAtivos,
  } = carregarAnimais({ filtros });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filtroVacinacao = urlParams.get("filtroVacinacao");
    const modoPostagem = urlParams.get("modoPostagem");

    if (filtroVacinacao === "naoVacinado") {
      setFiltros((prev) => ({
        ...prev,
        statusVacinacao: ["naoVacinado"],
      }));
      setMostrarFiltros(true);
    }

    if (modoPostagem === "true") {
      setModoSelecaoPostagem(true);
      document.body.classList.add("modo-selecao-ativo");

      const animaisSalvos = urlParams.get("animaisSelecionados");
      if (animaisSalvos) {
        try {
          const animaisArray = JSON.parse(decodeURIComponent(animaisSalvos));
          setAnimaisSelecionados(animaisArray);
        } catch (error) {
          console.error("Erro ao recuperar animais selecionados:", error);
        }
      }
    }

    return () => {
      document.body.classList.remove("modo-selecao-ativo");
    };
  }, []);

  useEffect(() => {
    if (modoSelecaoPostagem && animaisSelecionados.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set(
        "animaisSelecionados",
        encodeURIComponent(JSON.stringify(animaisSelecionados))
      );
      const novaUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, "", novaUrl);
    }
  }, [animaisSelecionados, modoSelecaoPostagem]);

  useEffect(() => {
    const container = document.querySelector(`.${styles.containerPostagem}`);
    const botaoSelecao = document.querySelector(
      `.${styles.botoesFlutuantes} .${styles.botaoAcao}:nth-child(3)`
    );

    if (modoSelecaoPostagem) {
      document.body.classList.add("modo-selecao-ativo");

      if (animaisSelecionados.length > 0) {
        container?.classList.add(styles.visivel);
        botaoSelecao?.classList.add(styles.botaoSelecaoAtivo);
      } else {
        container?.classList.remove(styles.visivel);
        botaoSelecao?.classList.remove(styles.botaoSelecaoAtivo);
      }
    } else {
      document.body.classList.remove("modo-selecao-ativo");
      container?.classList.remove(styles.visivel);
      botaoSelecao?.classList.remove(styles.botaoSelecaoAtivo);
    }
  }, [animaisSelecionados, modoSelecaoPostagem]);

  const toggleSelecaoAnimal = (animalId) => {
    setAnimaisSelecionados((prev) =>
      prev.includes(animalId)
        ? prev.filter((id) => id !== animalId)
        : [...prev, animalId]
    );
  };

  const desativarModoSelecao = () => {
    setModoSelecaoPostagem(false);
    setAnimaisSelecionados([]);
    document.body.classList.remove("modo-selecao-ativo");

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("modoPostagem");
    urlParams.delete("animaisSelecionados");

    const novaUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", novaUrl);
  };

  const limparFiltroVacinacaoUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("filtroVacinacao")) {
      urlParams.delete("filtroVacinacao");
      const novaUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", novaUrl);
    }
  };

  return (
    <div
      className={`${styles.fundoPagina} ${
        modoSelecaoPostagem ? styles.modoSelecaoAtivo : ""
      }`}
    >
      <HeaderAdms />
      <BotaoPagInicial />
      <RolarPCima />

      <div className={styles.botoesFlutuantes}>
        <button
          className={styles.botaoAcao}
          onClick={() => setMostrarFiltros(true)}
        >
          <img src={`${import.meta.env.BASE_URL}pagFichasDAnimais/filtro.png`} alt="Filtrar" />
        </button>

        <button
          className={styles.botaoAcao}
          onClick={() => setMostrarCadastro(true)}
        >
          <img src={`${import.meta.env.BASE_URL}pagFichasDAnimais/addAnimal.png`} alt="Adicionar animal" />
        </button>
      </div>

      <div className={styles.containerPostagem}>
        <button
          className={`${styles.fecharContainerPostagem} ${
            modoSelecaoPostagem ? styles.ativo : ""
          }`}
          onClick={desativarModoSelecao}
        >
          X
        </button>
        <p>
          {animaisSelecionados.length}
          {animaisSelecionados.length === 1
            ? " animal selecionado"
            : " animais selecionados"}
        </p>
        <button className={styles.botaoPostar}>Postar</button>
      </div>

      {mostrarFiltros && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.modalFiltros}`}>
            <button
              className={styles.fecharModal}
              onClick={() => {
                setMostrarFiltros(false);
                limparFiltroVacinacaoUrl();
              }}
            >
              ×
            </button>
            <h2>Filtros de Pesquisa</h2>
            <FiltroDeAnimais filtros={filtros} setFiltros={setFiltros} />
          </div>
        </div>
      )}

      {mostrarCadastro && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.modalCadastro}`}>
            <button
              className={styles.fecharModal}
              onClick={() => setMostrarCadastro(false)}
            >
              ×
            </button>
            <h2>Cadastrar Animal</h2>
            <CadastroDeAnimais
              onAnimalCadastrado={recarregarAnimais}
              onClose={() => setMostrarCadastro(false)}
            />
          </div>
        </div>
      )}

      <div className={styles.fundoPainel}>
        <div className={styles.painel}>
          {carregando ? (
            <div className={styles.loading}>
              <img src={`${import.meta.env.BASE_URL}paraErros/carregando.svg`} alt="Carregando" />
              <p>Carregando...</p>
            </div>
          ) : erro ? (
            <div className={styles.error}>
              Erro ao carregar animais: {erro}
              <button
                onClick={recarregarAnimais}
                className={styles.botaoRecarregar}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <ExibicaoDeAnimais
              animais={animaisFiltrados}
              filtrosAplicados={filtrosAtivos}
              modoSelecaoPostagem={modoSelecaoPostagem}
              animaisSelecionados={animaisSelecionados}
              toggleSelecaoAnimal={toggleSelecaoAnimal}
            />
          )}
        </div>
      </div>
    </div>
  );
}