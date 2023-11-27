"use client";

import React from "react";
import {
  createUserWithEmailAndPassword,
  getMultiFactorResolver,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import { errors } from "./Errors";

export default function EmailPassword({
  auth,
  callbacks,
  authType,
  setAlert,
  setError,
  continueUrl,
  passwordSpecs,
  setSendSMS,
  setMfaSignIn,
  setMfaResolver
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
    let isValid = password.length > 5; //basic firebase requirement

    if (passwordSpecs?.minCharacters) {
      isValid = isValid && password.length >= passwordSpecs?.minCharacters;
    }

    if (passwordSpecs?.containsUppercase) {
      isValid = isValid && /[A-Z]/.test(password);
    }

    if (passwordSpecs?.containsLowercase) {
      isValid = isValid && /[a-z]/.test(password);
    }

    if (passwordSpecs?.containsNumber) {
      isValid = isValid && /\d/.test(password);
    }

    if (passwordSpecs?.containsSpecialCharacter) {
      isValid =
        isValid && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    }

    return isValid;
  };

  //allow sign in AND sign up if not specified
  if (!authType) authType = "both";

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
          if (signUpError.code === "auth/email-already-in-use") {
            //SIGN IN PROBLEM
            if (signInError.code === "auth/multi-factor-auth-required") {
              setMfaResolver(getMultiFactorResolver(auth, signInError))
              setMfaSignIn(true);
              setSendSMS(true);
            } else {
              setError(
                errors[signInError.code] === ""
                  ? ""
                  : errors[signInError.code] ||
                  "Something went wrong. Try again later.",
              );
              if (callbacks?.signInFailure) callbacks?.signInFailure(signInError);
              throw new Error(signInError.code);
            }
          } else if (signUpError.code) {

            setError(errors[signUpError.code] === ""
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

  const submit = async (e) => {
    e.preventDefault();
    if (!formIsValid) {
      if (!isEmailValid()) {
        setAlert("Please enter a valid email address.");
      } else {
        setAlert("Please enter a valid password.");
      }

      return;
    }

    if (resetPassword) {
      await sendSignInLinkToEmail(auth, email, {
        handleCodeInApp: true,
        url: `${continueUrl}/?resetPassword=true&email=${email}`
      }).then(() => {
        setAlert(`A reset-password email has been sent to ${email}.`);
      });
    } else {
      await authenticateUser();
    }
  };

  return (
    <form style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '1rem',
      marginBottom: '1rem',
      gap: '1rem'
    }}>

      <div style={{
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#1a202c', // gray-900
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

          <label htmlFor="email">Email Address</label>
          {resetPassword && <button
            onClick={() => setResetPassword(false)}
            style={{
              fontSize: '0.875rem',
              color: '#2b6cb0',
              border: 'none',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>}
        </div>
        <input
          data-testid="emailinput"
          ref={emailRef}
          id="email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            border: '1px solid #e2e8f0', // gray-300
            borderRadius: '0.375rem',
            padding: '0.5rem 0.25rem',
            width: '100%'
          }}
        />
      </div>
      {!resetPassword && (
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#1a202c', // gray-900
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <label htmlFor="password">Password</label>
            <button
              onClick={() => setResetPassword(true)}
              style={{
                fontSize: '0.875rem',
                color: '#2b6cb0',
                border: 'none',
                backgroundColor: '#fff',
                cursor: 'pointer',
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                border: '1px solid #e2e8f0', // gray-300
                borderRadius: '0.375rem',
                padding: '0.5rem 0.25rem',
                width: '100%'
              }}
            />
            {showPassHelper && (
              <div style={{ marginTop: '0.25rem', width: '100%' }}>

                {password.length < (passwordSpecs?.minCharacters || 6) && (
                  <p style={{
                    margin: '0.25rem 0rem',
                    color: '#FF0000',
                    textAlign: 'right'
                  }}>
                    {passwordSpecs?.minCharacters || 6} character minimum
                  </p>
                )}
                {passwordSpecs?.containsUppercase &&
                  !/[A-Z]/.test(password) && <p style={{
                    margin: '0.25rem 0rem',
                    color: '#FF0000',
                    textAlign: 'right'
                  }}>1 uppercase character</p>}
                {passwordSpecs?.containsLowercase &&
                  !/[a-z]/.test(password) && <p style={{
                    margin: '0.25rem 0rem',
                    color: '#FF0000',
                    textAlign: 'right'
                  }}>1 lowercase character</p>}
                {passwordSpecs?.containsNumber && !/\d/.test(password) && (
                  <p style={{
                    margin: '0.25rem 0rem',
                    color: '#FF0000',
                    textAlign: 'right'
                  }}>1 number</p>
                )}
                {passwordSpecs?.containsSpecialCharacter &&
                  !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && (
                    <p style={{
                      margin: '0.25rem 0rem',
                      color: '#FF0000',
                      textAlign: 'right'
                    }}>1 special character</p>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
      <button
        type="submit"
        style={{
          color: 'white',
          fontWeight: '600',
          marginTop: '1.25rem',
          width: '100%',
          transition: 'background-color 150ms',
          backgroundColor: formIsValid ? '#60a5fa' : '#9ca3af', // bg-blue-400 for valid, bg-gray-400 for invalid
          cursor: formIsValid ? 'pointer' : 'default', // cursor changes based on form validity
          ...(formIsValid ? { ':hover': { backgroundColor: '#3b82f6' } } : {}), // hover effect for valid form
          display: 'flex',
          gap: '0.75rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          justifyContent: 'center',
          border: 'none',
        }}
        onClick={submit}
      >
        {resetPassword ? "Reset Password" : "Sign In With Email"}
      </button>


    </form>
  );
}
