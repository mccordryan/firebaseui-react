"use client";

import React from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
  resetContinueUrl,
  passwordSpecs,
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
          if (callbacks?.signInSuccessWithAuthResult)
            callbacks.signInSuccessWithAuthResult(user);
        });
      } catch (signInError) {
        try {
          await createUserWithEmailAndPassword(auth, email, password).then(
            (user) => {
              if (callbacks?.signInSuccessWithAuthResult)
                callbacks.signInSuccessWithAuthResult(user);
            },
          );
        } catch (signUpError) {
          if (signUpError.code === "auth/email-already-in-use") {
            setError(
              errors[signInError.code] === ""
                ? ""
                : errors[signInError.code] ||
                    "Something went wrong. Try again later.",
            );
            if (callbacks?.signInFailure) callbacks?.signInFailure(signInError);
            throw new Error(signInError.code);
          } else {
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
          if (callbacks?.signInSuccessWithAuthResult)
            callbacks.signInSuccessWithAuthResult(user);
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
      await sendPasswordResetEmail(auth, email, {
        handleCodeInApp: true,
        url: resetContinueUrl,
      }).then(() => {
        setAlert(`A reset-password email has been sent to ${email}.`);
      });
    } else {
      await authenticateUser();
    }
  };

  return (
    <form className="w-full flex flex-col items-center my-4 gap-4">
      {resetPassword && (
        <p
          onClick={() => setResetPassword(false)}
          className="w-full text-left text-sm text-blue-800 font-semibold"
        >
          {`<- `}Go back
        </p>
      )}
      <div className="text-sm font-medium text-gray-900 flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center">
          <label htmlFor="email">Email Address</label>
        </div>
        <input
          data-testid="emailinput"
          ref={emailRef}
          id="email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>
      {!resetPassword && (
        <div className="text-sm font-medium text-gray-900 flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center">
            <label htmlFor="password">Password</label>
            <p
              onClick={() => setResetPassword(true)}
              className=" text-sm text-blue-800"
            >
              Forgot Password?
            </p>
          </div>
          <div>
            <input
              data-testid="passwordInput"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
            {showPassHelper && (
              <div className="w-1/5 p-2 shadow-md rounded-md absolute bg-white">
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
        className={
          (formIsValid
            ? `bg-blue-400 hover:bg-blue-500`
            : `bg-gray-400 cursor-default `) +
          ` text-white font-semibold px-3 py-1 mt-5 rounded-lg w-full  duration-150`
        }
        onClick={submit}
      >
        {resetPassword ? "Reset Password" : "Sign In With Email"}
      </button>
    </form>
  );
}
