import { Link } from "react-router-dom";

export default function Section({ title, titleAlign = "left", link, children, className = "", id }) {
  return (
    <section className={className} id={id}>
      <div className={`store-section-heading store-section-heading--${titleAlign}`}>
        <h2>{title}</h2>
        {link && <Link to={link.href}>{link.text}</Link>}
      </div>
      {children}
    </section>
  );
}
