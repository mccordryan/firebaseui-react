import React, { useState } from "react";

function passwordErrors({ password, passwordSpecs }) {
  const errors = [];
  const minCharacters = Math.max(6, passwordSpecs?.minCharacters || 6);
  if (password.length < minCharacters)
    errors.push(`be at least ${minCharacters} characters long`);

  if (passwordSpecs?.containsUppercase && !/[A-Z]/.test(password)) {
    errors.push("contain at least one uppercase character");
  }

  if (passwordSpecs?.containsLowercase && !/[a-z]/.test(password)) {
    errors.push("contain at least one lowercase character");
  }

  if (passwordSpecs?.containsNumber && !/\d/.test(password)) {
    errors.push("contain at least one number");
  }

  if (
    passwordSpecs?.containsSpecialCharacter &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push("contain at least one special character");
  }

  return errors;
}

export default function PasswordField({
  value,
  setValue,
  specs,
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  newPassword = false,
  onResetPassword = null,
}) {
  const [show, setShow] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [resettingPassword, setResettingPassword] = useState(false);

  const isValid =
    passwordErrors({ password: value, passwordSpecs: specs }).length === 0;

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  return (
    <div>
      <div
        htmlFor="password"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label htmlFor="password" style={labelStyle}>
          Password
        </label>
        {typeof onResetPassword === "function" && (
          <div style={{ fontSize: "0.875rem" }}>
            <button
              style={{ fontWeight: "600", color: "#2563eb" }}
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                setResettingPassword(true);
                await onResetPassword();
                setResettingPassword(false);
              }}
              // onMouseOver={(e) => (e.target.style.color = "#3b82f6")}
              // onMouseOut={(e) => (e.target.style.color = "#2563eb")}
            >
              {resettingPassword ? "Sending..." : "Send reset link"}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <input
          required
          type={show ? "text" : "password"}
          name="password"
          id="password"
          style={inputStyle}
          placeholder={newPassword ? "create a new password" : "your password"}
          autoComplete={newPassword ? "new-password" : "current-password"}
          aria-describedby="password-description"
          aria-invalid={!isValid ? "true" : "false"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsDirty(true)}
        />
      </div>
      <p style={descriptionStyle} id="password-description">
        {isDirty &&
          !isValid &&
          "Strong passwords have at least 6 characters and a mix of letters, numbers, and symbols."}
        &nbsp;
      </p>
    </div>
  );
}
