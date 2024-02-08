"use client"
import {
  getMultiFactorResolver,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  updateProfile,
} from "firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import { errors } from "./Errors";
import { translate, translateError } from "./Languages";

export default function EmailLink({
  setEmailLinkOpen,
  continueUrl,
  callbacks,
  setAlert,
  setError,
  setMfaResolver,
  setSendSMS,
  setMfaSignIn,
  auth,
  setResetPasswordOpen,
  isResetPassword,
  displayName,
  formButtonStyles,
  formDisabledStyles,
  formInputStyles,
  formLabelStyles,
  formSmallButtonStyles,
  customErrors,
  language,
  customText
}) {
  const [email, setEmail] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);
  const [finishEmailSignIn, setFinishEmailSignIn] = useState(false);
  const [name, setName] = useState("");
  const emailRef = useRef(null);

  const processNetworkError = (error) => {
    error = JSON.parse(JSON.stringify(error));
    if (error.code === 400 || error.code === "auth/network-request-failed" && error?.customData?.message) {
      let message = error.customData.message;
      let sliced = message.slice(32, message.length - 2)
      error.code = sliced;
    }

    return error;
  }

  useEffect(() => {
    setFinishEmailSignIn(isSignInWithEmailLink(auth, window.location.href))
  }, [])

  useEffect(() => {
    setFormIsValid(isEmailValid() && (displayName == "required" ? name.length > 0 : true));
  }, [email, name]);

  useEffect(() => {
    if (auth && finishEmailSignIn && !isSigningIn) {
      isSigningIn = true;
      finishSignUp()
    }

    let isSigningIn = false;

    async function finishSignUp() {
      const queryParams = new URLSearchParams(window.location.search);
      const queryEmail = queryParams.get('email');
      const queryName = queryParams.get('name');

      try {
        await signInWithEmailLink(auth, queryEmail, window.location.href).then(
          (user) => {
            if (isResetPassword) {
              setResetPasswordOpen(true);
              setEmailLinkOpen(false);
            } else if (queryName) {
              updateProfile(user.user, { displayName: queryName }).then(() => {
                if (callbacks?.signInSuccessWithAuthResult)
                  callbacks.signInSuccessWithAuthResult(user);
              })
            }
            else if (callbacks?.signInSuccessWithAuthResult)
              callbacks.signInSuccessWithAuthResult(user);
            setEmailLinkOpen(false);
          },
        );
      } catch (error) {
        error = processNetworkError(error);
        if (error.code === "auth/multi-factor-auth-required") {
          setMfaResolver(getMultiFactorResolver(auth, error))
          setMfaSignIn(true);
          setEmailLinkOpen(false);
          setSendSMS(true);
        } else {
          if (finishEmailSignIn && callbacks?.signInFailure)
            callbacks.signInFailure(error);
          setError(translateError(error.code, language, customText));
          throw new Error(error);
        }
      }
    }
  }, [finishEmailSignIn, auth])

  const isEmailValid = function () {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const submit = async function (e) {
    e.preventDefault();
    try {
      if (finishEmailSignIn) {
        await signInWithEmailLink(auth, email, window.location.href).then(
          (user) => {
            if (callbacks?.signInSuccessWithAuthResult)
              callbacks.signInSuccessWithAuthResult(user);
            setEmailLinkOpen(false);
          },
        );
      } else {
        await sendSignInLinkToEmail(auth, email, {
          handleCodeInApp: true,
          url: `${continueUrl}/?email=${email}${(name.length > 0) ? "&name=" + name : ""}`
        }).then(() => {
          setAlert(`${translate("signInLinkSent", language, customText)} ${email}`);
        });
      }
    } catch (error) {
      error = processNetworkError(error);
      if (finishEmailSignIn && callbacks?.signInFailure)
        callbacks.signInFailure(error);
      setError(setError(translateError(error.code, language, customText)));
    }
  };



  return (
    <>
      <h1 style={{ fontSize: '1.125rem', fontWeight: '600', marginTop: '0.5rem', marginBottom: '0.5rem' }}
      >{translate("signInWithEmailLink", language, customText)}</h1>

      {finishEmailSignIn && (
        <p style={{ fontSize: '0.875rem' }}>{translate("signingYouIn", language, customText)}</p>
      )}

      {!finishEmailSignIn &&
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
              <label style={{ ...formLabelStyles }} htmlFor="email">{translate("email", language, customText)}<span style={{ color: "#FF0000" }}> *</span></label>
              <button
                onClick={() => setEmailLinkOpen(false)}
                style={{
                  fontSize: '0.875rem',
                  color: '#2b6cb0',
                  border: 'none',
                  backgroundColor: "#fff",
                  cursor: 'pointer',
                  ...formSmallButtonStyles
                }}
              >
                {translate("cancel", language, customText)}
              </button>
            </div>

            <input
              ref={emailRef}
              name="email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                border: '1px solid #e2e8f0', // gray-300
                borderRadius: '0.375rem',
                padding: '0.5rem 0.25rem',
                width: '100%',
                ...formInputStyles
              }} />
          </div>

          <button
            type="submit"
            style={{
              color: 'white',
              alignItems: 'center',
              fontWeight: '600',
              marginTop: '1.25rem',
              width: '100%',
              height: '2.25rem',
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
              ...formButtonStyles,
              ...(formIsValid ? {} : formDisabledStyles)
            }}
            onClick={(e) => submit(e)}
          >
            {finishEmailSignIn ? translate("finishSigningIn", language, customText) : translate("sendEmailLink", language, customText)}
          </button>
        </form>}

    </>
  );
}
