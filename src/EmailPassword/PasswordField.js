"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import { translate } from "../Languages";

function passwordErrors({ password, passwordSpecs }) {
  const errors = [];
  const minCharacters = Math.max(
    6,
    passwordSpecs?.minCharacters || 6,
  );
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

function formatPasswordRequirements(
  passwordSpecs,
  language,
  customText,
) {
  let requirements = [];

  requirements.push(
    `${translate("atLeast", language, customText)} ${
      passwordSpecs?.minCharacters || 6
    } ${translate("characters", language, customText)}`,
  );

  let additionalReqs = [];

  if (passwordSpecs?.containsUppercase) {
    additionalReqs.push(
      translate("oneUppercase", language, customText),
    );
  }

  if (passwordSpecs?.containsLowercase) {
    additionalReqs.push(
      translate("oneLowercase", language, customText),
    );
  }

  if (passwordSpecs?.containsSpecialCharacter) {
    additionalReqs.push(
      translate("oneSpecial", language, customText),
    );
  }

  if (passwordSpecs?.containsNumber) {
    additionalReqs.push(translate("oneNumber", language, customText));
  }

  if (additionalReqs.length > 0) {
    const additionalReqString =
      additionalReqs.length > 1
        ? additionalReqs.slice(0, -1).join(", ") +
          `, ${translate("and", language, customText)} ` +
          additionalReqs.slice(-1)
        : additionalReqs[0];
    requirements.push(
      `${translate(
        "andContainAtLeast",
        language,
        customText,
      )} ${additionalReqString}`,
    );
  }

  let formattedString =
    translate("strongPasswordsHave", language, customText) +
    " " +
    requirements.join(" ") +
    ".";

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
  formSmallButtonStyles,
  setPasswordValid,
  authType,
  emailValid,
  setError,
  callbacks,
  language,
  customText,
}) {
  const [show, setShow] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [resettingPassword, setResettingPassword] = useState(false);

  const isValid =
    passwordErrors({ password: value, passwordSpecs: specs })
      .length === 0;

  const inputStyle =
    isDirty && !isValid ? invalidInputStyle : validInputStyle;

  useEffect(() => {
    setPasswordValid(isValid);
  }, [value]);

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
        <label
          htmlFor="password"
          style={{ ...labelStyle, ...formLabelStyles }}
        >
          {newPassword
            ? translate("newPassword", language, customText)
            : translate("password", language, customText)}
        </label>
        {authType != "signUp" && (
          <div style={{ fontSize: "0.875rem" }}>
            <button
              style={{
                fontWeight: "600",
                color: emailValid ? "#2563eb" : "#3b3b3b",
                ...formSmallButtonStyles,
              }}
              type="button"
              tabIndex="4"
              onClick={async e => {
                e.preventDefault();
                if (!newPassword) {
                  if (!emailValid) {
                    setError(
                      translate(
                        "emailDirtyNewPassword",
                        language,
                        customText,
                      ),
                    );
                  } else {
                    setResettingPassword(true);
                    await onResetPassword();
                    setResettingPassword(false);
                  }
                } else {
                  if (callbacks?.signInSuccessWithAuthResult)
                    callbacks.signInSuccessWithAuthResult();
                }
              }}
              // onMouseOver={(e) => (e.target.style.color = "#3b82f6")}
              // onMouseOut={(e) => (e.target.style.color = "#2563eb")}
            >
              {newPassword
                ? translate("skip", language, customText)
                : resettingPassword
                ? translate("sending", language, customText)
                : translate("sendResetLink", language, customText)}
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
          placeholder={
            newPassword
              ? translate(
                  "newPasswordPlaceholder",
                  language,
                  customText,
                )
              : translate("passwordPlaceholder", language, customText)
          }
          autoComplete={
            newPassword ? "new-password" : "current-password"
          }
          aria-describedby="password-description"
          aria-invalid={!isValid ? "true" : "false"}
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={() => setIsDirty(true)}
          tabIndex="2"
        />
      </div>
      <p style={descriptionStyle} id="password-description">
        {isDirty &&
          !isValid &&
          formatPasswordRequirements(specs, language, customText)}
        &nbsp;
      </p>
    </div>
  );
}
