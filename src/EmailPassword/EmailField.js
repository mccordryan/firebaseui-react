import React, { useState } from "react";
import { useEffect } from "react";

export default function EmailField({
  value,
  setValue,
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  disabled = false,
  formInputStyles,
  formLabelStyles,
  setEmailValid
}) {
  const [isDirty, setIsDirty] = useState(false);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  useEffect(() => {
    setEmailValid(isValid)
  }, [value])

  return (
    <div>
      <label htmlFor="email" style={{ ...labelStyle, ...formLabelStyles }}>
        Email address
      </label>
      <div style={{ marginTop: "0.5rem" }}>
        <input
          required
          type="email"
          name="email"
          id="email"
          style={{ ...inputStyle, ...formInputStyles }}
          placeholder="you@example.com"
          autoComplete="email"
          aria-describedby="email-description"
          aria-invalid={!isValid ? "true" : "false"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsDirty(true)}
          disabled={disabled}
        />
      </div>
      <p style={descriptionStyle} id="email-description">
        {isDirty && !isValid && "Please enter a valid email address."}&nbsp;
      </p>
    </div>
  );
}
