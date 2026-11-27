export default function Field({id, label, error, required = false, ...props}) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}{required && <span className="required-mark"> *</span>}</span>
      <input id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </label>
  );
}
