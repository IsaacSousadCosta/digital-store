
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cadastrarUsuario } from "../../services/authService";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    surname: "",
    email: "",
    password: "",
    confirmarSenha: ""
  });

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    setErro("");

    if (!form.firstname.trim() || !form.surname.trim()) {
      setErro("Informe seu nome e sobrenome.");
      return;
    }

    if (form.password.length < 8) {
      setErro("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (form.password !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      await cadastrarUsuario(form);

      navigate("/login", {
        state: {
          mensagem: "Cadastro realizado! Entre com sua conta."
        }
      });
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="register-page">
      <div className="register-card">
        <h1>Crie sua conta</h1>
        <p>Preencha seus dados para se cadastrar na Digital Store.</p>

        <form onSubmit={enviarFormulario}>
          <label htmlFor="firstname">Nome</label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            value={form.firstname}
            onChange={alterarCampo}
            autoComplete="given-name"
            maxLength={100}
            required
          />

          <label htmlFor="surname">Sobrenome</label>
          <input
            id="surname"
            name="surname"
            type="text"
            value={form.surname}
            onChange={alterarCampo}
            autoComplete="family-name"
            maxLength={100}
            required
          />

          <label htmlFor="email-register">E-mail</label>
          <input
            id="email-register"
            name="email"
            type="email"
            value={form.email}
            onChange={alterarCampo}
            autoComplete="email"
            required
          />

          <label htmlFor="password-register">Senha</label>
          <input
            id="password-register"
            name="password"
            type="password"
            value={form.password}
            onChange={alterarCampo}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="confirm-password">
            Confirmar senha
          </label>
          <input
            id="confirm-password"
            name="confirmarSenha"
            type="password"
            value={form.confirmarSenha}
            onChange={alterarCampo}
            autoComplete="new-password"
            minLength={8}
            required
          />

          {erro && (
            <p className="register-error" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando}>
            {carregando ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <p className="register-login">
          Já possui uma conta?{" "}
          <Link to="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
