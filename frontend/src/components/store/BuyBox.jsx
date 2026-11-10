import star from "../../assets/star-icon.svg";
import { formatarPreco } from "../../services/productPresentation";

export default function BuyBox({
  name, reference, stars, rating = 0, price, priceDiscount, description, children, onBuy, disabled
}) {
  return (
    <div className="store-buy-box">
      <h1>{name}</h1>
      <p className="store-reference">Ref. {reference}</p>
      <div className="store-rating">
        {stars != null && <span>{stars} <img src={star} alt="estrelas" /></span>}
        <small>{rating === 0 ? "Sem avaliações" : `(${rating} avaliações)`}</small>
      </div>
      <div className="store-buy-price">
        {priceDiscount != null && <del>{formatarPreco(price)}</del>}
        <strong>{formatarPreco(priceDiscount ?? price)}</strong>
      </div>
      {description && <p className="store-description">{description}</p>}
      {children}
      <button type="button" className="details-buy" onClick={onBuy} disabled={disabled}>Comprar</button>
    </div>
  );
}
