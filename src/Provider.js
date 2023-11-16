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
  const auth = getAuth();

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
      callbacks={callbacks}
      authType={authType}
      resetContinueUrl={resetContinueUrl}
      setAlert={setAlert}
      setError={setError}
      passwordSpecs={passwordSpecs}
    />
  ) : (
    <button
      className={`flex gap-3 px-3 py-2 rounded-md shadow-md w-full justify-center items-center border border-gray-200`}
      style={buttonStyles}
      onClick={submit}
    >
      {styles.icon}
      <span className="text-sm font-medium">
        {fullLabel ? fullLabel : `Sign in with ${providerName}`}
      </span>
    </button>
  );
}
