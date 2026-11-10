export default function FilterGroup({ title, inputType = "checkbox", options, onChange }) {
  return (
    <fieldset className="store-filter-group">
      <legend>{title}</legend>
      {options.map(option => (
        <label key={option.value ?? option.text}>
          <input type={inputType} name={title} value={option.value}
            checked={option.checked}
            onChange={onChange ? event => onChange(option.value, event.target.checked) : undefined} />
          {option.text}
        </label>
      ))}
    </fieldset>
  );
}
