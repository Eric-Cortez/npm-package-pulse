"use client";
// hook to get the current authenticated user
import { onAuthStateChanged } from "firebase/auth";
// react imports
import { useEffect, useState } from "react";
// firebase auth import
import { auth } from "@/src/lib/firebase/clientApp.js";
import { useRouter } from "next/navigation";
// custom hook to get the current user
export function useUser() {
  // state to hold the user
  const [user, setUser] = useState();
  // useEffect to set up the auth state listener
  useEffect(() => {
    return onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
  }, []);
  // return the user
  return user;
}
