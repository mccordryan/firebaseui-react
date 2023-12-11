import React, { useState } from "react";

export default function EmailField({
  value,
  setValue,
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  disabled = false,
}) {
  const [isDirty, setIsDirty] = useState(false);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  return (
    <div>
      <label htmlFor="email" style={labelStyle}>
        Email address
      </label>
      <div style={{ marginTop: "0.5rem" }}>
        <input
          required
          type="email"
          name="email"
          id="email"
          style={inputStyle}
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
