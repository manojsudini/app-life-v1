import React from "react";

function SearchableSelect({
  label,
  value,
  options = [],
  onChange,
  placeholder = "Search options",
  helperText = "",
  disabled = false,
  required = false,
}) {
  const [query, setQuery] = React.useState(value || "");
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const handleSelect = (option) => {
    onChange(option);
    setQuery(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      setIsOpen(false);
      setQuery(value || "");
    }, 120);
  };

  return (
    <label className="field-group searchable-field">
      <span className="field-label">
        {label}
        {required ? <span className="field-required">*</span> : null}
      </span>
      <div className={`searchable-control ${disabled ? "is-disabled" : ""}`}>
        <input
          ref={inputRef}
          className="searchable-input"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          className="searchable-trigger"
          type="button"
          onClick={() => {
            if (!disabled) {
              setIsOpen((current) => !current);
              inputRef.current?.focus();
            }
          }}
          aria-label={`Toggle ${label}`}
        >
          <span />
        </button>
        {isOpen && !disabled ? (
          <div className="searchable-menu" role="listbox">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`searchable-option ${option === value ? "is-selected" : ""}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="searchable-empty">No options found.</div>
            )}
          </div>
        ) : null}
      </div>
      {helperText ? <p className="field-help">{helperText}</p> : null}
    </label>
  );
}

export default SearchableSelect;

