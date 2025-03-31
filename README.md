# firebaseui-react

firebaseui-react is a component library that allows you to add Firebase authentication to your React.js or Next.js project with only a few lines of code, regardless of your specific use case.

# A note on maintenance

I no longer use Firebase and consequently do not maintain this repository anymore. To my knowledge, it is still compatible with the latest version of Firebase at this point in time (March, 2025). 

# Demo

See a demo here: https://fuidemo.vercel.app/

Note that, while all buttons are displayed, the demo currently only supports Email, Phone Number, Google, Passwordless, and anonymous sign in.

# Getting Started

1. Install using your preferred package manager:

   - `npm i firebaseui-react` or `yarn add firebaseui-react`

2. Import the `FirebaseUIReact` component:

   ```js
   import FirebaseUIReact from "firebaseui-react";
   ```

3. Initialize a configuration object and a Firebase Auth instance:

   ```js
   const auth = getAuth();

   const config = {
     continueUrl: "example.com/auth",
     signInOptions: ["emailpassword", "google.com"],
   };
   ```

4. Return the component with valid Firebase Auth Instance:

   ```js
   <FirebaseUIReact auth={auth} config={config} />
   ```

# Configuration

The rest of this documentation will show the various ways you can modify your configuration object for your use case. Refer to the final section for an exhaustive configuration example, containing all possible fields.

# Sign In Options

`firebaseui-react` supports a wide variety of ways to authenticate. You can add and remove authentication methods by editing the `signInOptions` array in your configuration object. The following example contains all currently supported sign in options:

```js
const config = {
  signInOptions: [
    "emailpassword",
    "google.com",
    "apple.com",
    "facebook.com",
    "x.com",
    "github.com",
    "microsoft.com",
    "yahoo.com",
    "phonenumber", //SMS Text Sign In
    "emaillink", // Email Link (passwordless) Sign In
    "anonymous",
  ],
};
```

You must first set up each provider in the Firebase Console for it to work in your app.

Note that these methods will render in the order you pass them to `signInOptions`, with the first value appearing at the top, and so on.

# Advanced Sign In Options

You can pass more specific settings to individual providers by passing a provider object into `signInOptions` rather than a string.

```js
const config = {
  signInOptions: [
    "emailpassword",
    {
      provider: "google.com",
      customParameters: "select_account",
      signInFlow: "redirect",
    },
  ],
};
```

**Adding OAuth Scopes**

To add OAuth Scopes, pass the name of the scope into a `scopes` array within a provider object:

```js
const config = {
    signInOptions: [
        {
            provider: "facebook.com",
            scopes: ["user_birthday", ...]
        }
    ]
}
```

Scope names are determined by the provider themselves, and can be found online with a quick search (i.e. Facebook Provider Scopes List)
**Sign In Flow**

You can set the sign in flow on third party providers to use either a redirect or a popup:

```js
const config = {
  signInOptions: [
    {
      provider: "google.com",
      signInFlow: "popup",
    },
    {
      provider: "github.com",
      signInFlow: "redirect",
    },
  ],
};
```

**Overriding Default Styles**

To override default button styles, pass a `customStyles` object containing React inline styles to the corresponding provider object. To override the background color:

```js
const config = {
  signInOptions: [
    { provider: "google.com", customStyles: { backgroundColor: "#000" } }, // sets the background color to black
  ],
};
```

To override the text color:

```js
const config = {
  signInOptions: [
    { provider: "google.com", customStyles: { color: "#fff" } }, // sets the text color to white
  ],
};
```

To override the border color:

```js
const config = {
  signInOptions: [
    { provider: "google.com", customStyles: { borderColor: "#FF0000" } }, // sets the background color to red
  ],
};
```

Or to override all three:

```js
const config = {
  signInOptions: [
    {
      provider: "google.com",
      customStyles: {
        backgroundColor: "#000",
        color: "#fff",
        borderColor: "#FF0000",
      },
    },
  ],
};
```

Note that you can add any React inline styles to customize these buttons, including properties that are not already in use. To add a text underline, for example:

```js
const config = {
  signInOptions: [
    {
      provider: "google.com",
      customStyles: { textDecoration: "underline" },
    },
  ],
};
```

**Overriding Container Styles**

You can override the styles of the top-level container component by adding a `containerStyles` object of React Inline Styles (see above) to your top level configuration:

```js
const config = {
  signInOptions: ["google.com"],
  containerStyles: { backgroundColor: "#2e2e2e" }, // A dark mode color
};
```

**Overriding Form Styles**

To override the styles of inputs, labels, and form buttons, you can pass an object of React Inline Styles (see above) to your top level configuration. The following is a list of valid form style fields:

- `formButtonStyles` overrides the default blue form button.
- `formDisabledStyles` overrides the gray disabled form button.
- `formInputStyles` overrides default <input> styles
- `formLabelStyles` overrides default <label> styles
- `formSmallButtonStyles` overrides small form buttons (Forgot Password? and Cancel buttons)

```js
const config = {
  signInOptions: ["emailpassword", "emaillink", "phonenumber"],
  formButtonStyles: { backgroundColor: "green" },
  formDisabledStyles: { backgroundColor: "red" },
  formInputStyles: { padding: "5px" },
  formLabelStyles: { fontWeight: "700" },
  formSmallButtonStyles: { textDecoration: "underline" },
};
```

Note that styles set in `formButtonStyles` will persist into the disabled state unless directly overridden in `formDisabledStyles`. In the example below, the 20px of padding will be applied regardless of the button's disabled state. Only the color will change.

```js
const config = {
  signInOptions: ["emailpassword", "emaillink", "phonenumber"],
  formButtonStyles: { padding: "20px", backgroundColor: "green" },
  formDisabledStyles: { backgroundColor: "red" },
};
```

**Overriding Default Icons**

You can replace the default icons with custom ones by adding an `icon` field to the corresponding provider:

```js
const myCustomIcon = <svg>{/*SVG Information*/}</svg>;
const config = {
  signInOptions: [{ provider: "google.com", icon: myCustomIcon }],
};
```

**Overriding Button Text**

By default, all buttons follow the `Sign In With <ProviderName>` pattern. You can change either the ProviderName, or the full text:

```js
const config = {
  signInOptions: [
    //Will display as "Sign In With X"
    {
      provider: "x.com",
      providerName: "X",
    },

    //Will display as "Continue With Google"
    {
      provider: "google.com",
      fullLabel: "Continue With Google",
    },
  ],
};
```

**Passing Custom JSX**

If you have a custom component or JSX you want to pass in between providers (i.e. a `<hr/>` tag separating email/password from OAuth providers), you can pass an object to `signInOptions` with a provider of `jsx` and a `jsx` field containing your component:

```js
const config = {
  signInOptions: [
    "emailpassword",
    {
      provider: "jsx",
      jsx: <div>{/*Some custom JSX*/}</div>,
    },
    "google.com",
  ],
  //...
};
```

# Success & Failure Callbacks

To run some code after the user has been successfully authenticated (likely routing them to another page), or when authentication fails, you can pass custom callback functions into a `callbacks` object within your top-level configuration:

```js
const config = {
  callbacks: {
    //Authentication was successful
    signInSuccessWithAuthResult: (userCredential) => {
      //route the user somewhere
    },

    //Authentication failed
    signInFailure: (error) => {
      //custom error handling
    },
  },
};
```

`signInSuccessWithAuthResult` is passed a userCredential object containing the Firebase Credential of the newly authenticated user. Likewise, `signInFailure` is passed the error thrown by the failed operation.

If the user resets their password, `signInSuccessWithAuthResult` will not be called until the password has been successfully updated.

It is advised that you use the `signInSuccessWithAuthResult` callback for routing your authenticated users as opposed to a `useEffect` hook, because the `useEffect` hook will redirect users before they can complete a password reset. As a workaround to this, you can check to make sure the `resetPassword` query parameter is not `"true"` before you redirect.

# Reset Password

Because using Firebase's default reset password functionality routes you to a third party page with limited customizability, this package handles password resets by sending a regular sign in email (the same one sent by the "emaillink" provider). This workaround allows password resets to be handled locally within your project.

# Languages

`firebaseui-react` currently supports 9 commonly used languages. If no language is set, the component will default to English. You can add them by adding a language field to your config:

```js
const config = {
  signInOptions: ["google.com"],
  language: "es", // change the language to spanish
};
```

The following are currently supported languages and their accompanying language codes:

- Arabic (ar)
- German (de)
- English (en)
- Spanish (es)
- French (fr)
- Hindi (hi)
- Portugese (pt)
- Russian (ru)
- Simplified Chinese (zh)

# Custom Text & Error Handling

All text and errors in the component can be completely overridden. This is done by passing a `customText` object to your configuration, containing the text key to override and your desired text. For a full list of supported text keys, see the end of this page. Errors should be passed as a child object:

```js
const config = {
  signInOptions: ["google.com"],
  customText: {
    emailPlaceholder: "Enter Your Email Address Here",
    errors: {
      "auth/operation-not-allowed": "We are all doomed",
    },
  },
};
```

Note that for buttons, the `fullLabel` field will always take precedence over anything else, including `customText`.

# Email/Password Options

**Authentication Types (Sign In & Sign Up)**

By default, firebaseui-react allows for sign in and sign up in a single component. In other words, if you try to log in with a non-existent account, that account will then be created.

Although this behavior cannot be overridden on third party providers, you can limit the Email / Password sign in option to allow only new users, or only existing ones. This is done by adding an `authType` field inside an `emailpassword` provider object.

**Sign In Only**

```js
const config = {,
  signInOptions: [{
    provider: "emailpassword",
    authType: "signIn"
    }],
};
```

**Sign Up Only**

```js
const config = {,
  signInOptions: [{
    provider: "emailpassword",
    authType: "signUp"
    }],
};
```

**continueUrl**

You must pass a `continueUrl` field to your top-level configuration if you want reset password and/or email link functionality in your app. This value should be set to the url where your component is rendered. If it is not set to the proper url, reset password and email link features will not work as expected.

```js
const config = {
  continueUrl: "example.com/auth",
  signInOptions: ["emailpassword"],
};
```

**Custom Password Requirements**

By default, the only password requirement is Firebase's 6 character minimum. To add more stringent requirements, you can add a `passwordSpecs` object to your top-level configuration. This object accepts `minCharacters`, `containsUppercase`, `containsLowercase`, `containsNumber`, and `containsSpecialCharacter` field options:

```js
const config = {
  passwordSpecs: {
    minCharacters: 8, // Must contain at least 8 characters. The Firebase minimum is 6.
    containsUppercase: true, // Must contain an uppercase letter A-Z
    containsLowercase: true, // Must contain a lowercase letter a-z
    containsNumber: true, // Must contain a number 0-9
    containsSpecialCharacter: true, //Must contain one of the following symbols: !@#$%^&*()_+/\-=[]{};':"|,.<>?
  },
  signInOptions: ["emailpassword"],
};
```

The error message displayed under the password field when requirements are not met is also determined by `passwordSpecs`. If no `passwordSpecs` object is given, this message will default to the Firebase 6 character minimum.

# Multi Factor Authentication

firebaseui-react supports Multi Factor Authentication sign in for existing accounts. For this to work, you will have to enable MFA in Firebase Console. Furthermore, the process of adding a second factor is not supported and will have to be implemented manually.

# Display Name

To get the user's display name on non-Oauth providers (email/password, email link, SMS text sign in), you can pass a `displayName` field to your top-level configuration set to either `optional` or `required`. If you don't want a display name input field to show, don't set this config value at all:

```js
const config = {
  displayName: "required",
  signInOptions: ["emailpassword", "phonenumber", "emaillink"],
};
```

# Full Configuration Example

```js
const config = {
  // URL to redirect to after a successful sign-in.
  continueUrl: "example.com/auth",

  // Define all supported sign-in methods.
  signInOptions: [
    // Basic providers
    {
      provider: "emailpassword",

      // Customizing authentication types for Email/Password
      authType: "signIn", // Other values: 'signUp'
    },
    "apple.com",
    "x.com",
    "github.com",
    "microsoft.com",
    "yahoo.com",
    "phonenumber", // SMS Text Sign-In
    "emaillink", // Email Link (passwordless) Sign-In
    "anonymous",

    // Advanced Google provider configuration
    {
      provider: "google.com",
      customParameters: { prompt: "select_account" },
      signInFlow: "redirect", // Other value: 'popup'
      scopes: ["https://www.googleapis.com/auth/userinfo.email"], // Adding OAuth Scopes
      customStyles: {
        backgroundColor: "#000000", // Black background
        color: "#FFFFFF", // White text
        borderColor: "#FF0000", // Red border
        textDecoration: "underline", // Underlined text
      },
      fullLabel: "Continue With Google", // Custom button text
    },

    // Advanced Facebook provider configuration
    {
      provider: "facebook.com",
      scopes: ["user_birthday", "user_likes"], // Adding multiple OAuth Scopes
    },
  ],

  // Custom password requirements
  passwordSpecs: {
    minCharacters: 8, // Minimum 6
    containsUppercase: true,
    containsLowercase: true,
    containsNumber: true,
    containsSpecialCharacter: true,
  },

  // Display Name configuration for non-OAuth providers
  displayName: "required", // Other value: 'optional'

  // Success and Failure Callbacks
  callbacks: {
    signInSuccessWithAuthResult: (userCredential) => {
      // Handle successful authentication
    },
    signInFailure: (error) => {
      // Handle authentication failure
    },
  },
};
```

# List of Supported Custom Text Keys

Below is a list of all of the currently supported text keys that can be overridden, alongside their english translations. If you would like to see these values for other languages, refer to `Languages.js` in the source code. Note that errors work differently than regular text keys, so any error code you might add will be handled if it occurs, regardless of whether or not it is listed below.

```js
"en": {
        "email": "Email Address",
        "emailPlaceholder": "you@example.com",
        "password": "Password",
        "passwordPlaceholder": "your password",
        "name": "Name",
        "namePlaceholder": "your name",
        "sendResetLink": "Send Reset Link",
        "loginButton": "Log in or create account",
        "signInWith": "Sign in with",
        "loading": "Loading...",
        "phoneNumber": "Phone Number",
        "emailLink": "Email Link",
        "signInAsGuest": "Sign in as Guest",
        "signInWithEmailLink": "Sign in with Email Link",
        "sendEmailLink": "Send Email Link",
        "cancel": "Cancel",
        "emailDirty": "Please enter a valid email address.",
        "resetPasswordSent": "A reset-password email has been sent to",
        "resetPassword": "Reset Password",
        "nameDirty": "Please enter a valid name",
        "signInLinkSent": "A sign in link has been sent to",
        "somethingWentWrong": "Something went wrong. Try again later.",
        "signingYouIn": "Signing you in...",
        "codeSent": "A code has been sent to",
        "enterCode": "Enter code below",
        "verifyIdentity": "You'll need to verify your identity to continue",
        "verifyEmail": "You'll need to verify your email to continue",
        "sendSignInText": "Send a sign in text",
        "countryCode": "Country Code",
        "confirmationTextWillBeSent": "A confirmation text will be sent to your phone number ending in",
        "finishSigningIn": "Finish signing in",
        "sendText": "Send text",
        "sendALinkTo": "Send a link to",
        "oneUppercase": "one uppercase letter",
        "oneLowercase": "one lowercase letter",
        "oneSpecial": "one special character",
        "oneNumber": "one number",
        "atLeast": "at least",
        "characters": "characters",
        "and": "and",
        "andContainAtLeast": "and contain at least",
        "strongPasswordsHave": "Strong passwords have",
        "newPassword": "New Password",
        "newPasswordPlaceholder": "your new password",
        "emailDirtyNewPassword": "Please enter a valid email address to reset your password",
        "skip": "Skip",

        "errors": {

            "auth/invalid-login-credentials": "Incorrect email or password",
            "auth/email-already-in-use": "This email address is already in use",
            "auth/invalid-email": "Please provide a valid email address",
            "auth/invalid-phone-number": "Please provide a valid phone number",
            "auth/invalid-verification-code": "The code provided is invalid",
            "auth/popup-closed-by-user": "The popup was closed",
            "auth/cancelled-popup-request": "The popup was closed",
            "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "The Firebase API key is not valid.",
            "auth/invalid-credential": "Incorrect email or password"

        },


    },
```
