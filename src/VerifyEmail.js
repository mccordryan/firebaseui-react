import React from "react";
import { sendEmailVerification } from "firebase/auth"
import { useEffect, useState } from "react";

export default function VerifyEmail({ user, setAlert }) {

    const [verified, setVerified] = useState(user?.emailVerified);
    const [sent, setSent] = useState(false)
    useEffect(() => {
        if (user) {
            setVerified(user.emailVerified)
        }
    }, [user])



    return (
        <>
            <h1>Email Verification</h1>
            {!sent && <p>You'll need to verify your email to continue.</p>}
            {!sent && <button onClick={async (e) => {
                e.preventDefault();
                await sendEmailVerification(user).then(() => {
                    setSent(true)
                    setAlert(`An email has been sent to ${user.email}`)
                })

            }}>Send a link to {user.email}</button>}

            {verified && <h1>aay nice</h1>}
        </>
    )
}