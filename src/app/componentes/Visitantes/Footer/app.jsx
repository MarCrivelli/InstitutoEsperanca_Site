import styles from "./footer.module.css";

export default function Footer() {
  return (
    <>
      <div className={styles.infoInstituto}>
        <div className={styles.sobreNos}>
          <h1 className={styles.tituloSeccao}>Sobre nós</h1>
          <p>
            O instituto Esperança é uma instituição sem fins lucrativos que atua
            diretamente na causa animal com o objetivo principal de
            conscientizar as pessoas quanto ao bem estar animal, maus tratos e
            adoção responsável. Além disso desenvolvemos trabalhos voltados para
            a tríade da Saúde Única (ser humano, meio ambiente e animais).
            Contamos com o apoio de uma casa de passagem, que de acordo com a
            disponibilidade de vaga acolhe animais em situação de
            vulnerabilidade, onde recebem atendimento médico veterinário,
            tratamento terapêutico e ressocialização, para assim,
            posteriormente, estarem disponíveis para adoção responsável. Além
            disso, contamos com o projeto Abrigo comunitário , onde damos
            assistências para aquelas pessoas que decidiram zelar por algum
            animalzinho na comunidade em que vive.
          </p>
        </div>
        <div className={styles.redesSociais}>
          <h1 className={styles.tituloSeccao}>Nos siga nas redes sociais!</h1>
          <div className={styles.alinharRedesSociais}>
            <a
              href="https://www.instagram.com/esperancaavozdosanimais/"
              target="_blank"
            >
              <img src={`${import.meta.env.BASE_URL}footer/instagram.png`}></img>
            </a>
            <a
              href="https://www.facebook.com/esperanca.a.voz.dos.animais"
              target="_blank"
            >
              <img src={`${import.meta.env.BASE_URL}footer/facebook.png`}></img>
            </a>
          </div>
        </div>
        <div className={styles.contato}>
          <h1 className={styles.tituloSeccao}>Contate-nos</h1>
          <div className={styles.alinharInfoContato}>
            <strong>Telefone:</strong>
            <p>+55 67 99904-2349</p>
          </div>
          <div className={styles.alinharInfoContato}>
            <strong>Cidade que atuamos:</strong>
            <p>Taquarussu (MS)</p>
          </div>
          <div className={styles.alinharInfoContato}>
            <strong>Localização:</strong>
            <p>Rua José Martins dos Santos, nº 150</p>
          </div>
        </div>
      </div>
    </>
  );
}
