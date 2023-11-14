"use client";

import FirebaseUI from "./FirebaseUI";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import firebaseConfig from "../firebaseConfig.json";

const app = initializeApp(firebaseConfig);
const auth = getAuth();

export default function Home() {
  const UIConfig = {
    resetContinueUrl: "http://localhost:3000",
    callbacks: {
      signInSuccessWithAuthResult: function (user) {
        console.log("successfully authenticated", user);
      },
      signInFailure: function (error) {
        console.log("somtin went wrong :9 :((");
        console.error(error);
      }
    },
    signInOptions: [{ provider: "emailpassword" }, { provider: "google.com", customParameters: { prompt: 'select_account' } }, "apple.com", "microsoft.com", "yahoo.com", "github.com", "x.com", "phonenumber", "facebook.com", "emaillink", "anonymous"],
  };

  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <FirebaseUI config={UIConfig} />
      {user && (
        <button
          className="text-black font-bold text-lg"
          onClick={() => signOut(auth)}
        >
          Sign Out
        </button>
      )}
    </main>
  );
}
