
import { useEffect } from "react";
import {
  Outlet,
  useLocation,
  useNavigate
} from "react-router-dom";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  function pesquisar(termo) {
    const busca = termo.trim();

    navigate(
      busca
        ? `/products?filter=${encodeURIComponent(busca)}`
        : "/products"
    );
  }

  useEffect(() => {
    if (
      location.pathname === "/" &&
      ["#colecoes", "#sobre"].includes(location.hash)
    ) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <Header onSearch={pesquisar} />

      <Outlet />

      <Footer />
    </>
  );
}
