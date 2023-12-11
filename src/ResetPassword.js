"use client"

import { updatePassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { errors } from "./Errors";

export default function ResetPassword({ passwordSpecs, callbacks, auth, formInputStyles, formDisabledStyles, formLabelStyles, formButtonStyles, customErrors }) {
    const [password, setPassword] = useState("");
    const [formIsValid, setFormIsValid] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email')
    const [showPassHelper, setShowPassHelper] = useState(false);

    const submit = function (e) {
        e.preventDefault();
        if (!formIsValid) return;

        try {
            updatePassword(auth.currentUser, password).then(() => {
                if (callbacks?.signInSuccessWithAuthResult) {
                    callbacks.signInSuccessWithAuthResult()
                }
            })
        } catch (error) {
            setError(customErrors && customErrors[error.code] !== undefined ? customErrors[error.code] : errors[error.code] || "Something went wrong. Try again later.");
            if (callbacks?.signInFailure) callbacks?.signInFailure(signInError);
            throw new Error(signInError.code);
        }
    }

    useEffect(() => {
        setFormIsValid(
            isPasswordValid(),
        );

        setShowPassHelper(!isPasswordValid() && password.length > 0);
    }, [password]);

    const isPasswordValid = function () {
        let isValid = password.length > 5; //basic firebase requirement

        if (passwordSpecs?.minCharacters) {
            isValid = isValid && password.length >= passwordSpecs?.minCharacters;
        }

        if (passwordSpecs?.containsUppercase) {
            isValid = isValid && /[A-Z]/.test(password);
        }

        if (passwordSpecs?.containsLowercase) {
            isValid = isValid && /[a-z]/.test(password);
        }

        if (passwordSpecs?.containsNumber) {
            isValid = isValid && /\d/.test(password);
        }

        if (passwordSpecs?.containsSpecialCharacter) {
            isValid =
                isValid && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        }

        return isValid;
    };

    return (
        <>

            <h1>Reset Password</h1>
            <p>{email || "NO email"}</p>
            <form style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '1rem',
                marginBottom: '1rem',
                gap: '1rem'
            }}>
                <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1a202c', // gray-900
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    width: '100%'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <label style={{ ...formLabelStyles }} htmlFor="password">New Password</label>
                    </div>
                    <div>
                        <input
                            data-testid="passwordInput"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                border: '1px solid #e2e8f0', // gray-300
                                borderRadius: '0.375rem',
                                padding: '0.5rem 0.75rem',
                                width: '100%',
                                ...formInputStyles
                            }}
                        />
                        {showPassHelper && (
                            <div style={{ marginTop: '0.25rem', width: '100%' }}>
                                {password.length < (passwordSpecs?.minCharacters || 6) && (
                                    <p style={{
                                        margin: '0.25rem 0rem',
                                        color: '#FF0000',
                                        textAlign: 'right'
                                    }}>
                                        {passwordSpecs?.minCharacters || 6} characters minimum
                                    </p>
                                )}
                                {passwordSpecs?.containsUppercase &&
                                    !/[A-Z]/.test(password) && <p style={{
                                        margin: '0.25rem 0rem',
                                        color: '#FF0000',
                                        textAlign: 'right'
                                    }}>1 uppercase character</p>}
                                {passwordSpecs?.containsLowercase &&
                                    !/[a-z]/.test(password) && <p style={{
                                        margin: '0.25rem 0rem',
                                        color: '#FF0000',
                                        textAlign: 'right'
                                    }}>1 lowercase character</p>}
                                {passwordSpecs?.containsNumber && !/\d/.test(password) && (
                                    <p style={{
                                        margin: '0.25rem 0rem',
                                        color: '#FF0000',
                                        textAlign: 'right'
                                    }}>1 number</p>
                                )}
                                {passwordSpecs?.containsSpecialCharacter &&
                                    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && (
                                        <p style={{
                                            margin: '0.25rem 0rem',
                                            color: '#FF0000',
                                            textAlign: 'right'
                                        }}>1 special character</p>
                                    )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        style={{
                            color: 'white',
                            fontWeight: '600',
                            marginTop: '1.25rem',
                            width: '100%',
                            height: '2.25rem',
                            alignItems: 'center',
                            transition: 'background-color 150ms',
                            backgroundColor: formIsValid ? '#60a5fa' : '#9ca3af', // bg-blue-400 for valid, bg-gray-400 for invalid
                            cursor: formIsValid ? 'pointer' : 'default', // cursor changes based on form validity
                            ...(formIsValid ? { ':hover': { backgroundColor: '#3b82f6' } } : {}), // hover effect for valid form
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            justifyContent: 'center',
                            border: 'none',
                            ...formButtonStyles,
                            ...(formIsValid ? {} : formDisabledStyles)
                        }}
                        onClick={(e) => submit(e)}
                    >
                        {"Save"}
                    </button>
                </div>
            </form>
        </>
    )
}