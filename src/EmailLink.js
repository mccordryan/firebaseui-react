import {
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import { errors } from "./Errors";

export default function EmailLink({
  setEmailLinkOpen,
  resetContinueUrl,
  callbacks,
  setAlert,
  setError,
}) {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);
  const [finishEmailSignIn, setFinishEmailSignIn] = useState(
    isSignInWithEmailLink(auth, window.location.href),
  );

  const emailRef = useRef(null);

  useEffect(() => {
    setFormIsValid(isEmailValid());
  }, [email]);

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
          url: resetContinueUrl,
        }).then(() => {
          setAlert(`A sign in link has been sent to ${email}`);
        });
      }
    } catch (error) {
      if (finishEmailSignIn && callbacks?.signInFailure)
        callbacks.signInFailure(error);
      setError(
        errors[error.code] === ""
          ? ""
          : errors[error.code] || "Something went wrong. Try again later.",
      );
    }
  };

  return (
    <>
      <div className="w-full my-2">
        <p
          onClick={() => setEmailLinkOpen(false)}
          className="text-sm font-semibold text-blue-800"
        >
          Go Back
        </p>
      </div>
      <h1 className="text-lg font-semibold my-2">Sign In With Email Link</h1>
      {finishEmailSignIn && (
        <p className="text-sm">Please re-enter your email address</p>
      )}
      <form className="w-full flex flex-col items-center my-4 gap-4">
        <div className="text-sm font-medium text-gray-900 flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center">
            <label for="email">Email Address</label>
          </div>
          <input
            ref={emailRef}
            name="email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </div>
        <button
          type="submit"
          className={
            (formIsValid
              ? `bg-blue-400 hover:bg-blue-500`
              : `bg-gray-400 cursor-default `) +
            ` text-white font-semibold px-3 py-1 mt-5 rounded-lg w-full  duration-150`
          }
          onClick={(e) => submit(e)}
        >
          {finishEmailSignIn ? "Finish Signing In" : "Send Email Link"}
        </button>
      </form>
    </>
  );
}
