import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./card2.module.css";

export default function Card2() {
  const [animaisParaVacinar, setAnimaisParaVacinar] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarAnimaisParaVacinar = async () => {
      try {
        setLoading(true);
        /* Busca todos os animais */
        const resposta = await fetch(`${import.meta.env.VITE_API_URL}/animais`);
        /* Verifica se há algo de errado */
        if (!resposta.ok) {
          throw new Error("Erro ao buscar animais");
        }

        /* Se tudo deu certo, converte a resposta para json */
        const animais = await resposta.json();

        /* Data atual */
        const hoje = new Date();

        /* Calcula a data de hoje com a de um ano atrás */
        const umAnoAtras = new Date(hoje);
        umAnoAtras.setFullYear(hoje.getFullYear() - 1);

        // Filtra os animais que precisam de vacinação
        const animaisQueNecessitamVacinacao = animais.filter(animal => {
          // Se não tem data de vacinação, usa o status de vacinação manual
          if (!animal.dataVacinacao) {
            return animal.statusVacinacao === "naoVacinado";
          }

          // Se tem data de vacinação, verifica se está vencida (mais de 1 ano)
          const dataVacinacao = new Date(animal.dataVacinacao);
          return dataVacinacao < umAnoAtras;
        });

        setAnimaisParaVacinar(animaisQueNecessitamVacinacao.length);
      } catch (error) {
        console.error("Erro ao buscar animais para vacinação:", error);
        setAnimaisParaVacinar(0);
      } finally {
        setLoading(false);
      }
    };

    buscarAnimaisParaVacinar();
  }, []);

  const handleClickVacinacao = () => {
    // Redirecionar para a página de animais com filtro de não vacinados
    navigate("/fichas_de_animais?filtroVacinacao=naoVacinado");
  };

  return (
    <div className={styles.containerLembrete}>
      <p className={styles.textoLembrete}>
        Há{" "}
        <span 
          className={styles.sublinhadoVacinacao}
          onClick={handleClickVacinacao}
          style={{ cursor: "pointer" }}
        >
          {loading ? "..." : animaisParaVacinar}
        </span>{" "}
        {animaisParaVacinar === 1 ? "animal a ser vacinado" : "animais a serem vacinados"}
      </p>
    </div>
  );
}