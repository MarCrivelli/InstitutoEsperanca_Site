import styles from "./cadastroDeAnimais.module.css";
import { useState } from "react";
import Select from "react-select";
import opcoes from "/src/app/componentes/Administradores/OpcoesDeSelecao/opcoes";

export default function CadastroDeAnimais({ onAnimalCadastrado, onClose }) {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [tipo, setTipo] = useState("");
  const [statusMicrochipagem, setStatusMicrochipagem] = useState("");
  const [statusVacinacao, setStatusVacinacao] = useState("");
  const [statusCastracao, setStatusCastracao] = useState("");
  const [statusAdocao, setStatusAdocao] = useState("");
  const [statusVermifugacao, setStatusVermifugacao] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const resetForm = () => {
    setNome("");
    setIdade("");
    setSexo("");
    setTipo("");
    setStatusMicrochipagem("");
    setStatusVacinacao("");
    setStatusCastracao("");
    setStatusAdocao("");
    setStatusVermifugacao("");
    setImage(null);
  };

  const registrarAnimal = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("idade", idade);
    formData.append("sexo", sexo);
    formData.append("tipo", tipo);
    formData.append("statusMicrochipagem", statusMicrochipagem);
    formData.append("statusVacinacao", statusVacinacao);
    formData.append("statusCastracao", statusCastracao);
    formData.append("statusAdocao", statusAdocao);
    formData.append("statusVermifugacao", statusVermifugacao);
    if (image) {
      formData.append("imagem", image);
    }

    try {
      const resposta = await fetch(`${import.meta.env.BASE_URL}/animais`, {
        method: "POST",
        body: formData,
      });

      if (resposta.ok) {
        await resposta.json();

        if (onAnimalCadastrado) {
          await onAnimalCadastrado();
        }

        alert("Animal cadastrado com sucesso!");
        resetForm();

        if (onClose) onClose();
      } else {
        const erro = await resposta.json();
        console.error("Erro ao cadastrar animal:", erro);
        alert(
          `Erro ao cadastrar o animal: ${erro.message || "Erro desconhecido"}`,
        );
      }
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);
      alert("Ocorreu um erro na comunicação com o servidor!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={registrarAnimal} className={styles.formularioCadastro}>
      <div className={styles.inserirImagem}>
        <img
          className={styles.previaImagem}
          src={image ? URL.createObjectURL(image) : ""}
          alt="Prévia da imagem"
        />
        <label htmlFor="inputDeImagem" className={styles.labelDeImagem}>
          Selecione uma imagem
        </label>
        <input
          type="file"
          id="inputDeImagem"
          onChange={onImageChange}
          className={styles.inputDeImagem}
          accept="image/*"
        />
        <span className={styles.nomeArquivo}>
          {image ? image.name : "Nenhum arquivo selecionado"}
        </span>
      </div>

      <div className={styles.itemInserir}>
        <h1 className={styles.tituloItemInserir}>Dados de identificação</h1>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDeIdentificacao}>Nome:</label>
          <input
            className={styles.inputDadosIdentificacao}
            maxLength={30}
            type="text"
            placeholder="max. de 30 caracteres"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDeIdentificacao}>Idade:</label>
          <input
            className={styles.inputDadosIdentificacao}
            min="1"
            max="20"
            type="number"
            placeholder="insira uma idade"
            value={idade}
            onChange={(event) => setIdade(event.target.value)}
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDeIdentificacao}>Sexo:</label>
          <Select
            options={opcoes.sexoDoAnimal}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) => setSexo(selectedOption.value)}
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDeIdentificacao}>Tipo:</label>
          <Select
            options={opcoes.tipoAnimal}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) => setTipo(selectedOption.value)}
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDeIdentificacao}>
            Status de microchipagem:
          </label>
          <Select
            options={opcoes.StatusMicrochipagem}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) =>
              setStatusMicrochipagem(selectedOption.value)
            }
          />
        </div>
      </div>
      <div className={styles.itemInserir}>
        <h1 className={styles.tituloItemInserir}>Dados de saúde</h1>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDadosSaude}>Status de vacinação:</label>
          <Select
            options={opcoes.StatusVacinacao}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) =>
              setStatusVacinacao(selectedOption.value)
            }
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDadosSaude}>Status de castração:</label>
          <Select
            options={opcoes.StatusCastracao}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) =>
              setStatusCastracao(selectedOption.value)
            }
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDadosSaude}>Status de adoção:</label>
          <Select
            options={opcoes.StatusAdocao}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) => setStatusAdocao(selectedOption.value)}
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDadosSaude}>
            Status de vermifugação:
          </label>
          <Select
            options={opcoes.StatusVermifugacao}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) =>
              setStatusVermifugacao(selectedOption.value)
            }
          />
        </div>
      </div>

      <div className={styles.alinharBotaoInserir}>
        <button
          className={styles.botaoInserir}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Cadastrando..." : "Inserir animal"}
        </button>
      </div>
    </form>
  );
}
