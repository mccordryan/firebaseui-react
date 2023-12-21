import React, { useState, useEffect, useRef } from "react";
import { RecaptchaVerifier, PhoneAuthProvider } from "firebase/auth";

const dropdownStyle = {
  paddingTop: "0.375rem",
  paddingBottom: "0.375rem",
  paddingLeft: "0.75rem",
  paddingRight: "2.5rem",
  backgroundColor: "#ffffff",
  color: "#111827",
  width: "100%",
  borderRadius: "0.375rem",
  borderWidth: "0",
  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  outline: "1px solid #d1d5db",
  marginBottom: "1rem",
};

function FactorDropdown({ hints, value, setValue }) {
  if (hints.length === 1)
    return (
      <div style={dropdownStyle}>
        {hints[0].displayName || hints[0].phoneNumber}
      </div>
    );
  return (
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={style}
    >
      {hints.map((hint) => (
        <option key={hint.uid} value={hint.uid}>
          {hint.displayName || hint.phoneNumber}
        </option>
      ))}
    </select>
  );
}

function CodeInput({ value, setValue, style, labelStyle }) {
  return (
    <div>
      <label htmlFor="email" style={labelStyle}>
        Verify the code sent to your phone
      </label>
      <input
        id="mfacode"
        name="mfacode"
        type="tel"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        autoComplete="off"
        value={value}
        placeholder="XXXXXX"
        onChange={(e) => setValue(e.target.value)}
        style={style}
      />
    </div>
  );
}

export default function MFAForm({
  auth,
  resolver,
  buttonStyle,
  validInputStyle,
  labelStyle,
}) {

  const { hints } = resolver;
  const [factorUid, setFactorUid] = useState(hints[0].uid);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    new RecaptchaVerifier(auth, "recaptcha-container-id", {
      size: "invisible",
      callback: (response) => { },
      "expired-callback": () => { },
    });
  }, []);

  // const phoneInfoOptions = {
  //   multiFactorHint: resolver.hints[selectedIndex],
  //   session: resolver.session,
  // };
  // const phoneAuthProvider = new PhoneAuthProvider(auth);
  // // Send SMS verification code
  // return phoneAuthProvider
  //   .verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
  //   .then(function (verificationId) {
  //     // Ask user for the SMS verification code. Then:
  //     const cred = PhoneAuthProvider.credential(
  //       verificationId,
  //       verificationCode,
  //     );
  //     const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
  //     // Complete sign-in.
  //     return resolver.resolveSignIn(multiFactorAssertion);
  //   })
  //   .then(function (userCredential) {
  //     // User successfully signed in with the second factor phone number.
  //   });
  function onSubmit(e) {
    e.preventDefault();
    if (!codeSent) {
      // TODO: send code
      setCodeSent(true);
      return;
    }

    // validate code
  }
  return (
    <form
      onSubmit={onSubmit}
      id="recaptcha-container-id"
      style={{ width: "100%" }}
    >
      <FactorDropdown
        hints={hints}
        value={factorUid}
        setValue={setFactorUid}
        disabled={loading || codeSent}
      />
      {!codeSent && (
        <button disabled={loading} style={buttonStyle} type="submit">
          {loading ? "Sending..." : "Send authorization code"}
        </button>
      )}
      {codeSent && (
        <div>
          <CodeInput
            value={code}
            setValue={setCode}
            style={validInputStyle}
            labelStyle={labelStyle}
          />
          <div style={{ height: "0.5em" }} />
          <button style={buttonStyle} type="submit">
            {loading ? "Verifying..." : "Verify code"}
          </button>
        </div>
      )}
    </form>
  );
}

{
  /*
<select
      className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      autoComplete="tel-country-code"
      name="countrycode"
      id="countrycode"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      disabled={disabled}
    >

  <div>

                  <label
                    htmlFor="mfacode"
                    className="mt-4 block text-sm font-medium leading-6 text-gray-900"
                  >
                    Verify the code sent to your phone
                  </label>

                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <input
                        id="mfacode"
                        name="mfacode"
                        type="text"
                        pattern="[0-9]{6}"
                        required
                        autoComplete="off"
                        value={verificationCode}
                        placeholder="XXXXXX"
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <button
                    className={`${
                      verifyingCode ? "shimmer" : ""
                    } mt-4 flex justify-center rounded-md bg-purple-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:bg-gray-400`}
                    onClick={verifyCode}
                  >
                    Verify code
                  </button>
                </div>*/
}
