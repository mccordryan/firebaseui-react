import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
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
  mfaSignIn,
  mfaResolver
}) {
  //TODO: custom styles here too
  const styles = providerStyles["phonenumber"] || providerStyles["default"];
  const [phoneNumber, setPhoneNumber] = useState();
  //TODO phone number validity
  const [phoneNumberValid, setPhoneNumberValid] = useState(true);
  const [enterCode, setEnterCode] = useState(false);
  const [code, setCode] = useState(Array(6).fill(""));
  const [countryCode, setCountryCode] = useState("+1");
  const [verificationId, setVerificationId] = useState();

  const auth = getAuth();
  const phoneAuthProvider = new PhoneAuthProvider(auth);

  const sendMfaText = function () {
    if (mfaSignIn && mfaResolver && window.recaptchaVerifier) {

      const phoneInfoOptions = {
        multiFactorHint: mfaResolver.hints[0],
        session: mfaResolver.session
      }
      try {
        phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier).then((vId) => {
          setVerificationId(vId);
          setEnterCode(true);
        })
      } catch (error) {
        window.recaptchaVerifier.clear();
      }
    }
  }

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


  useEffect(() => {
    if (auth) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
        size: "invisible",
      });
    }
  }, [auth]);

  const sendCode = async function () {
    try {
      if (!phoneNumber || phoneNumber.length < 12) return;
      const formattedNumber = countryCode + " " + phoneNumber;
      const appVerifier = window.recaptchaVerifier;
      await signInWithPhoneNumber(auth, formattedNumber, appVerifier).then(
        (confirmationResult) => {
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
      let formattedCode = code.join('');

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
    //TODO verify code!
    if (mfaSignIn && enterCode) {
      let formattedCode = code.join('');
      const cred = PhoneAuthProvider.credential(verificationId, formattedCode)
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      try {
        mfaResolver.resolveSignIn(multiFactorAssertion).then((userCred) => {
          if (callbacks?.signInSuccessWithAuthResult) callbacks.signInSuccessWithAuthResult(userCred.user);
        })
      } catch (error) {
        console.error(error);
        setError(
          errors[error.code] === ""
            ? ""
            : errors[error.code] || "Something went wrong. Try again later.",
        );
        if (callbacks?.signInFailure) callbacks.signInFailure(error);
      }
    } else if (mfaSignIn) {
      sendMfaText();
    } else {
      if (enterCode) {
        signInWithCode();
      } else {
        sendCode();
      }
    }

  };

  return (
    <>
      <div style={{ width: '100%' }}>
        {!(mfaSignIn && enterCode) && <p
          onClick={() => setSendSMS(false)}
          style={{ fontSize: '0.875rem', color: '#2b6cb0', fontWeight: '600' }}
        >
          Go Back
        </p>}
      </div>
      <h1 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
        {enterCode ? "Enter Code Below" : mfaSignIn ? "You'll need to verify your identity to continue" : "Send a Sign-In Text"}
      </h1>

      {!enterCode && !mfaSignIn && (
        <form style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            style={{
              padding: '0.25rem 0.5rem',
              border: '1px solid #e2e8f0', // gray-300
              borderRadius: '0.375rem'
            }}
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
            style={{
              border: '1px solid #e2e8f0', // gray-300
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              width: '100%'
            }}
          />
        </form>
      )}

      {!enterCode && mfaSignIn && <div>
        <p>A confirmation text will be sent to your phone number ending in {mfaResolver?.hints[0]?.phoneNumber?.slice(-4)}</p>
      </div>}
      {enterCode && (
        <form style={{ display: 'flex', gap: '0.5rem' }}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleCodeChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              style={{
                border: '1px solid #e2e8f0', // gray-300
                borderRadius: '0.375rem',
                padding: '0.5rem 0.75rem',
                width: '2.5rem' // Equivalent to w-10
              }}
            />
          ))}
        </form>
      )}
      <button
        id="sign-in-button"
        onClick={handleButtonPress}
        style={{
          color: 'white',
          fontWeight: '600',
          marginTop: '1.25rem',
          width: '100%',
          transition: 'background-color 150ms',
          backgroundColor: phoneNumberValid ? '#60a5fa' : '#9ca3af', // bg-blue-400 for valid, bg-gray-400 for invalid
          cursor: phoneNumberValid ? 'pointer' : 'default', // cursor changes based on form validity
          ...(phoneNumberValid ? { ':hover': { backgroundColor: '#3b82f6' } } : {}), // hover effect for valid form
          display: 'flex',
          gap: '0.75rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          justifyContent: 'center',
          border: 'none',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
          {enterCode ? "Finish Signing In" : "Send Text"}
        </span>
      </button>
    </>
  );
}
