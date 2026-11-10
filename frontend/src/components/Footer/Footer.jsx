import { Link } from "react-router-dom";
import Logo from "../store/Logo";
import facebook from "../../assets/facebook.svg";
import instagram from "../../assets/instagram.svg";
import twitter from "../../assets/twitter.svg";
import "./Footer.css";

const socials = [
  { name: "Facebook", icon: facebook, href: "https://www.facebook.com/" },
  { name: "Instagram", icon: instagram, href: "https://www.instagram.com/" },
  { name: "X", icon: twitter, href: "https://x.com/" }
];

function Information({ title, informations }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      {informations.map(({ text, link }) => <Link key={text} to={link}>{text}</Link>)}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand" id="sobre">
          <Logo white />
          <p>Loja de calçados, estilo e novidades. Encontre os produtos ideais para você.</p>
          <div className="footer-socials">
            {socials.map(({ name, icon, href }) => (
              <a href={href} key={name} aria-label={name}><img src={icon} alt="" /></a>
            ))}
          </div>
        </div>
        <Information title="Informações" informations={[
          { text: "Sobre a Digital Store", link: "/#sobre" },
          { text: "Meus Pedidos", link: "/meus-pedidos" }
        ]} />
        <Information title="Categorias" informations={[
          { text: "Todos os produtos", link: "/products" },
          { text: "Tênis", link: "/products?filter=T%C3%AAnis" }
        ]} />
        <Information title="Minha conta" informations={[
          { text: "Entrar", link: "/login" },
          { text: "Cadastre-se", link: "/cadastro" }
        ]} />
      </div>
      <hr className="footer-rule" />
      <p className="footer-bottom">© {new Date().getFullYear()} Digital Store</p>
    </footer>
  );
}
