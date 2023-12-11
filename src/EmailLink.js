import {
  getMultiFactorResolver,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  updateProfile,
} from "firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import { errors } from "./Errors";

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
  authType,
  displayName,
  formButtonStyles,
  formDisabledStyles,
  formInputStyles,
  formLabelStyles,
  formSmallButtonStyles,
  customErrors
}) {
  const [email, setEmail] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);
  const [finishEmailSignIn, setFinishEmailSignIn] = useState(
    isSignInWithEmailLink(auth, window.location.href),
  );
  const [name, setName] = useState("");
  const emailRef = useRef(null);

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
        if (error.code === "auth/multi-factor-auth-required") {
          setMfaResolver(getMultiFactorResolver(auth, error))
          setMfaSignIn(true);
          setEmailLinkOpen(false);
          setSendSMS(true);
        } else {
          if (finishEmailSignIn && callbacks?.signInFailure)
            callbacks.signInFailure(error);
          setError(customErrors && customErrors[error.code] !== undefined ? customErrors[error.code] : errors[error.code] || "Something went wrong. Try again later.");
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
          setAlert(`A sign in link has been sent to ${email}`);
        });
      }
    } catch (error) {
      if (finishEmailSignIn && callbacks?.signInFailure)
        callbacks.signInFailure(error);
      setError(customErrors && customErrors[error.code] !== undefined ? customErrors[error.code] : errors[error.code] || "Something went wrong. Try again later.");
      throw new Error(error)
    }
  };

  return (
    <>
      <h1 style={{ fontSize: '1.125rem', fontWeight: '600', marginTop: '0.5rem', marginBottom: '0.5rem' }}
      >Sign In With Email Link</h1>
      {finishEmailSignIn && (
        <p style={{ fontSize: '0.875rem' }}>Signing you in...</p>
      )}
      {!finishEmailSignIn && <form style={{
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
            <label style={{ ...formLabelStyles }} htmlFor="email">Email Address<span style={{ color: "#FF0000" }}> *</span></label>
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
              Cancel
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
            }}

          />
          {authType === "signUp" && displayName &&
            <>
              {displayName == "required" ? <label style={{ ...formLabelStyles }} htmlFor="name">Name<span style={{ color: "#FF0000" }}> *</span></label> : <label style={{ ...formLabelStyles }} htmlFor="name">Name</label>}
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  border: '1px solid #e2e8f0', // gray-300
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.25rem',
                  width: '100%',
                  marginBottom: '0.25rem',
                  ...formInputStyles
                }}
              /></>}
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
          {finishEmailSignIn ? "Finish Signing In" : "Send Email Link"}
        </button>
      </form>}
    </>
  );
}
