import '@testing-library/jest-dom'
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EmailPassword from "./EmailPassword";



describe('<EmailPassword/>', () => {
    test("component renders", () => {
        render(<EmailPassword />);
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByTestId("passwordInput")).toBeInTheDocument();
    })

    test("form validation", () => {

        const mockCallback = jest.fn();

        render(<EmailPassword callbacks={{ signInSuccessWithAuthResult: mockCallback }} />);
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "john@milk.com" } })
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "bebop123!" } })
        fireEvent.click(screen.getByRole('button', { name: /sign in with email/i }))

    })
})