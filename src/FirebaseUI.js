"use client";
import { useState } from "react";
import Provider from "./Provider";
import { providerStyles } from "./providerStyles";
import PhoneNumber from "./PhoneNumber";
import EmailLink from "./EmailLink";
import { getAuth, isSignInWithEmailLink } from "firebase/auth";

export default function FirebaseUI({ config }) {
  const auth = getAuth();

  const [emailLinkOpen, setEmailLinkOpen] = useState(
    isSignInWithEmailLink(auth, window.location.href)
  );
  const [sendSMS, setSendSMS] = useState(false);
  const [alert, setAlert] = useState("");
  const [error, setError] = useState("");

  return (
    <>
      <div className="mx-auto bg-white w-1/4 h-fit rounded-lg flex flex-col items-center p-3 gap-3">
        {!sendSMS &&
          !emailLinkOpen &&
          config?.signInOptions?.map((provider, i) => {
            if (typeof provider == "string") {
              return (
                <Provider
                  key={i}
                  providerId={provider}
                  callbacks={config?.callbacks}
                  resetContinueUrl={config?.resetContinueUrl}
                  setSendSMS={setSendSMS}
                  setEmailLinkOpen={setEmailLinkOpen}
                  setAlert={setAlert}
                  setError={setError}
                />
              );
            } else if (typeof provider == "object") {
              return (
                <Provider
                  key={i}
                  providerId={provider?.provider}
                  {...provider}
                  callbacks={config?.callbacks}
                  resetContinueUrl={config?.resetContinueUrl}
                  setSendSMS={setSendSMS}
                  setEmailLinkOpen={setEmailLinkOpen}
                  setAlert={setAlert}
                  setError={setError}
                />
              );
            }
          })}
        {sendSMS && <PhoneNumber setSendSMS={setSendSMS} setAlert={setAlert}
          setError={setError} />}
        {emailLinkOpen && (
          <EmailLink
            setEmailLinkOpen={setEmailLinkOpen}
            resetContinueUrl={config?.resetContinueUrl}
            setAlert={setAlert}
            setError={setError}
          />
        )}

        {alert && <div onClick={() => setAlert("")} className="p-1 w-full bg-yellow-100 border shadow-md border-yellow-200 rounded-md flex flex-col">
          <p className="p-1">{alert}</p>

        </div>}
        {error && <div onClick={() => setError("")} className="p-1 w-full bg-red-100 border shadow-md border-red-200 rounded-md">
          <p className="p-1 ">{error}</p>
        </div>}
      </div>
    </>
  );
}
