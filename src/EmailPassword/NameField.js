"use client"
import React, { useState } from "react";
import { useEffect } from "react";

export default function NameField({
    value,
    setValue,
    validInputStyle,
    invalidInputStyle,
    labelStyle,
    descriptionStyle,
    disabled = false,
    formInputStyles,
    formLabelStyles,
    setNameValid
}) {
    const [isDirty, setIsDirty] = useState(false);
    const isValid = /^[a-zA-Z'-\s]+$/.test(value); //only letters, apostrophes, and hyphens

    const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

    useEffect(() => {
        setNameValid(isValid)
    }, [value])

    return (
        <div>
            <label htmlFor="email" style={{ ...labelStyle, ...formLabelStyles }}>
                Name
            </label>
            <div style={{ marginTop: "0.5rem" }}>
                <input
                    required
                    type="text"
                    name="name"
                    id="name"
                    style={{ ...inputStyle, ...formInputStyles }}
                    placeholder="Your Name"
                    autoComplete="name"
                    aria-describedby="name-description"
                    aria-invalid={!isValid ? "true" : "false"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={() => setIsDirty(true)}
                    disabled={disabled}
                />
            </div>
            <p style={descriptionStyle} id="name-description">
                {isDirty && !isValid && "Please enter a valid name."}&nbsp;
            </p>
        </div>
    );
}
