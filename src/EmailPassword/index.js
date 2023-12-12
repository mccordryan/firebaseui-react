"use client";

import React from "react";
import {
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import { errors } from "../Errors";

import EmailField from "./EmailField";
import PasswordField from "./PasswordField";

import MFAForm from "./MFAForm";

import {
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  buttonStyle,
  cancelButtonStyle,
} from "./defaultStyles";

function codeFromError(error) {
  let code = error.code;
  if (error.customData?.message) {
    // extract the error code from between the parenthesis
    code = error.customData.message.match(/\(([^)]+)\)/)[1];
  }
  return code;
}

export default function EmailPassword({
  auth,
  callbacks,
  authType = "both",
  setAlert,
  setError,
  continueUrl,
  passwordSpecs,
  setSendSMS,
  setMfaSignIn,
  fullLabel,
  formDisabledStyles,
  formButtonStyles,
  formInputStyles,
  formLabelStyles,
  formSmallButtonStyles,
  customErrors
  // setMfaResolver,
}) {

  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState(urlParams.get("email") || "");

  const [password, setPassword] = useState("");

  // MFA Resolver
  const [resolver, setResolver] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    // first try to create an account
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return;
    } catch (err) {
      // creating an account didn't work. Why not?

      const code = codeFromError(err);
      if (code === "auth/email-already-in-use") {
        // because the user already has an account! Let's try signing them in...
        try {
          await signInWithEmailAndPassword(auth, email, password);
          setLoading(false);
          return;
        } catch (err2) {
          const code2 = codeFromError(err2);
          if (code2 === "auth/multi-factor-auth-required") {
            // signing them in didn't work because they have MFA enabled. Let's send them an MFA token
            setResolver(getMultiFactorResolver(auth, err2));
          } else {
            // signing in didn't work for a different reason
            setError(errors[code2] || err2.message);
            setError(customErrors && customErrors[code2] !== undefined ? customErrors[code2] : errors[code2] || err2.message);
          }
        }
      } else {
        // creating an account didn't work for some other reason
        setError(customErrors && customErrors[code] !== undefined ? customErrors[code] : errors[code] || err.message);
      }
    }
  }

  const [resetLinkSent, setResetLinkSent] = useState(false);

  async function onResetPassword() {
    setLoading(true);
    const url = new URL(continueUrl);
    // add email query param to url
    url.searchParams.append("email", email);
    url.searchParams.append("resetPassword", "true");

    await sendPasswordResetEmail(auth, email, {
      handleCodeInApp: !continueUrl,
      url: url.toString(),
    });
    setResetLinkSent(true);
    setLoading(false);
    setAlert("Check your email for a password reset link.");
  }

  if (resolver)
    return (
      <MFAForm
        auth={auth}
        resolver={resolver}
        buttonStyle={buttonStyle}
        validInputStyle={validInputStyle}
        labelStyle={labelStyle}
      />
    );

  return (
    <form onSubmit={onSubmit} style={{ width: "100%" }}>
      <EmailField
        value={email}
        setValue={setEmail}
        validInputStyle={validInputStyle}
        invalidInputStyle={invalidInputStyle}
        labelStyle={labelStyle}
        descriptionStyle={descriptionStyle}
        disabled={loading}
        formInputStyles={formInputStyles}
        formLabelStyles={formLabelStyles}
      />

      <PasswordField
        value={password}
        setValue={setPassword}
        specs={passwordSpecs}
        validInputStyle={validInputStyle}
        invalidInputStyle={invalidInputStyle}
        labelStyle={labelStyle}
        descriptionStyle={descriptionStyle}
        newPassword={false}
        onResetPassword={onResetPassword}
        disabled={loading}
        formInputStyles={formInputStyles}
        formLabelStyles={formLabelStyles}
      />

      <button disabled={loading} type="submit" style={{ ...buttonStyle, ...formButtonStyles }}>
        {loading ? "Loading..." : "Log in or create account"}
      </button>
      {false && (
        <button
          type="button"
          style={{ ...cancelButtonStyle, ...formSmallButtonStyles }}
          onClick={() => setEmailExists(null)}
        >
          Cancel
        </button>
      )}
    </form>
  );
}
