//================ Importações externas ================//
import styles from "./configuracoes.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

//================ Minhas importações ================//
import HeaderAdms from "../../HeaderAdms/app";
import BotaoPagInicial from "../../BotaoPagInicialAdms/app";
import FuncoesDeAdministrador from "../FuncoesAdm/app";
import CarrosselDeDoadores from "../CarrosselDeDoadores/app";
import CarrosselAnimaisAutonomo from "../CarrosselDeAnimais/app";


export default function Configuracoes() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate();
  
  const [abaAtiva, setAbaAtiva] = useState("primeiroTopico");

  useEffect(() => {
    const carregarUsuario = () => {
      try {
        const dadosUsuario = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        if (dadosUsuario && token) {
          const usuario = JSON.parse(dadosUsuario);
          setUsuarioLogado(usuario);
          console.log("👤 Usuário logado carregado:", usuario);
          console.log("🔑 Nível de acesso:", usuario.nivelDeAcesso);
        } else {
          console.log("❌ Nenhum usuário logado encontrado");
          // Opcional: redirecionar para login se não houver usuário logado
          // navigate("/autenticar");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    carregarUsuario();
  }, [navigate]);

  // Função para fazer logout
  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair da sua conta?")) {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      setUsuarioLogado(null);
      console.log("🚪 Usuário deslogado");
      alert("Logout realizado com sucesso!");

      // Redirecionar para página inicial após deslogar
      navigate("/");
    }
  };

  // Função para obter o nome do nível de acesso formatado
  const obterNomeNivelAcesso = (nivel) => {
    const niveis = {
      administrador: "Administrador(a)",
      subAdministrador: "Sub-administrador(a)",
      contribuinte: "Contribuinte",
      usuario: "Usuário",
    };
    return niveis[nivel] || "Usuário";
  };

  // Função para verificar se deve renderizar o componente
  const podeRenderizar = (componente) => {
    if (!usuarioLogado) return false;

    const nivel = usuarioLogado.nivelDeAcesso;

    switch (componente) {
      case "funcoesAdm":
        return nivel === "administrador";
      case "carrosselDoadores":
        return nivel === "administrador" || nivel === "subAdministrador";
      case "carrosselAnimais":
        return nivel === "administrador" || nivel === "subAdministrador";
      default:
        return false;
    }
  };

  // Componente de mensagem de acesso negado
  const MensagemAcessoNegado = ({ titulo }) => (
    <div className={styles.acessoNegado}>
      <h2 className={styles.tituloAcessoNegado}>Acesso Negado</h2>
      <p className={styles.mensagemAcessoNegado}>
        Seu nível de acesso não permite visualizar esta seção.
      </p>
    </div>
  );

  return (
    <div className={styles.fundoPagina}>
      <HeaderAdms />
      <BotaoPagInicial />
      <div className={styles.fundoPainel}>
        <div className={styles.painel}>
          <div className={styles.inicioPainel}>
            <div className={styles.topoInicioPainel}>
              <h1 className={styles.contaAtual}>Conta atual:</h1>
              <div
                className={styles.alinharDeslogue}
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
                title="Clique para sair da conta"
              >
                <h1 className={styles.textoDeslogue}>Deslogar</h1>
                <img
                  className={styles.iconeSair}
                  src={`${import.meta.env.BASE_URL}pagConfiguracoes/iconeSair.png`}
                  alt="Ícone de logout"
                />
              </div>
            </div>
            <div className={styles.alinharInfoUsuario}>
              <img
                className={styles.iconeUsuario}
                src={usuarioLogado?.foto || `${import.meta.env.BASE_URL}user.png`}
                alt="Avatar do usuário"
              />
              <h1 className={styles.nomeUsuario}>
                {usuarioLogado ? usuarioLogado.nome : "Carregando..."}
              </h1>
              <p className={styles.funcaoUsuario}>
                {usuarioLogado
                  ? obterNomeNivelAcesso(usuarioLogado.nivelDeAcesso)
                  : "Carregando..."}
              </p>
            </div>
          </div>

          <Tabs
            defaultActiveKey="primeiroTopico"
            onSelect={(key) => setAbaAtiva(key)}
            activeKey={abaAtiva}
            id="uncontrolled-tab-example"
            transition={true}
            className={styles.tabs}
          >
            <Tab
              eventKey="primeiroTopico"
              title="Carrossel de animais"
              tabClassName={abaAtiva === "primeiroTopico" ? styles.tabAtivo : styles.tabPadrao}
              className={styles.tab}
            >
              {podeRenderizar("carrosselAnimais") ? (
                <CarrosselAnimaisAutonomo />
              ) : (
                <MensagemAcessoNegado titulo="Carrossel de animais" />
              )}
            </Tab>
            <Tab
              eventKey="segundoTopico"
              title="Carrossel de doadores"
              tabClassName={abaAtiva === "segundoTopico" ? styles.tabAtivo : styles.tabPadrao}
              className={styles.tab}
            >
              {podeRenderizar("carrosselDoadores") ? (
                <CarrosselDeDoadores />
              ) : (
                <MensagemAcessoNegado titulo="Carrossel de doadores" />
              )}
            </Tab>
            <Tab
              eventKey="terceiroTopico"
              title="Funções de administrador"
              tabClassName={abaAtiva === "terceiroTopico" ? styles.tabAtivo : styles.tabPadrao}
              className={styles.tab}
            >
              {podeRenderizar("funcoesAdm") ? (
                <FuncoesDeAdministrador />
              ) : (
                <MensagemAcessoNegado titulo="Funções de administrador" />
              )}
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
