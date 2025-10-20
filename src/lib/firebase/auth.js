// Import Firebase authentication functions and providers
import {
  GoogleAuthProvider, // Google OAuth provider for authentication
  signInWithPopup, // Function to sign in using popup window
  onAuthStateChanged as _onAuthStateChanged, // Listener for auth state changes
  onIdTokenChanged as _onIdTokenChanged, // Listener for ID token changes
} from "firebase/auth";

// Import the auth instance from the client app configuration
import { auth } from "./clientApp";

// Export function to listen for authentication state changes
export function onAuthStateChanged(cb) {
  // Call Firebase's onAuthStateChanged with our auth instance and callback
  return _onAuthStateChanged(auth, cb);
}

// Export function to listen for ID token changes
export function onIdTokenChanged(cb) {
  // Call Firebase's onIdTokenChanged with our auth instance and callback
  return _onIdTokenChanged(auth, cb);
}

// Export async function to handle Google sign-in
export async function signInWithGoogle() {
  // Create a new Google authentication provider instance
  const provider = new GoogleAuthProvider();

  // Try to sign in with Google using popup method
  try {
    // Attempt to sign in with popup using auth instance and Google provider
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors that occur during the sign-in process
    console.error("Error signing in with Google", error);
  }
}

// Export async function to handle user sign-out
export async function signOut() {
  // Try to sign out the current user
  try {
    // Call the signOut method on the auth instance and return the promise
    return auth.signOut();
  } catch (error) {
    // Log any errors that occur during the sign-out process
    console.error("Error signing out with Google", error);
  }
}