
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth.js";
import { useCart } from "../../contexts/useCart.js";
import Logo from "../store/Logo";
import miniCart from "../../assets/mini-cart.svg";
import "./Header.css";

export default function Header({ onSearch }) {
  const [busca, setBusca] = useState("");
  const { pathname, hash } = useLocation();
  const categoriasAtivas = pathname === "/" && hash === "#colecoes";

  const { quantidadeTotal } = useCart();
  const { usuario, autenticado, sair } = useAuth();

  function pesquisar(event) {
    event.preventDefault();

    if (typeof onSearch === "function") {
      onSearch(busca.trim());
    }
  }

  function classeNavegacao({ isActive }) {
    return isActive ? "nav-link active" : "nav-link";
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-main">
          <Link className="site-logo" to="/">
            <Logo />
          </Link>

          <form
            className="search-form"
            onSubmit={pesquisar}
            role="search"
          >
            <input
              type="search"
              placeholder="Pesquisar produto..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
              aria-label="Pesquisar produtos"
            />

            <button type="submit" aria-label="Buscar produtos">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m15 15 5 5" />
              </svg>
            </button>
          </form>

          <div className="header-actions">
            {autenticado ? (
              <>
                <span className="usuario-nome">
                  Olá, {usuario.firstname}!
                </span>

                <button
                  type="button"
                  className="logout-button"
                  onClick={sair}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/cadastro">
                  Cadastre-se
                </Link>

                <Link
                  to="/login"
                  className="login-button"
                >
                  Entrar
                </Link>
              </>
            )}

            <Link
              to="/carrinho"
              className="cart-link"
              aria-label={`Meu carrinho: ${quantidadeTotal} itens`}
            >
              <img className="cart-icon" src={miniCart} alt="" />

              {quantidadeTotal > 0 && (
                <span className="cart-count">
                  {quantidadeTotal}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav
          className="header-nav"
          aria-label="Menu principal"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => classeNavegacao({ isActive: isActive && !categoriasAtivas })}
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => classeNavegacao({ isActive: isActive || pathname === "/produtos" })}
          >
            Produtos
          </NavLink>

          <Link
            to="/#colecoes"
            className={classeNavegacao({ isActive: categoriasAtivas })}
            aria-current={categoriasAtivas ? "location" : undefined}
          >
            Categorias
          </Link>

          <NavLink
            to="/meus-pedidos"
            className={classeNavegacao}
          >
            Meus Pedidos
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
