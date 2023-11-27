# react-firebaseui

React-FirebaseUI is a component library that allows you to add Firebase authentication to your React.js or Next.js project with only a few lines of code, regardless of your specific use case.

# Getting Started

1. Install using your preferred package manager:

   - `npm i react-firebaseui` or `yarn add react-firebaseui`

2. Import the `FirebaseUI` component:

   ```js
   import FirebaseUI from "react-firebaseui";
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
   <FirebaseUI auth={auth} config={config} />
   ```

# Sign In Options

`react-firebaseui` supports a wide variety of ways to authenticate. You can add and remove authentication methods by editing the `signInOptions` array in your configuration object. The following example contains all currently supported sign in options:

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

To override default button styles, pass a `customStyles` object containing React inline styles to the corresponding provider object:

```js
const config = {
  signInOptions: [
    {
      provider: "google.com",
      customStyles: { color: "#FF0000" },
    },
  ],
};
```

**Overriding Button Text**

By default, all buttons follow the `Sign In With <ProviderName>` pattern. You can change either the ProviderName, or the full text:

```js
const config = {
  signInOptions: [
    //Will display as "Sign In With Twitter"
    {
      provider: "x.com",
      providerName: "Twitter",
    },

    //Will display as "Continue With Google"
    {
      provider: "google.com",
      fullLabel: "Continue With Google",
    },
  ],
};
```

# Success & Failure Callbacks

To run some code after the user has been successfully authenticated (likely routing them to another page), or when authentication fails, you can pass custom callback functions into a `callbacks` object within your top-level configuration:

```js
const config = {
  callbacks: {
    //Authentication was successful
    signInSuccessWithAuthResult: function (userCredential) {
      //route the user somewhere
    },

    //Authentication failed
    signInFailure: function (error) {
      //custom error handling
    },
  },
};
```

`signInSuccessWithAuthResult` is passed a userCredential object containing the Firebase Credential of the newly authenticated user. Likewise, `signInFailure` is passed the error thrown by the failed operation.

# Email/Password Options

**Authentication Types (Sign In & Sign Up)**

By default, React-FirebaseUI allows for sign in and sign up in a single component. In other words, if you try to log in with a non-existent account, that account will then be created.

Although this behavior cannot be overridden on third party providers, you can limit the Email / Password sign in option to allow only new users, or only existing ones:

**Sign In Only**

```js
const config = {
  authType: "signIn",
  signInOptions: ["emailpassword"],
};
```

**Sign Up Only**

```js
const config = {
  authType: "signUp",
  signInOptions: ["emailpassword"],
};
```

You can add other providers if desired, but keep in mind they will not be limited to the authentication type you specify.

**continueUrl**

You must pass a `continueUrl` field to your top-level configuration if you want reset password and/or email link functionality in your app. This value should be set to the url where your component is rendered.

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
    minCharacters: 8, // Must contain at least 8 characters
    containsUppercase: true, // Must contain an uppercase letter A-Z
    containsLowercase: true, // Must contain a lowercase letter a-z
    containsNumber: true, // Must contain a number 0-9
    containsSpecialCharacter: true, //Must contain one of the following symbols: !@#$%^&*()_+/\-=[]{};':"|,.<>?
  },
  signInOptions: ["emailpassword"],
};
```

# Multi Factor Authentication

React-FirebaseUI supports Multi Factor Authentication for existing accounts. For this to work, you will have to enable MFA in Firebase Console. Furthermore, the process of adding a second factor is not supported and will have to be implemented manually.

# Display Name

To get the user's display name on non-Oauth providers (email/password, email link, SMS text sign in), you can pass a `displayName` field to your top-level configuration set to either `optional` or `required`. If you don't want a display name input field to show, don't set this config value at all:

```js
const config = {
  displayName: "required",
  signInOptions: ["emailpassword", "phonenumber", "emaillink"],
};
```
