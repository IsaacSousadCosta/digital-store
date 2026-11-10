
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth.js";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { entrar, autenticado, usuario } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviarFormulario(event) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      await entrar(email.trim(), password);

      setPassword("");

      // Redirecionar à página inicial após o login
      navigate("/", { replace: true });
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  if (autenticado) {
    return (
      <main className="login-page">
        <div className="login-card">
          <h1>Você já está conectado!</h1>

          <p>Olá, {usuario.firstname}!</p>

          <Link to="/">Voltar à loja</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Acesse sua conta</h1>

        <p>Entre com seu e-mail e senha.</p>

        {location.state?.mensagem && (
          <p role="status">
            {location.state.mensagem}
          </p>
        )}

        <form onSubmit={enviarFormulario}>
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Senha</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {erro && (
            <p className="login-error" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p>
          Ainda não tem uma conta?{" "}
          <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </main>
  );
}
