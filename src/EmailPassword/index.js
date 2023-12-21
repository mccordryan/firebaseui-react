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
  formDisabledStyles,
  formButtonStyles,
  formInputStyles,
  displayName,
  formLabelStyles,
  formSmallButtonStyles,
  customErrors,
  setMfaResolver,
}) {

  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);

  const [email, setEmail] = useState(urlParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);


  const [passwordValid, setPasswordValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  useEffect(() => {
    setFormIsValid(
      passwordValid && emailValid && (displayName === "required" ? name.length > 0 : true),
    );

  }, [emailValid, passwordValid, name]);



  // MFA Resolver

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (authType === "signIn") {
      try {
        await signInWithEmailAndPassword(auth, email, password).then((userCred) => {
          if (callbacks?.signInSuccessWithAuthResult) callbacks.signInSuccessWithAuthResult(userCred)
        })
      } catch (error) {
        setError(customErrors && customErrors[error.code] !== undefined ? customErrors[error.code] : errors[error.code] || error.message);
        if (callbacks?.signInFailure) callbacks.signInFailure(error)
      }
    } else {

      // first try to create an account
      try {
        await createUserWithEmailAndPassword(auth, email, password).then((userCred) => {
          if (callbacks?.signInSuccessWithAuthResult) callbacks.signInSuccessWithAuthResult(userCred)
        })
        setLoading(false);
        return;
      } catch (err) {
        // creating an account didn't work. Why not?

        const code = codeFromError(err);

        if (code === "auth/email-already-in-use" && authType !== "signUp") {
          // because the user already has an account! Let's try signing them in...
          try {
            await signInWithEmailAndPassword(auth, email, password).then((userCred) => {
              if (callbacks?.signInSuccessWithAuthResult) callbacks.signInSuccessWithAuthResult(userCred)
            })
            setLoading(false);
            return;
          } catch (err2) {
            const code2 = codeFromError(err2);
            if (code2 === "auth/multi-factor-auth-required") {
              // signing them in didn't work because they have MFA enabled. Let's send them an MFA token
              setMfaResolver(getMultiFactorResolver(auth, err2))
              setMfaSignIn(true);
              setSendSMS(true);
            } else {
              // signing in didn't work for a different reason
              setError(customErrors && customErrors[code2] !== undefined ? customErrors[code2] : errors[code2] || err2.message);
              if (callbacks?.signInFailure) callbacks.signInFailure(err2)
            }
          }
        } else {
          // creating an account didn't work for some other reason
          setError(customErrors && customErrors[code] !== undefined ? customErrors[code] : errors[code] || err.message);
          if (callbacks?.signInFailure) callbacks.signInFailure(err)
        }
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
        setEmailValid={setEmailValid}
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
        setPasswordValid={setPasswordValid}
      />

      <button disabled={loading || !formIsValid} type="submit" style={{ ...buttonStyle, ...formButtonStyles, ...(formIsValid ? {} : { backgroundColor: "#696969", borderColor: "#2e2e2e", ...formDisabledStyles }) }}>
        {loading ? "Loading..." : "Log in or create account"}
      </button>
      {false && (
        <button
          type="button"
          style={{ ...cancelButtonStyle, ...formSmallButtonStyles, }}
          onClick={() => setEmailExists(null)}
        >
          Cancel
        </button>
      )}
    </form>
  );
}
