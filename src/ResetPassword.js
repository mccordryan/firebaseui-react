"use client"

import { updatePassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { errors } from "./Errors";
import EmailField from "./EmailPassword/EmailField";
import PasswordField from "./EmailPassword/PasswordField";
import { descriptionStyle, invalidInputStyle, labelStyle, validInputStyle, buttonStyle } from "./EmailPassword/defaultStyles";
import { translate, translateError } from "./Languages";

export default function ResetPassword({ passwordSpecs, callbacks, auth, formInputStyles, formDisabledStyles, formLabelStyles, formButtonStyles, customErrors, setError, setAlert, language, customText }) {
    const [password, setPassword] = useState("");
    const [formIsValid, setFormIsValid] = useState(false);

    const [email, setEmail] = useState("");
    const [showPassHelper, setShowPassHelper] = useState(false);
    const [loading, setLoading] = useState(false);

    const processNetworkError = (error) => {
        error = JSON.parse(JSON.stringify(error));
        if (error.code === 400 || error.code === "auth/network-request-failed" && error?.customData?.message) {
            let message = error.customData.message;
            let sliced = message.slice(32, message.length - 2)
            error.code = sliced;
        }

        return error;
    }

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        setEmail(queryParams.get('email'))
    }, [])

    const finishReset = function (e) {
        e.preventDefault();
        if (!formIsValid) return;

        try {
            updatePassword(auth.currentUser, password).then(() => {
                if (callbacks?.signInSuccessWithAuthResult) {
                    callbacks.signInSuccessWithAuthResult()
                }
            })
        } catch (error) {
            error = processNetworkError(error);
            setError(translateError(error.code, language, customText));
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


        <form style={{ width: "100%", gap: "1rem" }} onSubmit={finishReset}>
            <div>
                <label style={{ ...labelStyle, ...formLabelStyles }}>{translate("email", language, customText)}</label>
                <input
                    value={email}
                    placeholder={translate("emailPlaceholder", language, customText)}
                    style={{ cursor: "not-allowed", marginTop: "0.5rem", ...formInputStyles, ...validInputStyle }}
                    disabled={true}
                />
            </div>
            <div style={{ marginTop: "1.5rem" }}>
                <PasswordField
                    value={password}
                    setValue={setPassword}
                    specs={passwordSpecs}
                    validInputStyle={validInputStyle}
                    invalidInputStyle={invalidInputStyle}
                    labelStyle={labelStyle}
                    descriptionStyle={descriptionStyle}
                    newPassword={true}
                    disabled={loading}
                    formInputStyles={formInputStyles}
                    formLabelStyles={formLabelStyles}
                    setPasswordValid={setFormIsValid}
                    setError={setError}
                    callbacks={callbacks}
                    language={language}
                    customText={customText}
                />
            </div>

            <button tabIndex="3" type="submit" disabled={loading || !formIsValid} style={{ ...buttonStyle, ...formButtonStyles, ...(formIsValid ? {} : { backgroundColor: "#696969", borderColor: "#2e2e2e", ...formDisabledStyles }) }}>
                {loading ? translate("loading", language, customText) : translate("resetPassword", language, customText)}
            </button>

        </form>

    )
}