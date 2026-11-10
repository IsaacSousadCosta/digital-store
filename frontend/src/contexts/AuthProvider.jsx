
import { useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { fazerLogin } from "../services/authService.js";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  const autenticado = Boolean(usuario && token);

  async function entrar(email, password) {
    const resultado = await fazerLogin(email, password);

    setUsuario(resultado.user);
    setToken(resultado.token);

    return resultado.user;
  }

  function sair() {
    setUsuario(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado,
        entrar,
        sair
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
