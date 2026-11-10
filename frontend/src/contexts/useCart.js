import { useContext } from "react";
import { CartContext } from "./CartContext.js";

export function useCart() {
  const contexto = useContext(CartContext);

  if (!contexto) {
    throw new Error(
      "useCart deve ser utilizado dentro de CartProvider."
    );
  }

  return contexto;
}