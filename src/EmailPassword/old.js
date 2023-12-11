"use client";

import React from "react";
import {
  createUserWithEmailAndPassword,
  getMultiFactorResolver,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import { errors } from "./Errors";

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

export default function EmailPassword({
  auth,
  callbacks,
  authType = "both",
  setAlert,
  setError,
  resetContinueUrl,
  passwordSpecs,
  setSendSMS,
  setMfaSignIn,
  setMfaResolver,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);

  const emailRef = useRef(null);
  const [showPassHelper, setShowPassHelper] = useState(false);

  useEffect(() => {
    setFormIsValid(
      isEmailValid() && (resetPassword ? true : isPasswordValid()),
    );

    setShowPassHelper(!isPasswordValid() && password.length > 0);
  }, [email, password]);

  const isEmailValid = function () {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isPasswordValid = function () {
    return passwordErrors({ password, passwordSpecs }).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!isEmailValid()) {
      setAlert("Please enter a valid email address.");
      return;
    }
    if (!isPasswordValid()) {
      setAlert("Please enter a valid password.");
      return;
    }

    if (resetPassword) {
      await sendPasswordResetEmail(auth, email, {
        handleCodeInApp: !resetContinueUrl,
        url: resetContinueUrl,
      });

      setAlert(`Check your ${email} email for a link to reset your password.`);
    } else {
      await authenticateUser();
    }
  };

  const authenticateUser = async () => {
    //TODO error handling
    if (authType == "both") {
      try {
        await signInWithEmailAndPassword(auth, email, password).then((user) => {
          if (callbacks?.signInSuccessWithAuthResult) {
            callbacks.signInSuccessWithAuthResult(user);
          }
        });
      } catch (signInError) {
        try {
          await createUserWithEmailAndPassword(auth, email, password).then(
            (user) => {
              if (callbacks?.signInSuccessWithAuthResult) {
                callbacks.signInSuccessWithAuthResult(user);
              }
            },
          );
        } catch (signUpError) {
          console.log(signUpError);
          if (signUpError.code === "auth/email-already-in-use") {
            //SIGN IN PROBLEM
            if (signInError.code === "auth/multi-factor-auth-required") {
              setMfaResolver(getMultiFactorResolver(auth, signInError));
              setMfaSignIn(true);
              setSendSMS(true);
            } else {
              setError(
                errors[signInError.code] === ""
                  ? ""
                  : errors[signInError.code] ||
                      "Something went wrong. Try again later.",
              );
              if (callbacks?.signInFailure)
                callbacks?.signInFailure(signInError);
              throw new Error(signInError.code);
            }
          } else if (signUpError.code) {
            setError(
              errors[signUpError.code] === ""
                ? ""
                : errors[signUpError.code] ||
                    "Something went wrong. Try again later.",
            );
            if (callbacks?.signInFailure) callbacks?.signInFailure(signUpError);
            throw new Error(signUpError.code);
          }
        }
      }
    } else if (authType == "signIn" || authType == "signUp") {
      const authFunction = () =>
        authType == "signIn"
          ? signInWithEmailAndPassword(auth, email, password)
          : createUserWithEmailAndPassword(auth, email, password);
      try {
        await authFunction().then((user) => {
          if (callbacks?.signInSuccessWithAuthResult) {
            callbacks.signInSuccessWithAuthResult(user);
          }
        });
      } catch (error) {
        setError(
          errors[error.code] === ""
            ? ""
            : errors[error.code] || "Something went wrong. Try again later.",
        );
        if (callbacks?.signInFailure) callbacks?.signInFailure(error);
        throw new Error(error.code);
      }
    } else {
      throw new Error("FirebaseUI/invalid-auth-type");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "1rem",
        marginBottom: "1rem",
        gap: "1rem",
      }}
    >
      {resetPassword && (
        <button
          onClick={() => setResetPassword(false)}
          style={{
            width: "100%",
            textAlign: "left",
            fontSize: "0.875rem",
            color: "#2b6cb0", // blue-800
            border: "none",
            cursor: "pointer",
            backgroundColor: "#fff",
          }}
        >
          Go back
        </button>
      )}
      <div
        style={{
          fontSize: "0.875rem",
          fontWeight: "500",
          color: "#1a202c", // gray-900
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <label htmlFor="email">Email Address</label>
        </div>
        <input
          data-testid="emailinput"
          ref={emailRef}
          autoComplete="email"
          id="email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            border: "1px solid #e2e8f0", // gray-300
            borderRadius: "0.375rem",
            padding: "0.5rem 0.75rem",
            width: "100%",
          }}
        />
      </div>
      {!resetPassword && (
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "#1a202c", // gray-900
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label htmlFor="password">Password</label>
            <button
              type="button"
              tabIndex={10}
              onClick={() => setResetPassword(true)}
              style={{
                fontSize: "0.875rem",
                color: "#2b6cb0",
                border: "none",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              Forgot Password?
            </button>
          </div>
          <div>
            <input
              data-testid="passwordInput"
              id="password"
              type="password"
              autoComplete={true ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                border: "1px solid #e2e8f0", // gray-300
                borderRadius: "0.375rem",
                padding: "0.5rem 0.75rem",
                width: "100%",
              }}
            />
            {showPassHelper && (
              <div
                style={{
                  width: "20%",
                  padding: "0.5rem",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  borderRadius: "0.375rem",
                  position: "absolute",
                  backgroundColor: "white",
                }}
              >
                <p>Your password must contain:</p>
                <ul>
                  {password.length < (passwordSpecs?.minCharacters || 6) && (
                    <li>
                      - At least {passwordSpecs?.minCharacters || 6} characters
                    </li>
                  )}
                  {passwordSpecs?.containsUppercase &&
                    !/[A-Z]/.test(password) && <li>- 1 uppercase character</li>}
                  {passwordSpecs?.containsLowercase &&
                    !/[a-z]/.test(password) && <li>- 1 lowercase character</li>}
                  {passwordSpecs?.containsNumber && !/\d/.test(password) && (
                    <li>- 1 number</li>
                  )}
                  {passwordSpecs?.containsSpecialCharacter &&
                    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && (
                      <li>- 1 special character</li>
                    )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      <button
        type="submit"
        style={{
          color: "white",
          fontWeight: "600",
          marginTop: "1.25rem",
          width: "100%",
          transition: "background-color 150ms",
          backgroundColor: formIsValid ? "#60a5fa" : "#9ca3af", // bg-blue-400 for valid, bg-gray-400 for invalid
          cursor: formIsValid ? "pointer" : "default", // cursor changes based on form validity
          ...(formIsValid ? { ":hover": { backgroundColor: "#3b82f6" } } : {}), // hover effect for valid form
          display: "flex",
          gap: "0.75rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.375rem",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          justifyContent: "center",
          border: "none",
        }}
      >
        {resetPassword ? "Reset Password" : "Sign In With Email"}
      </button>
    </form>
  );
}
