import { useState, useEffect, useRef } from "react";
import api from "../../../../../services/api";
import axios from "axios";
import styles from "./carrossel.module.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function CarrosselDeDoadores() {
  const [doadores, setDoadores] = useState([]);
  const [novoDoador, setNovoDoador] = useState({
    imagem: null,
    nome: "",
    descricao: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const carregarDoadores = async () => {
      try {
        const response = await api.get("/doadores", {
          signal: controller.signal,
        });
        setDoadores(response.data);
      } catch (error) {
        // Ignora apenas erros de cancelamento
        if (!axios.isCancel(error)) {
          console.error("Erro ao carregar doadores:", error);
        }
      }
    };

    carregarDoadores();

    return () => {
      controller.abort(); // Isso cancela a requisição quando o componente desmonta
    };
  }, []); // Mantenha o array de dependências vazio para executar apenas uma vez

  const handleImageChange = (e) => {
    setNovoDoador({ ...novoDoador, imagem: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoDoador({ ...novoDoador, [name]: value });
  };

  const adicionarDoador = async () => {
    try {
      const formData = new FormData();
      formData.append("imagem", novoDoador.imagem);
      formData.append("nome", novoDoador.nome);
      formData.append("descricao", novoDoador.descricao);

      const response = await api.post("/doadores", formData);

      // Atualize o estado desta forma:
      setDoadores((prevDoadores) => [response.data, ...prevDoadores]);

      // Limpe o formulário
      setNovoDoador({ imagem: null, nome: "", descricao: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Erro ao adicionar doador:", error);
    }
  };

  const deletarDoador = async (id) => {
    try {
      await api.delete(`/doadores/${id}`);
      setDoadores(doadores.filter((doador) => doador.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error.response?.data || error.message);
    }
  };

  return (
    <div className={styles.fundoCarrosselDoadores}>
      <div className={styles.painel}>
        <Carousel
          showArrows={true}
          showThumbs={false}
          showStatus={false}
          showIndicators={true}
          infiniteLoop={false}
          className={styles.carrossel}
        >
          {/* Slide do formulário */}
          <div className={styles.slideFormulario}>
            <div className={styles.containerPreImagem}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ display: "none" }}
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={styles.botaoAddImagemDoador}
              >
                {novoDoador.imagem ? (
                  <img
                    src={URL.createObjectURL(novoDoador.imagem)}
                    alt="Preview"
                    className={styles.fotoPreview}
                  />
                ) : (
                  <div className={styles.iconePadrao}>
                    <img src={`${import.meta.env.BASE_URL}pagConfiguracoes/adicionarImagem.png`}></img>
                  </div>
                )}
              </label>
            </div>
            <input
              type="text"
              name="nome"
              value={novoDoador.nome}
              onChange={handleInputChange}
              placeholder="Nome do doador"
              className={styles.inputForm}
            />
            <textarea
              name="descricao"
              value={novoDoador.descricao}
              className={styles.textareaForm}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  handleInputChange(e);
                }
              }}
              placeholder="Descrição (máx. 500 caracteres)"
            />
            <div className={styles.contador}>
              {novoDoador.descricao.length}/500 caracteres
            </div>
            <button
              onClick={adicionarDoador}
              disabled={
                !novoDoador.imagem || !novoDoador.nome || !novoDoador.descricao
              }
              className={styles.botaoAdicionar}
            >
              Adicionar Doador
            </button>
          </div>

          {/* Slides dos doadores existentes */}
          {doadores.map((doador) => (
            <div key={`doador-${doador.id}`} className={styles.itemCarrossel}>
              <div className={styles.containerImagem}>
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${doador.imagem}`}
                  alt={doador.nome}
                  className={styles.fotoDoador}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "paraErros/user.png";
                  }}
                />
              </div>
              <div className={styles.infoDoador}>
                <h1>{doador.nome}</h1>
                <p>{doador.descricao}</p>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Tem certeza que deseja remover este doador?"
                    )
                  ) {
                    deletarDoador(doador.id);
                  }
                }}
                className={styles.botaoRemover}
              >
                Remover Doador
              </button>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
