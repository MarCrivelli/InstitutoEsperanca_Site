const ENDPOINTS = [
  `${import.meta.env.VITE_API_URL}/animais`,
  `${import.meta.env.VITE_API_URL}/listar/animais`,
];

export async function buscarAnimaisBackend() {
  let ultimoErro = null;

  for (const url of ENDPOINTS) {
    try {
      const resposta = await fetch(url);

      if (!resposta.ok) {
        ultimoErro = new Error(`Erro ao buscar animais: ${resposta.status}`);
        continue;
      }

      const dados = await resposta.json();
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  throw ultimoErro || new Error("Não foi possível buscar os animais.");
}