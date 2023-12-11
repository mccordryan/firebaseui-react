import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

// in your app, use this import instead:
// import FirebaseUI from "react-firebaseui";
import FirebaseUI from "../../src/index";
import firebaseConfig from "./firebaseConfig.json";

const app = initializeApp(firebaseConfig);
const auth = getAuth();

export default function Home() {

  const customIcon = <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 12H17M8 8.5C8 8.5 9 9 10 9C11.5 9 12.5 8 14 8C15 8 16 8.5 16 8.5M8 15.5C8 15.5 9 16 10 16C11.5 16 12.5 15 14 15C15 15 16 15.5 16 15.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  const UIConfig = {
    continueUrl: "http://localhost:8080",
    // requireVerifyEmail: true,
    callbacks: {
      signInSuccessWithAuthResult: function (user) {
        console.log("successfully authenticated", user);
      },
      signInFailure: function (error) {
        console.log("somtin went wrong :9 :((");
        console.error(error);
      },
    },
    authType: "signIn",
    passwordSpecs: { containsSpecialCharacter: true, minCharacters: 8 },
    displayName: "required",
    signInOptions: [
      {
        provider: "emailpassword",
      },
      {
        provider: "google.com",
        customParameters: { prompt: "select_account" },
        icon: customIcon
      },
      "apple.com",
      "microsoft.com",
      "yahoo.com",
      "github.com",
      "x.com",
      "phonenumber",
      "facebook.com",
      "emaillink",
      "anonymous",
    ],
  };

  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <main>
      <h1>React FirebaseUI Component Demo</h1>
      <FirebaseUI auth={auth} config={UIConfig} />
      {user && (
        <div>
          <pre>{JSON.stringify({ user }, null, 2)}</pre>
          <button onClick={() => signOut(auth)}>Sign Out</button>
        </div>
      )}
    </main>
  );
}
