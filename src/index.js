import React, { useState } from "react";
import Provider from "./Provider";
import { providerStyles } from "./providerStyles";
import PhoneNumber from "./PhoneNumber";
import EmailLink from "./EmailLink";
import { isSignInWithEmailLink } from "firebase/auth";

export default function FirebaseUI({ auth, config }) {
  const [emailLinkOpen, setEmailLinkOpen] = useState(
    isSignInWithEmailLink(auth, window.location.href),
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
                  auth={auth}
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
                  auth={auth}
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
        {sendSMS && (
          <PhoneNumber
            auth={auth}
            setSendSMS={setSendSMS}
            setAlert={setAlert}
            setError={setError}
          />
        )}
        {emailLinkOpen && (
          <EmailLink
            auth={auth}
            setEmailLinkOpen={setEmailLinkOpen}
            resetContinueUrl={config?.resetContinueUrl}
            setAlert={setAlert}
            setError={setError}
          />
        )}

        {/* TODO: if there's an onClick handler, for accessibility the element should be a button */}
        {alert && (
          <div
            onClick={() => setAlert("")}
            className="p-1 w-full bg-yellow-100 border shadow-md border-yellow-200 rounded-md flex flex-col"
          >
            <p className="p-1">{alert}</p>
          </div>
        )}
        {error && (
          <div
            onClick={() => setError("")}
            className="p-1 w-full bg-red-100 border shadow-md border-red-200 rounded-md"
          >
            <p className="p-1">{error}</p>
          </div>
        )}
      </div>
    </>
  );
}
