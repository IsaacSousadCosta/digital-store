import { Link, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Orders from "./pages/Orders/Orders";
import Register from "./pages/Register/Register";
import Cart from "./pages/Cart/Cart";
import Login from "./pages/Login/Login";
import "./App.css";
import "./components/store/store.css";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/carrinho" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/produto/:id" element={<ProductDetails />} />
        <Route path="/meus-pedidos" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="*" element={
          <main className="loja">
            <h1>Página não encontrada</h1>
            <Link to="/">Voltar à loja</Link>
          </main>
        } />
      </Route>
    </Routes>
  );
}
