
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fazerLogin(email, password) {
  const response = await fetch(
    `${API_URL}/v1/user/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(
      resultado.error || "Não foi possível realizar o login."
    );
  }

  if (!resultado.token || !resultado.user) {
    throw new Error("Resposta de autenticação inválida.");
  }

  return resultado;
}

export async function cadastrarUsuario(dados) {
  const response = await fetch(
    `${API_URL}/v1/user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstname: dados.firstname.trim(),
        surname: dados.surname.trim(),
        email: dados.email.trim(),
        password: dados.password,
        confirmPassword: dados.confirmarSenha
      })
    }
  );

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(
      resultado.error || "Não foi possível cadastrar o usuário."
    );
  }

  return resultado;
}
