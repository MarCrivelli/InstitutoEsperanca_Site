import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarAnimaisBackend } from "../BuscarAnimais/buscarAnimais";
import {
  aplicarFiltrosAnimais,
  removerAnimaisPorCampos,
  existemFiltrosAtivos,
  criarFiltrosAnimaisPadrao,
} from "../FiltrarAnimais/filtrarAnimais";

export default function carregarAnimais(opcoes = {}) {
  const {
    filtros = null,
    removerAnimaisQuePossuam = {},
    aplicarFiltrosAutomaticamente = true,
  } = opcoes;

  const [animaisCadastrados, setAnimaisCadastrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregarAnimais = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/animais`);
      if (!resposta.ok) {
        throw new Error(`Erro ao buscar animais: ${resposta.status}`);
      }

      const dados = await resposta.json();
      setAnimaisCadastrados(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao buscar animais:", error);
      setErro(error.message);
      setAnimaisCadastrados([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  // ✅ NOVO: carregar assim que entrar na página
  useEffect(() => {
    recarregarAnimais();
  }, [recarregarAnimais]);

  // ✅ MANTIDO (mas agora funcionando corretamente)
  useEffect(() => {
    const atualizarAoVoltar = () => {
      recarregarAnimais();
    };

    const atualizarAoFicarVisivel = () => {
      if (document.visibilityState === "visible") {
        recarregarAnimais();
      }
    };

    window.addEventListener("focus", atualizarAoVoltar);
    document.addEventListener("visibilitychange", atualizarAoFicarVisivel);

    return () => {
      window.removeEventListener("focus", atualizarAoVoltar);
      document.removeEventListener("visibilitychange", atualizarAoFicarVisivel);
    };
  }, [recarregarAnimais]);

  const filtrosNormalizados = filtros || criarFiltrosAnimaisPadrao();

  const animaisFiltrados = useMemo(() => {
    let resultado = [...animaisCadastrados];

    if (aplicarFiltrosAutomaticamente) {
      resultado = aplicarFiltrosAnimais(resultado, filtrosNormalizados);
    }

    resultado = removerAnimaisPorCampos(resultado, removerAnimaisQuePossuam);

    return resultado;
  }, [
    animaisCadastrados,
    filtrosNormalizados,
    removerAnimaisQuePossuam,
    aplicarFiltrosAutomaticamente,
  ]);

  return {
    animaisCadastrados,
    animaisFiltrados,
    carregando,
    erro,
    recarregarAnimais,
    setAnimaisCadastrados,
    filtrosAtivos: existemFiltrosAtivos(filtrosNormalizados),
  };
}