export default function ProductOptions({
  title, options, type = "text", shape = "square", radius = 4, value, onChange
}) {
  return (
    <fieldset className="store-product-options">
      <legend>{title}</legend>
      <div>
        {options.map(option => (
          <button key={option} type="button" aria-pressed={value === option}
            aria-label={type === "color" ? option : undefined}
            className={`store-option store-option--${shape}`}
            style={{ borderRadius: shape === "circle" ? "50%" : `${radius}px`,
              backgroundColor: type === "color" ? option : undefined }}
            onClick={() => onChange(option)}>
            {type === "text" && option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
