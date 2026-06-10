"use client";

import { useState } from "react";
import Header from "../HeaderVisitantes/app";
import Footer from "../Footer/app";
import styles from "./doe.module.css";

export default function ComoDoar() {
  const [qrCopiado, setQrCopiado] = useState(false);

  async function copiarQRCode() {
  await navigator.clipboard.writeText("TESTEEEEE A DASDA DS.");
  setQrCopiado(true);
}

  return (
    <>
      <main>
        <section
          className={`${styles.secao} ${styles.parallax} ${styles.parallax1}`}
        >
          <Header />
          <h1>Tem interesse em fazer uma doação monetária?</h1>
        </section>

        <section
          className={`${styles.secao} ${styles.conteudo} ${styles.conteudo1}`}
        >
          <div className={styles.painel}>
            <h1>Escaneie o QR-Code abaixo.</h1>
            <h2>
              Ao escanear, você poderá fazer uma doação para o número PIX do
              Instituto Esperança. Qualquer valor é bem-vindo!
            </h2>
            <img src="QRCodeDoacao/QRCodeTeste.png"></img>

            <button
              onClick={copiarQRCode}
              className={qrCopiado ? styles.QRCodeCopiado : ""}
            >
              {qrCopiado ? "QR-Code copiado!" : "Clique aqui para copiar o QR-Code"}
            </button>
          </div>
        </section>

        <section
          className={`${styles.secao} ${styles.parallax} ${styles.parallax2}`}
        >
          <h1>Gostaria de doar itens para o nosso instituto?</h1>
        </section>

        <section
          className={`${styles.secao} ${styles.conteudo} ${styles.conteudo2}`}
        >
          <div className={styles.painel}>
            <h1>
              Você também pode mandar suprimentos ou equipamentos para nós!
            </h1>
            <h2>
              Desde que esteja em boas condições, o Instituto Esperança aceita a
              doação de itens que podem ser úteis nos cuidados diários com os
              nossos animais. Veja abaixo alguns os itens que nós aceitamos:
            </h2>
            <div className={styles.alinharContainerIcones}>
              <div className={styles.containerIcones}>
                <img src="pagDoacao/caminha.png"></img>
                <p>
                  <strong>Caminha de animais:</strong> Todos os nossos animais
                  dormem em camas para animais com tamanhos de acordo com o
                  porte deles, para que possam ter o máximo de conforto e
                  dignidade, porém, eventualmente acontece delas rasgarem ou de
                  mais animais chegarem e não ter caminhas suficientes para
                  todos.
                </p>
              </div>
              <div className={styles.containerIcones}>
                <img src="pagDoacao/coleira.png"></img>
                <p>
                  <strong>Coleira:</strong> Coleiras são muito úteis no momento
                  de colocar o cone veterinário, pois elas dão sustentação ao
                  cone. Além disso, na hora de entregar o animal nós podemos o
                  entregar com sua coleira, caso ele possua.
                </p>
              </div>
              <div className={styles.containerIcones}>
                <img src="pagDoacao/cone.png"></img>
                <p>
                  <strong>Cone Veterinário:</strong> Eventualmente nós
                  resgatamos animais doentes, que por sua vez, precisam do cone
                  para conseguirem se recuperar totalmente, portanto, cones para
                  animais de pequeno, médio e grande porte são sempre
                  bem-vindos.
                </p>
              </div>
              <div className={styles.containerIcones}>
                <img src="pagDoacao/racao.png"></img>
                <p>
                  <strong>Ração:</strong> Assim como nós, os animais também
                  precisam se alimentar e com tantos animais, a nossa demanda de
                  ração não para. Aceitamos ração para cachorros e gatos, sem
                  preferências.
                </p>
              </div>
            </div>
            <h2>
              <strong className={styles.strong}>Importante:</strong> A ração
              precisa estar totalmente fechada e na embalagem original, pois do
              contrário não aceitaremos &#40;risco de contaminação ou
              envenenamento&#41;. Além disso, não doe caminhas ou cobertores
              usados pets que estejam ou estiveram recentemente com doenças ou
              infecções contagiosas, como sarna ou cinomose, por exemplo.
              Pedimos a sua compreenção.
            </h2>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
