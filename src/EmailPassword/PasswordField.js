import React, { useState } from "react";
import { useEffect } from "react";

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

function formatPasswordRequirements(passwordSpecs) {
  let requirements = [];

  requirements.push(`at least ${passwordSpecs?.minCharacters || 6} characters`);

  let additionalReqs = [];

  if (passwordSpecs?.containsUppercase) {
    additionalReqs.push('one uppercase letter');
  }

  if (passwordSpecs?.containsLowercase) {
    additionalReqs.push('one lowercase letter');
  }

  if (passwordSpecs?.containsSpecialCharacter) {
    additionalReqs.push('one special character');
  }

  if (passwordSpecs?.containsNumber) {
    additionalReqs.push('one number');
  }

  if (additionalReqs.length > 0) {
    const additionalReqString = additionalReqs.length > 1
      ? additionalReqs.slice(0, -1).join(', ') + ', and ' + additionalReqs.slice(-1)
      : additionalReqs[0];
    requirements.push(`and contain at least ${additionalReqString}`);
  }

  let formattedString = 'Strong passwords have ' + requirements.join(' ') + '.';

  return formattedString;
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
  formInputStyles,
  formLabelStyles,
  setPasswordValid,
  authType
}) {
  const [show, setShow] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [resettingPassword, setResettingPassword] = useState(false);

  const isValid =
    passwordErrors({ password: value, passwordSpecs: specs }).length === 0;

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  useEffect(() => {
    setPasswordValid(isValid);
  }, [value])

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
        <label htmlFor="password" style={{ ...labelStyle, ...formLabelStyles }}>
          Password
        </label>
        {authType != "signUp" && typeof onResetPassword === "function" && (
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
          style={{ ...inputStyle, ...formInputStyles }}
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
          formatPasswordRequirements(specs)}
        &nbsp;
      </p>
    </div>
  );
}
