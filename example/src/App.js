import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

// import FirebaseUI from "react-firebaseui";
import FirebaseUI from "../../src/index";
import firebaseConfig from "./firebaseConfig.json";

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
      },
    },
    signInOptions: [
      { provider: "emailpassword" },
      {
        provider: "google.com",
        customParameters: { prompt: "select_account" },
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

// import React from "react";

// export default function App() {
//   return (
//     <div>
//       <h1>React FirebaseUI Component Demo</h1>
//       <FirebaseUI />
//     </div>
//   );
// }
