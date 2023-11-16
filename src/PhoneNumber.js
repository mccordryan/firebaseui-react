import {
  RecaptchaVerifier,
  getAuth,
  signInWithPhoneNumber,
} from "firebase/auth";
import { providerStyles } from "./providerStyles";
import React, { useEffect, useRef, useState } from "react";
import { errors } from "./Errors";

export default function PhoneNumber({
  setSendSMS,
  setAlert,
  setError,
  callbacks,
}) {
  //TODO: custom styles here too
  const styles = providerStyles["phonenumber"] || providerStyles["default"];
  const [phoneNumber, setPhoneNumber] = useState();
  //TODO phone number validity
  const [phoneNumberValid, setPhoneNumberValid] = useState(true);
  const [enterCode, setEnterCode] = useState(false);
  const [code, setCode] = useState(Array(6).fill(""));
  const [countryCode, setCountryCode] = useState("+1");

  const inputRefs = Array(6)
    .fill()
    .map(() => useRef(null));

  const handleCodeChange = (value, index) => {
    if (value !== "" && !/\d/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !code[index]) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePhoneInput = (value) => {
    let cleaned = value.replace(/\D/g, "");

    let parts = [];
    if (cleaned.length > 3) {
      parts.push(cleaned.substring(0, 3));
      cleaned = cleaned.substring(3);
    } else {
      return cleaned;
    }

    if (cleaned.length > 3) {
      parts.push(cleaned.substring(0, 3));
      cleaned = cleaned.substring(3);
    } else {
      parts.push(cleaned);
      return parts.join("-");
    }

    parts.push(cleaned.substring(0, 4));

    return parts.join("-");
  };

  const auth = getAuth();

  useEffect(() => {
    console.log(enterCode);
  }, [enterCode]);
  useEffect(() => {
    if (auth) {
      console.log("good auth");
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "sign-in-button", {
        size: "invisible",
      });
    }
  }, [auth]);

  const sendCode = async function () {
    try {
      console.log("sending code");
      if (!phoneNumber || phoneNumber.length < 12) return;
      const formattedNumber = countryCode + " " + phoneNumber;
      const appVerifier = window.recaptchaVerifier;
      console.log("rly sending");
      await signInWithPhoneNumber(auth, formattedNumber, appVerifier).then(
        (confirmationResult) => {
          console.log("sent");
          setAlert(`A code has been sent to ${phoneNumber}.`);
          window.confirmationResult = confirmationResult;
          setEnterCode(true);
        },
      );
    } catch (error) {
      console.error(error);
      setError(
        errors[error.code] === ""
          ? ""
          : errors[error.code] || "Something went wrong. Try again later.",
      );
    }
  };

  const signInWithCode = async function () {
    try {
      console.log("signing in w code");
      let formattedCode = code.join();

      await window.confirmationResult.confirm(formattedCode).then(() => {
        //TODO restructure to get user credential
        setSendSMS(false);
      });
    } catch (error) {
      console.error(error);
      setError(
        errors[error.code] === ""
          ? ""
          : errors[error.code] || "Something went wrong. Try again later.",
      );
      if (callbacks?.signInFailure) callbacks.signInFailure(error);
    }
  };

  const handleButtonPress = function () {
    console.log("CLICK");
    if (enterCode) {
      signInWithCode();
    } else {
      sendCode();
    }
  };

  return (
    <>
      <div className="w-full">
        <p
          onClick={() => setSendSMS(false)}
          className="text-sm text-blue-800 font-semibold"
        >
          Go Back
        </p>
      </div>
      <h1 className="font-semibold text-lg mb-2">
        {enterCode ? "Enter Code Below" : "Send a Sign-In Text"}
      </h1>

      {!enterCode && (
        <form className="flex gap-2">
          <select
            className="py-1 px-2 border border-gray-300 rounded-md"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+52">+52</option>
            <option value="+91">+91</option>
            <option value="+86">+86</option>
          </select>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(handlePhoneInput(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </form>
      )}
      {enterCode && (
        <form className="flex gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleCodeChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="border border-gray-300 rounded-md px-3 py-2 w-10"
            />
          ))}
        </form>
      )}
      <button
        id="sign-in-button"
        onClick={handleButtonPress}
        className={
          (phoneNumberValid
            ? `bg-blue-400 hover:bg-blue-500`
            : `bg-gray-400 cursor-default `) +
          ` text-white font-semibold px-3 py-1 mt-5 rounded-lg w-full  duration-150`
        }
      >
        <span className="text-sm font-medium">
          {enterCode ? "Finish Signing In" : "Send Text"}
        </span>
      </button>
    </>
  );
}
