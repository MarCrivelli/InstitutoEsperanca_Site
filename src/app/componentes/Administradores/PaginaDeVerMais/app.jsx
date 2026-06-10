import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Select from "react-select";
import { Tooltip } from "react-tooltip";

import opcoes from "/src/app/componentes/Administradores/OpcoesDeSelecao/opcoes";
import HeaderAdms from "../HeaderAdms/app";
import RolarPCima from "../../BotaoScroll/app";
import BotaoPagInicial from "../BotaoPagInicialAdms/app";
import styles from "../PaginaDeVerMais/verMais.module.css";

export default function VerMais() {
  const { id } = useParams();

  // Estados principais - controla os dados do animal
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [dadosEditados, setDadosEditados] = useState(null);

  // Estados de controle da interface
  const [modoEdicao, setModoEdicao] = useState(false);
  const [existemAlteracoes, setExistemAlteracoes] = useState(false);
  const [salvandoDados, setSalvandoDados] = useState(false);

  // Estados específicos
  const [referenciaArquivo, setReferenciaArquivo] = useState(useRef(null));
  const [modalImagemAberto, setModalImagemAberto] = useState(false);
  const [imagemParaAmpliar, setImagemParaAmpliar] = useState("");

  // Novos estados para controle de imagens pendentes
  const [imagemEntradaPendente, setImagemEntradaPendente] = useState(null);
  const [imagemSaidaPendente, setImagemSaidaPendente] = useState(null);

  // Estado do seletor de descrição (entrada/saída)
  const [descricaoSelecionada, setDescricaoSelecionada] = useState(
    opcoes.descricoes.find(
      (opcao) => opcao.value === "descricao"
    ) || opcoes.descricoes[0]
  );

  // Hook para detectar tentativa de sair da página sem salvar
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (existemAlteracoes) {
        event.preventDefault();
        event.returnValue = "Você tem alterações não salvas. Deseja sair mesmo assim?";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [existemAlteracoes]);

  // CARREGAMENTO INICIAL
  useEffect(() => {
    const buscarDadosDoAnimal = async () => {
      try {
        const resposta = await fetch(`${import.meta.env.VITE_API_URL}/animais/${id}`);
        const dados = await resposta.json();

        console.log("=== DADOS CARREGADOS DO BANCO ===");
        console.log("descricao (entrada):", dados.descricao);
        console.log("descricaoSaida:", dados.descricaoSaida);

        if (!dados.hasOwnProperty("descricao")) {
          dados.descricao = "";
        }
        if (!dados.hasOwnProperty("descricaoSaida")) {
          dados.descricaoSaida = "";
        }

        console.log("Dados após normalização:", dados);

        setDadosOriginais(dados);
        setDadosEditados({ ...dados });

        console.log("Estados atualizados com sucesso");
      } catch (error) {
        console.error("Erro ao carregar dados do animal:", error);
      }
    };

    buscarDadosDoAnimal();
  }, [id]);

  // HANDLERS DE MUDANÇA
  const capturarMudancaCampo = (e) => {
    const { name, value } = e.target;
    setDadosEditados((anterior) => {
      const novoEstado = { ...anterior, [name]: value };
      verificarSeExistemAlteracoes(dadosOriginais, novoEstado);
      return novoEstado;
    });
  };

  const capturarMudancaDescricao = (e) => {
    const { value } = e.target;
    const campoAtual = obterCampoDescricaoAtual();

    setDadosEditados((anterior) => {
      const novoEstado = { ...anterior, [campoAtual]: value };

      console.log(`=== ALTERAÇÃO NA DESCRIÇÃO ===`);
      console.log(`Campo sendo alterado: ${campoAtual}`);
      console.log(`Novo valor: "${value}"`);
      console.log(`Estado completo após alteração:`, novoEstado);

      verificarSeExistemAlteracoes(dadosOriginais, novoEstado);
      return novoEstado;
    });
  };

  const capturarMudancaSelecao = (nomeCampo, opcaoSelecionada) => {
    setDadosEditados((anterior) => {
      const novoEstado = { ...anterior, [nomeCampo]: opcaoSelecionada.value };
      verificarSeExistemAlteracoes(dadosOriginais, novoEstado);
      return novoEstado;
    });
  };

  // Nova função para capturar mudança na data de vacinação
  const capturarMudancaData = (e) => {
    const { value } = e.target;
    
    // Calcula automaticamente o status de vacinação baseado na data
    let novoStatusVacinacao = "naoVacinado";
    if (value) {
      const dataVacinacao = new Date(value);
      const hoje = new Date();
      const umAnoAtras = new Date(hoje);
      umAnoAtras.setFullYear(hoje.getFullYear() - 1);
      
      if (dataVacinacao >= umAnoAtras) {
        novoStatusVacinacao = "vacinado";
      }
    }

    setDadosEditados((anterior) => {
      const novoEstado = {
        ...anterior,
        dataVacinacao: value,
        statusVacinacao: novoStatusVacinacao
      };
      verificarSeExistemAlteracoes(dadosOriginais, novoEstado);
      return novoEstado;
    });
  };

  // VERIFICAÇÃO DE ALTERAÇÕES
  const verificarSeExistemAlteracoes = (original, editado) => {
    if (!original || !editado) return false;

    const camposIgnorados = ["createdAt", "updatedAt"];

    console.log(`=== VERIFICANDO SE EXISTEM ALTERAÇÕES ===`);
    console.log(`Original descricao: "${original.descricao || ""}"`);
    console.log(`Editado descricao: "${editado.descricao || ""}"`);
    console.log(`Original descricaoSaida: "${original.descricaoSaida || ""}"`);
    console.log(`Editado descricaoSaida: "${editado.descricaoSaida || ""}"`);

    // Verificar se há imagens pendentes
    const temImagensPendentes = imagemEntradaPendente !== null || imagemSaidaPendente !== null;

    for (const campo in editado) {
      if (camposIgnorados.includes(campo)) continue;

      const valorOriginal = original[campo] === null ? "" : original[campo];
      const valorEditado = editado[campo] === null ? "" : editado[campo];

      if (typeof valorOriginal !== typeof valorEditado) {
        console.log(
          `Campo ${campo} mudou de tipo: ${typeof valorOriginal} -> ${typeof valorEditado}`
        );
        setExistemAlteracoes(true);
        return true;
      }

      if (valorOriginal instanceof Date || valorEditado instanceof Date) {
        if (
          new Date(valorOriginal).getTime() !== new Date(valorEditado).getTime()
        ) {
          console.log(
            `Campo ${campo} - data alterada: ${valorOriginal} -> ${valorEditado}`
          );
          setExistemAlteracoes(true);
          return true;
        }
      } else if (String(valorOriginal) !== String(valorEditado)) {
        console.log(
          `Campo ${campo} alterado: "${valorOriginal}" -> "${valorEditado}"`
        );
        setExistemAlteracoes(true);
        return true;
      }
    }

    if (temImagensPendentes) {
      console.log(`Imagens pendentes detectadas`);
      setExistemAlteracoes(true);
      return true;
    }

    console.log(`Nenhuma alteração detectada`);
    setExistemAlteracoes(false);
    return false;
  };

  // UPLOAD DE IMAGENS
  const processarUploadImagem = async (arquivo, tipoCampo) => {
    if (!arquivo) return;

    // Se é imagem de saída e não existe uma ainda, salva imediatamente
    if (tipoCampo === "imagemSaida" && !dadosOriginais.imagemSaida) {
      try {
        setSalvandoDados(true);
        
        const token = localStorage.getItem('token');
        const endpoint = `${import.meta.env.VITE_API_URL}/animais/${id}/imagem-saida`;
        const dadosFormulario = new FormData();
        dadosFormulario.append(tipoCampo, arquivo);

        const resposta = await fetch(endpoint, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: dadosFormulario,
        });

        if (!resposta.ok) {
          const dadosErro = await resposta.json();
          throw new Error(dadosErro.message || "Erro ao atualizar imagem");
        }

        const resultado = await resposta.json();

        // Atualiza os estados com os novos dados
        setDadosOriginais(resultado.animal);
        setDadosEditados({ ...resultado.animal });

        alert("Imagem de saída adicionada com sucesso!");
      } catch (error) {
        console.error("Erro no upload da imagem:", error);
        alert(`Erro: ${error.message}`);
      } finally {
        setSalvandoDados(false);
      }
      return;
    }

    // Para outros casos (imagem de entrada ou alteração de imagem de saída existente)
    const urlTemporaria = URL.createObjectURL(arquivo);
    
    if (tipoCampo === "imagemSaida") {
      setImagemSaidaPendente({ arquivo, url: urlTemporaria });
    } else {
      setImagemEntradaPendente({ arquivo, url: urlTemporaria });
    }

    // CORREÇÃO: Marca explicitamente que existem alterações
    setExistemAlteracoes(true);
  };

  // SALVAMENTO
  const salvarDescricaoSaida = async () => {
    try {
      setSalvandoDados(true);

      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/animais/${id}/descricao-saida`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            descricaoSaida: dadosEditados.descricaoSaida,
          }),
        }
      );

      if (resposta.ok) {
        const dados = await resposta.json();
        setDadosOriginais(dados.animal);
        setDadosEditados({ ...dados.animal });
        setExistemAlteracoes(false);
      } else {
        throw new Error("Erro ao atualizar descrição de saída.");
      }
    } catch (error) {
      console.error("Erro ao salvar descrição de saída:", error);
      throw error;
    } finally {
      setSalvandoDados(false);
    }
  };

  // Upload real das imagens para o servidor
  const uploadImagemParaServidor = async (imagemPendente, tipoCampo) => {
    const endpoint =
      tipoCampo === "imagemSaida"
        ? `${import.meta.env.VITE_API_URL}/animais/${id}/imagem-saida`
        : `${import.meta.env.VITE_API_URL}/animais/${id}/imagem-entrada`;

    const dadosFormulario = new FormData();
    dadosFormulario.append(tipoCampo, imagemPendente.arquivo);

    const resposta = await fetch(endpoint, {
      method: "PUT",
      body: dadosFormulario,
    });

    if (!resposta.ok) {
      const dadosErro = await resposta.json();
      throw new Error(dadosErro.message || "Erro ao atualizar imagem");
    }

    return await resposta.json();
  };

  const salvarTodasAlteracoes = async () => {
    try {
      setSalvandoDados(true);

      // Se está editando apenas a descrição de saída, usa endpoint específico
      if (
        descricaoSelecionada.value === "descricaoSaida" &&
        existemAlteracoes &&
        !imagemEntradaPendente &&
        !imagemSaidaPendente
      ) {
        await salvarDescricaoSaida();
        return;
      }

      // Upload das imagens pendentes
      if (imagemEntradaPendente) {
        await uploadImagemParaServidor(imagemEntradaPendente, "imagemEntrada");
        setImagemEntradaPendente(null);
      }

      if (imagemSaidaPendente) {
        await uploadImagemParaServidor(imagemSaidaPendente, "imagemSaida");
        setImagemSaidaPendente(null);
      }

      // Salvar dados textuais
      const dadosParaEnviar = { ...dadosEditados };

      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/animais/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        setDadosOriginais(dados.animal);
        setDadosEditados({ ...dados.animal });
        setExistemAlteracoes(false);
        setModoEdicao(false);
        
        // Limpar URLs temporárias
        if (imagemEntradaPendente) {
          URL.revokeObjectURL(imagemEntradaPendente.url);
        }
        if (imagemSaidaPendente) {
          URL.revokeObjectURL(imagemSaidaPendente.url);
        }
        
        alert("Dados atualizados com sucesso!");
      } else {
        throw new Error("Erro ao atualizar dados do animal.");
      }
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert(`Erro: ${error.message}`);
    } finally {
      setSalvandoDados(false);
    }
  };

  // FUNÇÕES AUXILIARES PARA DESCRIÇÃO
  const obterCampoDescricaoAtual = () => {
    console.log("Descrição selecionada:", descricaoSelecionada.value);

    if (descricaoSelecionada.value === "descricaoSaida") {
      return "descricaoSaida";
    }
    return "descricaoEntrada";
  };

  const obterValorDescricaoAtual = () => {
    const campo = obterCampoDescricaoAtual();
    const valor = dadosEditados[campo] || "";

    console.log(`=== OBTENDO VALOR DA DESCRIÇÃO ===`);
    console.log(`Seleção no dropdown: ${descricaoSelecionada.value}`);
    console.log(`Campo mapeado: ${campo}`);
    console.log(`Valor atual: "${valor}"`);
    console.log(`Todas as descrições:`);
    console.log(`  - descricao: "${dadosEditados.descricao || ""}"`);
    console.log(`  - descricaoSaida: "${dadosEditados.descricaoSaida || ""}"`);

    return valor;
  };

  const obterPlaceholderDescricao = () => {
    return descricaoSelecionada.value === "descricaoSaida"
      ? "Adicione uma descrição sobre a saída do animal (motivo, condições, etc.)"
      : "Adicione uma descrição sobre o animal (comportamento, histórico, etc.)";
  };

  // CONTROLES DE MODO DE EDIÇÃO
  const ativarModoEdicao = () => {
    console.log("Modo de edição ativado");
    setModoEdicao(true);
  };

  const cancelarEdicao = () => {
    console.log("Edição cancelada - restaurando dados originais");
    setDadosEditados({ ...dadosOriginais });
    setExistemAlteracoes(false);
    setModoEdicao(false);
    
    // Limpar imagens pendentes
    if (imagemEntradaPendente) {
      URL.revokeObjectURL(imagemEntradaPendente.url);
      setImagemEntradaPendente(null);
    }
    if (imagemSaidaPendente) {
      URL.revokeObjectURL(imagemSaidaPendente.url);
      setImagemSaidaPendente(null);
    }
  };

  // Função para obter a URL da imagem de entrada (com preview se pendente)
  const obterUrlImagemEntrada = () => {
    if (imagemEntradaPendente) {
      return imagemEntradaPendente.url;
    }
    return dadosOriginais.imagemEntrada
      ? `${import.meta.env.VITE_API_URL}/uploads/${dadosOriginais.imagemEntrada}`
      : "/pagFichasDAnimais/imagemTeste.jpg";
  };

  // Função para obter a URL da imagem de saída (com preview se pendente)
  const obterUrlImagemSaida = () => {
    if (imagemSaidaPendente) {
      return imagemSaidaPendente.url;
    }
    return dadosOriginais.imagemSaida
      ? `${import.meta.env.VITE_API_URL}/uploads/${dadosOriginais.imagemSaida}`
      : null;
  };

  // LOADING
  if (!dadosOriginais || !dadosEditados) {
    return <div>Carregando dados do animal...</div>;
  }

  // MODAL PARA AMPLIAR IMAGEM
  const ModalAmpliarImagem = () => {
    if (!modalImagemAberto) return null;

    return (
      <div
        className={styles.modalOverlay}
        onClick={() => setModalImagemAberto(false)}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <label
            className={styles.botaoFecharModal}
            onClick={() => setModalImagemAberto(false)}
          >
            &times;
          </label>
          <img
            src={imagemParaAmpliar}
            alt="Imagem ampliada"
            className={styles.imagemAmpliada}
          />
        </div>
      </div>
    );
  };

  // ESTILOS CUSTOMIZADOS PARA O SELECT DE TÍTULO
  const estilosSelectTitulo = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
      minHeight: "auto",
      padding: 0,
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      "@media (max-width: 500px)": {
        justifyContent: "flex-start",
      },
      "&:hover": {
        border: "none",
        boxShadow: "none",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: 0,
      flexWrap: "nowrap",
      flex: "none",
      width: "auto",
    }),
    singleValue: (provided) => ({
      ...provided,
      width: "auto",
      flex: "none",
      maxWidth: "none",
      overflow: "visible",
      position: "static",
      transform: "none",
      margin: 0,
      fontFamily: '"Jockey One", sans-serif',
      fontSize: "2rem",
      "@media (max-width: 500px)": {
        fontSize: "1.5rem",
      },
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      flex: "none",
      padding: 0,
      marginLeft: "4px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: 0,
      margin: 0,
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  return (
    <div className={styles.fundoPagina}>
      <HeaderAdms />
      <BotaoPagInicial />
      <RolarPCima />
      <ModalAmpliarImagem />

      <div className={styles.fundoVermais}>
        <div className={styles.painel}>
          {/* CARROSSEL DE IMAGENS */}
          <Carousel
            className={styles.carrossel}
            showThumbs={false}
            showStatus={false}
          >
            {/* Slide da Imagem de Entrada */}
            <div
              className={styles.slideImagemEntrada}
              style={{
                backgroundImage: `url(${obterUrlImagemEntrada()})`,
              }}
            >
              <div className={styles.containerImagemCarrossel}>
                <img
                  src={obterUrlImagemEntrada()}
                  alt="Imagem de entrada"
                  className={styles.imagemPrincipal}
                />
                <div className={styles.botoesUtilitarios}>
                  <label 
                    className={`${styles.botaoTrocarImagem} ${!modoEdicao ? styles.desativado : ''}`}
                    style={{ cursor: !modoEdicao ? 'not-allowed' : 'pointer' }}
                  >
                    <img src={`${import.meta.env.BASE_URL}pagVerMais/galeria.png`} alt="Trocar imagem" />
                    <input
                      type="file"
                      onChange={(e) =>
                        processarUploadImagem(e.target.files[0], "imagemEntrada")
                      }
                      style={{ display: "none" }}
                      accept="image/*"
                      disabled={!modoEdicao || salvandoDados}
                    />
                  </label>
                  <button
                    className={styles.botaoVerAmpliado}
                    onClick={() => {
                      setImagemParaAmpliar(obterUrlImagemEntrada());
                      setModalImagemAberto(true);
                    }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}pagVerMais/olho.png`}
                      alt="Ver imagem ampliada"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Slide da Imagem de Saída */}
            <div
              className={styles.slideImagemSaida}
              style={{
                backgroundImage: obterUrlImagemSaida() 
                  ? `url(${obterUrlImagemSaida()})`
                  : dadosOriginais.imagemEntrada
                  ? `url(${import.meta.env.VITE_API_URL}/uploads/${dadosOriginais.imagemEntrada})`
                  : "none",
              }}
            >
              {obterUrlImagemSaida() ? (
                <div className={styles.containerImagemCarrossel}>
                  <img
                    src={obterUrlImagemSaida()}
                    alt="Imagem de saída"
                    className={styles.imagemPrincipal}
                  />
                  <div className={styles.botoesUtilitarios}>
                    <label 
                      className={`${styles.botaoTrocarImagem} ${!modoEdicao ? styles.desativado : ''}`}
                      style={{ cursor: !modoEdicao ? 'not-allowed' : 'pointer' }}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}pagVerMais/galeria.png`}
                        alt="Trocar imagem"
                      />
                      <input
                        type="file"
                        onChange={(e) =>
                          processarUploadImagem(
                            e.target.files[0],
                            "imagemSaida"
                          )
                        }
                        style={{ display: "none" }}
                        accept="image/*"
                        disabled={!modoEdicao || salvandoDados}
                      />
                    </label>
                    <button
                      className={styles.botaoVerAmpliado}
                      onClick={() => {
                        setImagemParaAmpliar(obterUrlImagemSaida());
                        setModalImagemAberto(true);
                      }}
                    >
                      <img
                        src="pagVerMais/olho.png"
                        alt="Ver imagem ampliada"
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.semImagemDeSaida}>
                  <div className={styles.alinharImagemQuebrada}>
                    <img src={`${import.meta.env.BASE_URL}pagVerMais/semImagem.png`} alt="Sem imagem" />
                  </div>
                  <h1>Nenhuma imagem de saída foi cadastrada</h1>
                  <p>
                    Para inserir uma imagem,{" "}
                    <label>
                      clique aqui
                      <input
                        type="file"
                        onChange={(e) =>
                          processarUploadImagem(
                            e.target.files[0],
                            "imagemSaida"
                          )
                        }
                        style={{ display: "none" }}
                        accept="image/*"
                        ref={referenciaArquivo}
                        disabled={salvandoDados}
                      />
                    </label>{" "}
                    e selecione uma imagem do seu dispositivo
                  </p>
                </div>
              )}
            </div>
          </Carousel>

          <div className={styles.alinharDadosDeIdentificacao}>
            {/* SEÇÃO DE DESCRIÇÃO */}
            <div className={styles.dadosDeIdentificacao}>
              <Select
                options={opcoes.descricoes}
                styles={estilosSelectTitulo}
                isSearchable={false}
                value={descricaoSelecionada}
                onChange={(opcaoSelecionada) =>
                  setDescricaoSelecionada(opcaoSelecionada)
                }
              />
              <textarea
                className={styles.descricaoTextarea}
                value={obterValorDescricaoAtual()}
                onChange={capturarMudancaDescricao}
                placeholder={obterPlaceholderDescricao()}
                rows={5}
                disabled={!modoEdicao}
              />
            </div>

            {/* DADOS DE IDENTIFICAÇÃO */}
            <div className={styles.dadosDeIdentificacao}>
              <h1 className={styles.tituloDadosDeIdentificacao}>
                Dados de identificação
              </h1>
              <div className={styles.alinharDados}>
                <label className={styles.labelDeIdentificacao}>Nome:</label>
                <input
                  className={`${styles.inputDadosIdentificacao} ${!modoEdicao ? styles.inputDesativado : ''}`}
                  name="nome"
                  maxLength={30}
                  type="text"
                  value={dadosEditados.nome || ""}
                  onChange={capturarMudancaCampo}
                  disabled={!modoEdicao}
                />
              </div>
              <div className={styles.alinharDados}>
                <label className={styles.labelDeIdentificacao}>Idade:</label>
                <input
                  className={`${styles.inputDadosIdentificacao} ${!modoEdicao ? styles.inputDesativado : ''}`}
                  name="idade"
                  min="1"
                  max="20"
                  type="number"
                  value={dadosEditados.idade || ""}
                  onChange={capturarMudancaCampo}
                  disabled={!modoEdicao}
                />
              </div>
              <div className={styles.alinharDados}>
                <label className={styles.labelDeIdentificacao}>Sexo:</label>
                <Select
                  options={opcoes.sexoDoAnimal}
                  value={opcoes.sexoDoAnimal.find(
                    (opcao) => opcao.value === dadosEditados.sexo
                  )}
                  onChange={(opcaoSelecionada) =>
                    capturarMudancaSelecao("sexo", opcaoSelecionada)
                  }
                  className={styles.selectInserirAnimal}
                  isDisabled={!modoEdicao}
                />
              </div>
              <div className={styles.alinharDados}>
                <label className={styles.labelDeIdentificacao}>Tipo:</label>
                <Select
                  options={opcoes.tipoAnimal}
                  value={opcoes.tipoAnimal.find(
                    (opcao) => opcao.value === dadosEditados.tipo
                  )}
                  onChange={(opcaoSelecionada) =>
                    capturarMudancaSelecao("tipo", opcaoSelecionada)
                  }
                  className={styles.selectInserirAnimal}
                  isDisabled={!modoEdicao}
                />
              </div>
              <div className={styles.alinharDados}>
                <label className={styles.labelDeIdentificacao}>
                  Status de microchipagem:
                </label>
                <Select
                  options={opcoes.StatusMicrochipagem}
                  value={opcoes.StatusMicrochipagem.find(
                    (opcao) => opcao.value === dadosEditados.statusMicrochipagem
                  )}
                  onChange={(opcaoSelecionada) =>
                    capturarMudancaSelecao(
                      "statusMicrochipagem",
                      opcaoSelecionada
                    )
                  }
                  className={styles.selectInserirAnimal}
                  isDisabled={!modoEdicao}
                />
              </div>
            </div>

            {/* DADOS DE SAÚDE */}
            <div className={styles.dadosDeIdentificacao}>
              <h1 className={styles.tituloDadosDeIdentificacao}>
                Dados de saúde
              </h1>
              <div className={styles.alinharDados}>
                <label className={styles.labelDadosSaude}>
                  Status de vacinação:
                </label>
                <Select
                  options={opcoes.StatusVacinacao}
                  value={opcoes.StatusVacinacao.find(
                    (opcao) => opcao.value === dadosEditados.statusVacinacao
                  )}
                  className={styles.selectInserirAnimal}
                  isDisabled={true} // Sempre desabilitado pois é controlado pela data
                />
                <Tooltip id="idSelectNome" place="top">
                  O status de vacinação é controlado automaticamente pela data da vacinação.
                </Tooltip>
              </div>
              <div className={styles.alinharDados}>
                <label className={styles.labelDadosSaude}>
                  Data da última vacinação
                </label>
                <input
                  className={`${styles.inputDadosIdentificacao} ${!modoEdicao ? styles.inputDesativado : ''}`}
                  type="date"
                  name="dataVacinacao"
                  value={
                    dadosEditados.dataVacinacao
                      ? dadosEditados.dataVacinacao.split("T")[0]
                      : ""
                  }
                  onChange={capturarMudancaData}
                  max={new Date().toISOString().split("T")[0]}
                  disabled={!modoEdicao}
                />
              </div>
              <div className={styles.alinharDados}>
                <label className={styles.labelDadosSaude}>
                  Status de castração:
                </label>
                <Select
                  options={opcoes.StatusCastracao}
                  value={opcoes.StatusCastracao.find(
                    (opcao) => opcao.value === dadosEditados.statusCastracao
                  )}
                  onChange={(opcaoSelecionada) =>
                    capturarMudancaSelecao("statusCastracao", opcaoSelecionada)
                  }
                  className={styles.selectInserirAnimal}
                  isDisabled={!modoEdicao}
                />
              </div>
              <div className={styles.alinharDados}>
                <label className={styles.labelDadosSaude}>
                  Status de adoção:
                </label>
                <Select
                  options={opcoes.StatusAdocao}
                  value={opcoes.StatusAdocao.find(
                    (opcao) => opcao.value === dadosEditados.statusAdocao
                  )}
                  onChange={(opcaoSelecionada) =>
                    capturarMudancaSelecao("statusAdocao", opcaoSelecionada)
                  }
                  className={styles.selectInserirAnimal}
                  isDisabled={!modoEdicao}
                />
              </div>
              <div className={styles.alinharDados}>
                <label className={styles.labelDadosSaude}>
                  Status de vermifugação:
                </label>
                <Select
                  options={opcoes.StatusVermifugacao}
                  value={opcoes.StatusVermifugacao.find(
                    (opcao) => opcao.value === dadosEditados.statusVermifugacao
                  )}
                  onChange={(opcaoSelecionada) =>
                    capturarMudancaSelecao(
                      "statusVermifugacao",
                      opcaoSelecionada
                    )
                  }
                  className={styles.selectInserirAnimal}
                  isDisabled={!modoEdicao}
                />
              </div>
            </div>
          </div>

          {/* BOTÕES DE CONTROLE */}
          <div className={styles.botaoSalvarContainer}>
            {!modoEdicao ? (
              // Botão para ativar modo de edição
              <button
                className={styles.botaoEditar}
                onClick={ativarModoEdicao}
                disabled={salvandoDados}
              >
                {salvandoDados ? "Carregando..." : "Editar Dados"}
              </button>
            ) : (
              // Botões quando está em modo de edição
              <div className={styles.botoesEdicao}>
                <button
                  className={styles.botaoCancelar}
                  onClick={cancelarEdicao}
                  disabled={salvandoDados}
                >
                  Cancelar
                </button>
                <button
                  className={`${styles.botaoSalvar} ${
                    !existemAlteracoes || salvandoDados ? styles.desativado : ""
                  }`}
                  onClick={() => {
                    // Verificação final antes de salvar
                    if (
                      !verificarSeExistemAlteracoes(
                        dadosOriginais,
                        dadosEditados
                      ) && !imagemEntradaPendente && !imagemSaidaPendente
                    ) {
                      alert("Nenhuma alteração foi feita");
                      return;
                    }
                    salvarTodasAlteracoes();
                  }}
                  disabled={!existemAlteracoes || salvandoDados}
                >
                  {salvandoDados ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}