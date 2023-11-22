"use client"

import React, { useEffect, useState } from "react";

export default function ResetPassword({ passwordSpecs }) {
    const [password, setPassword] = useState("");
    const [passwordVerify, setPasswordVerify] = useState("");
    const [formIsValid, setFormIsValid] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email')
    const [showPassHelper, setShowPassHelper] = useState(false);

    const submit = function (e) {
        e.preventDefault();
        if (!formIsValid) return;

        console.log("Valid")
    }

    useEffect(() => {
        setFormIsValid(
            isPasswordValid() && password === passwordVerify,
        );

        setShowPassHelper(!isPasswordValid() && password.length > 0);
    }, [password, passwordVerify]);

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
                        <label htmlFor="password">New Password</label>
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
                                width: '100%'
                            }}
                        />
                        {showPassHelper && (
                            <div style={{
                                width: '20%',
                                padding: '0.5rem',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                borderRadius: '0.375rem',
                                position: 'absolute',
                                backgroundColor: 'white'
                            }}>
                                <p>Your password must contain:</p>
                                <ul>
                                    {password.length < (passwordSpecs?.minCharacters || 6) && (
                                        <li>
                                            - At least {passwordSpecs?.minCharacters || 6} characters
                                        </li>
                                    )}
                                    {passwordSpecs?.containsUppercase &&
                                        !/[A-Z]/.test(password) && <li>- 1 uppercase character</li>}
                                    {passwordSpecs?.containsLowercase &&
                                        !/[a-z]/.test(password) && <li>- 1 lowercase character</li>}
                                    {passwordSpecs?.containsNumber && !/\d/.test(password) && (
                                        <li>- 1 number</li>
                                    )}
                                    {passwordSpecs?.containsSpecialCharacter &&
                                        !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && (
                                            <li>- 1 special character</li>
                                        )}
                                </ul>
                            </div>
                        )}
                    </div>
                    <label htmlFor="passwordverify">Confirm Password</label>
                    <input
                        data-testid="passwordInput"
                        id="passwordverify"
                        type="password"
                        value={passwordVerify}
                        onChange={(e) => setPasswordVerify(e.target.value)}
                        style={{
                            border: '1px solid #e2e8f0', // gray-300
                            borderRadius: '0.375rem',
                            padding: '0.5rem 0.75rem',
                            width: '100%'
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            color: 'white',
                            fontWeight: '600',
                            marginTop: '1.25rem',
                            width: '100%',
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