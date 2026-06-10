import styles from "./exibicaoDeAnimais.module.css";
import { Link } from "react-router-dom";
import opcoes from "/src/app/componentes/Administradores/OpcoesDeSelecao/opcoes";

export default function ExibicaoDeAnimais({
  animais,
  filtrosAplicados,
  modoSelecaoPostagem,
  animaisSelecionados,
  toggleSelecaoAnimal,
}) {
  // Configuração do truncamento 
  const TAMANHO_MAX_NOME = 15;
  
  // Função para truncar o nome do animal
  const truncarNome = (nome) => {
    if (!nome) return "";
    
    if (nome.length <= TAMANHO_MAX_NOME) {
      return nome;
    }
    
    // Se o caractere na posição limite é um espaço, não conta
    let posicaoCorte = TAMANHO_MAX_NOME - 3; // Reserva espaço para "..."
    
    // Se o caractere na posição do corte + 1 é um espaço, não precisa contar
    if (nome[posicaoCorte] === ' ') {
      // Verifica se há caracteres não-espaço após este espaço
      let temLetraDepois = false;
      for (let i = posicaoCorte + 1; i < nome.length; i++) {
        if (nome[i] !== ' ') {
          temLetraDepois = true;
          break;
        }
      }
      
      // Se há letra depois do espaço, inclui o espaço no corte
      if (temLetraDepois) {
        posicaoCorte++;
      }
    }
    
    return nome.substring(0, posicaoCorte) + "...";
  };

  // Verificação de segurança para animais não definido ou não array
  if (!animais || !Array.isArray(animais)) {
    return (
      <div className={styles.mensagemNenhumAnimal}>
        <img
          className={styles.imagemPreCadastro}
          src={`${import.meta.env.BASE_URL}pagFichasDAnimais/animaisConfusos.png`}
          alt="Ícone de animais confusos"
        />
        <h2 className={styles.textoPreCadastro}>Carregando animais...</h2>
      </div>
    );
  }

  return (
    <>
      {animais.length === 0 ? (
        <div className={styles.mensagemNenhumAnimal}>
          <img
            className={styles.imagemPreCadastro}
            src={`${import.meta.env.BASE_URL}pagFichasDAnimais/animaisConfusos.png`}
            alt="Ícone de animais confusos"
          />
          <h2 className={styles.textoPreCadastro}>
            {filtrosAplicados
              ? "Nenhum animal encontrado com os filtros aplicados. Tente ajustar os filtros."
              : "Nenhum animal cadastrado. Cadastre um novo animal!"}
          </h2>
        </div>
      ) : (
        animais.map((animal) => (
          <div className={styles.cardAnimais} key={animal.id}>
            <div className={styles.divImagem}>
              <img
                className={styles.imagemAnimais}
                src={
                  animal.imagemEntrada
                    ? `${import.meta.env.VITE_API_URL}/uploads/${animal.imagemEntrada}`
                    : `${import.meta.env.BASE_URL}pagFichasDAnimais/imagemTeste.jpg`
                }
                alt="Imagem do animal"
              />
            </div>
            <div className={styles.infoAnimais}>
              <div className={styles.containerNome}>
                <h1 className={styles.nomeAnimal}>
                  {truncarNome(animal.nome)}
                </h1>
                {animal.nome.length > TAMANHO_MAX_NOME && (
                  <div className={styles.tooltip}>
                    {animal.nome}
                  </div>
                )}
              </div>
              <p className={styles.dadosAnimais}>
                Idade:{" "}
                {opcoes.vincularLabel(animal.idade?.toString(), "idadeAnimais")}
              </p>
              <p className={styles.dadosAnimais}>
                Sexo: {opcoes.vincularLabel(animal.sexo, "sexoDoAnimal")}
              </p>
              <p className={styles.dadosAnimais}>
                Status de vacinação:{" "}
                {opcoes.vincularLabel(
                  animal.statusVacinacao,
                  "StatusVacinacao"
                )}
              </p>
              <p className={styles.dadosAnimais}>
                Status de castração:{" "}
                {opcoes.vincularLabel(
                  animal.statusCastracao,
                  "StatusCastracao"
                )}
              </p>
              {modoSelecaoPostagem ? (
                  <button
                    onClick={() => toggleSelecaoAnimal(animal.id)}
                    className={`${styles.botaoSelecionar} ${animaisSelecionados.includes(animal.id) ? styles.selecionado : ''}`}
                  >
                    {animaisSelecionados.includes(animal.id) ? 'Desfazer' : 'Selecionar'}
                  </button>
                ) : (
                  <Link
                    to={`/ver_mais/${animal.id}`}
                    className={styles.botaoCard}
                  >
                    Ver mais
                  </Link>
                )}
            </div>
          </div>
        ))
      )}
    </>
  );
}