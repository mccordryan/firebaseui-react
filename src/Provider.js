import React from "react";
import {
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { providerStyles } from "./providerStyles";
import EmailPassword from "./EmailPassword";
import PhoneNumber from "./PhoneNumber";
import { errors } from "./Errors";

export default function Provider({
  auth,
  providerId,
  signInFlow,
  scopes,
  customParameters,
  providerName,
  fullLabel,
  callbacks,
  authType,
  customStyles,
  resetContinueUrl,
  setSendSMS,
  setEmailLinkOpen,
  setAlert,
  setError,
  passwordSpecs,
  setVerify,
  setMfaSignIn,
  setMfaResolver
}) {
  if (!providerName) {
    if (providerId == "emaillink") {
      providerName = "Email Link";
    } else if (providerId == "phonenumber") {
      providerName = "Phone Number";
    } else {
      let match = providerId.match(/^([^.]+)/);
      providerName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  }

  if (providerId == "anonymous" && !fullLabel) {
    fullLabel = "Sign In As Guest";
  }

  const providerMap = {
    "google.com": () => new GoogleAuthProvider(),
    "github.com": () => new GithubAuthProvider(),
    "x.com": () => new TwitterAuthProvider(),
    "facebook.com": () => new FacebookAuthProvider(),
    "microsoft.com": () => new OAuthProvider("microsoft.com"),
    "yahoo.com": () => new OAuthProvider("yahoo.com"),
    "apple.com": () => new OAuthProvider("apple.com"),
  };

  let provider = null;

  //non-default providers are initialized as OAuth
  if (providerId != "emailpassword") {
    provider = providerMap[providerId]
      ? providerMap[providerId]()
      : new OAuthProvider(providerId);
  }

  if (provider && scopes) {
    scopes.forEach((scope) => {
      provider.addScope(scope);
    });
  }

  if (provider && customParameters) {
    provider.setCustomParameters(customParameters);
  }

  const submit = async () => {
    if (providerId == "emaillink") {
      await setEmailLinkOpen(true);
    } else if (providerId == "phonenumber") {
      await setSendSMS(true);
    } else {
      const flowFunction = () =>
        providerId == "anonymous"
          ? signInAnonymously(auth)
          : signInFlow == "redirect"
            ? signInWithRedirect(auth, provider)
            : signInWithPopup(auth, provider);
      try {
        await flowFunction().then((user) => {
          callbacks?.signInSuccessWithAuthResult(user);
        });
      } catch (error) {
        setError(
          errors[error.code] === ""
            ? ""
            : errors[error.code] || "Something went wrong. Try again later.",
        );
        callbacks?.signInFailure(error);
      }
    }
  };

  const styles = providerStyles[providerId] || providerStyles["default"];
  const buttonStyles = { ...styles?.buttonStyles, ...(customStyles || null) };

  return providerId == "emailpassword" ? (
    <EmailPassword
      auth={auth}
      callbacks={callbacks}
      authType={authType}
      resetContinueUrl={resetContinueUrl}
      setAlert={setAlert}
      setError={setError}
      passwordSpecs={passwordSpecs}
      setSendSMS={setSendSMS}
      setMfaSignIn={setMfaSignIn}
      setVerify={setVerify}
      setMfaResolver={setMfaResolver}
    />
  ) : (
    <button
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.375rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        ...buttonStyles
      }}
      onClick={submit}
    >
      {styles.icon}
      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
        {fullLabel ? fullLabel : `Sign in with ${providerName}`}
      </span>
    </button>
  );
}
