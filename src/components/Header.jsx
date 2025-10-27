// Directive to ensure this component runs on the client side
"use client";
// Import React library and useEffect hook for component lifecycle management
import React, { useEffect } from "react";
// Import Next.js Link component for client-side navigation
import Link from "next/link";
// Import authentication functions from the Firebase auth module
import {
  signInWithGoogle, // Function to sign in using Google authentication
  signOut, // Function to sign out the current user
  onIdTokenChanged, // Function to listen for auth state changes
} from "@/src/lib/firebase/auth.js";
// Import function to add sample package data to Firestore
import { addFakePackagesAndReviews } from "@/src/lib/firebase/firestore.js";
// Import cookie management functions for storing auth tokens
import { setCookie, deleteCookie } from "cookies-next";

// Custom hook to manage user session state and handle auth token changes
function useUserSession(initialUser) {
  // useEffect hook to set up auth state listener when component mounts
  useEffect(() => {
    // Return the unsubscribe function from onIdTokenChanged listener
    return onIdTokenChanged(async (user) => {
      // Check if user is authenticated
      if (user) {
        // Get the ID token from the authenticated user
        const idToken = await user.getIdToken();
        // Store the ID token in a cookie for server-side authentication
        await setCookie("__session", idToken);
      } else {
        // Delete the session cookie if user is not authenticated
        await deleteCookie("__session");
      }
      // Check if the current user is the same as the initial user
      if (initialUser?.uid === user?.uid) {
        // If same user, no need to reload the page
        return;
      }
      // Reload the page to reflect auth state changes
      window.location.reload();
    });
  }, [initialUser]); // Dependency array includes initialUser to re-run effect when it changes

  // Return the initial user state (this hook doesn't modify state directly)
  return initialUser;
}

// Default export function component for the application header
export default function Header({ initialUser }) {
  // Use the custom hook to manage user session state
  const user = useUserSession(initialUser);

  // Event handler function for sign out button click
  const handleSignOut = (event) => {
    // Prevent default anchor tag behavior
    event.preventDefault();
    // Call the sign out function from Firebase auth
    signOut();
  };

  // Event handler function for sign in button click
  const handleSignIn = (event) => {
    // Prevent default anchor tag behavior
    event.preventDefault();
    // Call the Google sign in function from Firebase auth
    signInWithGoogle();
  };

  // Return JSX that renders the header component
  return (
    <header>
      <Link href="/" className="logo">
        <img src="/build.png" alt="Build Pulse Logo" />
        Package Pulse
      </Link>
      {user ? (
        <>
          <div className="profile">
            <p>
              {user.photoURL ? (
                <img
                  className="profileImage"
                  src={user.photoURL}
                  alt={user.email}
                />
              ) : (
                <div className="profileImage fallback">
                  {user.email ? user.email.substring(0, 2).toUpperCase() : ""}
                </div>
              )}
              <span className="user-display-name">{user.displayName}</span>
            </p>

            <div className="menu">
              ...
              <ul>
                <li>
                  <span className="user-display-name">{user.displayName}</span>
                </li>

                <li>
                  <a href="#" onClick={addFakePackagesAndReviews}>
                    Add sample packages
                  </a>
                </li>

                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
