import React, { useEffect, useRef, useState } from "react";
import Provider from "./Provider";
import { providerStyles } from "./providerStyles";
import PhoneNumber from "./PhoneNumber";
import EmailLink from "./EmailLink";
import { isSignInWithEmailLink, onAuthStateChanged } from "firebase/auth";
import VerifyEmail from "./VerifyEmail";
import ResetPassword from "./ResetPassword";

export default function FirebaseUI({ auth, config }) {

  const queryParams = new URLSearchParams(window.location.search);

  const [emailLinkOpen, setEmailLinkOpen] = useState(
    isSignInWithEmailLink(auth, window.location.href),
  );

  const [sendSMS, setSendSMS] = useState(false);
  const [verify, setVerify] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(queryParams.get('resetPassword') === "true")
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [mfaSignIn, setMfaSignIn] = useState(false);
  const [mfaResolver, setMfaResolver] = useState();

  const [alert, setAlert] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    //open the email verification for signed in but unverified users.
    if (config?.requireVerifyEmail && user && user.providerData[0].providerId == "password" && !user?.emailVerified) {
      setVerify(true);
    }
  }, [user])

  return (
    <>
      <div
        style={{
          margin: '0 auto',
          width: '100%',
          height: 'fit-content',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.75rem',
          gap: '0.75rem',
          ...config?.containerStyles
        }}
      >
        {resetPasswordOpen &&
          <ResetPassword
            callbacks={config?.callbacks}
            setAlert={setAlert}
            setError={setError}
            auth={auth}
            passwordSpecs={config?.passwordSpecs}
            formButtonStyles={config?.formButtonStyles}
            formDisabledStyles={config?.formDisabledStyles}
            formInputStyles={config?.formInputStyles}
            formLabelStyles={config?.formLabelStyles}
            formSmallButtonStyles={config?.formSmallButtonStyles}
          />}
        {!sendSMS &&
          !emailLinkOpen && !verify && !resetPasswordOpen &&
          config?.signInOptions?.map((provider, i) => {
            if (typeof provider == "string") {
              return (
                <Provider
                  key={i}
                  auth={auth}
                  providerId={provider}
                  callbacks={config?.callbacks}
                  continueUrl={config?.continueUrl}
                  displayName={config?.displayName}
                  authType={config?.authType}
                  setSendSMS={setSendSMS}
                  setEmailLinkOpen={setEmailLinkOpen}
                  setAlert={setAlert}
                  setError={setError}
                  user={user}
                  setVerify={setVerify}
                  setMfaSignIn={setMfaSignIn}
                  setMfaResolver={setMfaResolver}
                  passwordSpecs={config?.passwordSpecs}
                  formButtonStyles={config?.formButtonStyles}
                  formDisabledStyles={config?.formDisabledStyles}
                  formInputStyles={config?.formInputStyles}
                  formLabelStyles={config?.formLabelStyles}
                  formSmallButtonStyles={config?.formSmallButtonStyles}
                />
              );
            } else if (typeof provider == "object") {
              return (
                <Provider
                  key={i}
                  auth={auth}
                  authType={config?.authType}
                  providerId={provider?.provider}
                  {...provider}
                  passwordSpecs={config?.passwordSpecs}
                  callbacks={config?.callbacks}
                  displayName={config?.displayName}
                  continueUrl={config?.continueUrl}
                  setSendSMS={setSendSMS}
                  setEmailLinkOpen={setEmailLinkOpen}
                  setAlert={setAlert}
                  setError={setError}
                  user={user}
                  setVerify={setVerify}
                  setMfaSignIn={setMfaSignIn}
                  setMfaResolver={setMfaResolver}
                  formButtonStyles={config?.formButtonStyles}
                  formDisabledStyles={config?.formDisabledStyles}
                  formInputStyles={config?.formInputStyles}
                  formLabelStyles={config?.formLabelStyles}
                  formSmallButtonStyles={config?.formSmallButtonStyles}
                />
              );
            }
          })}
        {sendSMS && (
          <PhoneNumber
            callbacks={config?.callbacks}
            auth={auth}
            authType={config?.authType}
            setSendSMS={setSendSMS}
            setAlert={setAlert}
            setError={setError}
            user={user}
            mfaSignIn={mfaSignIn}
            mfaResolver={mfaResolver}
            isResetPassword={isResetPassword}
            setResetPasswordOpen={setResetPasswordOpen}
            displayName={config?.displayName}
            formButtonStyles={config?.formButtonStyles}
            formDisabledStyles={config?.formDisabledStyles}
            formInputStyles={config?.formInputStyles}
            formLabelStyles={config?.formLabelStyles}
            formSmallButtonStyles={config?.formSmallButtonStyles}
          />
        )}
        {verify && (
          <VerifyEmail user={user} setAlert={setAlert} setError={setError} setSendSMS={setSendSMS} />
        )}
        {emailLinkOpen && (
          <EmailLink
            auth={auth}
            authType={config?.authType}
            setEmailLinkOpen={setEmailLinkOpen}
            continueUrl={config?.continueUrl}
            setAlert={setAlert}
            setError={setError}
            user={user}
            setMfaSignIn={setMfaSignIn}
            setMfaResolver={setMfaResolver}
            setSendSMS={setSendSMS}
            isResetPassword={isResetPassword}
            setResetPasswordOpen={setResetPasswordOpen}
            displayName={config?.displayName}
            formButtonStyles={config?.formButtonStyles}
            formDisabledStyles={config?.formDisabledStyles}
            formInputStyles={config?.formInputStyles}
            formLabelStyles={config?.formLabelStyles}
            formSmallButtonStyles={config?.formSmallButtonStyles}
          />
        )}

        {/* TODO: if there's an onClick handler, for accessibility the element should be a button */}
        {alert && (
          <div
            onClick={() => setAlert("")}
            style={{
              padding: '0.25rem',
              width: '100%',
              backgroundColor: '#fefcbf', // yellow-100
              border: '1px solid #fef9c3', // yellow-200
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              borderRadius: '0.375rem',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <p style={{ padding: '0.25rem' }}>{alert}</p>
          </div>
        )}
        {error && (
          <div
            onClick={() => setError("")}
            style={{
              padding: '0.25rem',
              width: '100%',
              backgroundColor: '#fed7d7', // red-100
              border: '1px solid #fecaca', // red-200
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              borderRadius: '0.375rem'
            }}
          >
            <p style={{ padding: '0.25rem' }}>{error}</p>
          </div>
        )}
      </div>
    </>
  );
}
