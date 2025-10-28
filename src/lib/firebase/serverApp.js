// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
// Import server-only directive to ensure this module only runs on server side
import "server-only";

// Import Next.js cookies function to access HTTP cookies from server
import { cookies } from "next/headers";
// Import Firebase app initialization functions for server and client
import { initializeServerApp, initializeApp } from "firebase/app";

// Import Firebase authentication function to get auth instance
import { getAuth } from "firebase/auth";
// Firebase configuration object using environment variables
export const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};


// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
// Export async function to get authenticated Firebase app for server-side operations
export async function getAuthenticatedAppForUser() {
  // Get the authentication ID token from the __session cookie
  const authIdToken = (await cookies()).get("__session")?.value;

  // Firebase Server App is a new feature in the JS SDK that allows you to
  // instantiate the SDK with credentials retrieved from the client & has
  // other affordances for use in server environments.
  // Initialize Firebase Server App with client app configuration and auth token
  const firebaseServerApp = initializeServerApp(
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    // TOGGLE BETWEEN USING DEFAULT CONFIG AND ENV CONFIG for local testing
    // initializeApp(firebaseConfig), // Initialize base Firebase app with default configuration
    initializeApp(),
    {
      authIdToken, // Pass the ID token for authentication
    }
  );

  // Get the authentication instance from the server app
  const auth = getAuth(firebaseServerApp);
  // Wait for authentication state to be ready before proceeding
  await auth.authStateReady();

  // Return object containing the server app and current authenticated user
  return { firebaseServerApp, currentUser: auth.currentUser };
}

