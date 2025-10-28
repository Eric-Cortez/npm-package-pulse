"use client"; // Error components must be Client Components
// Import React library and useEffect hook for side effects
import { useEffect } from "react";
// Default export function component for handling errors in the package detail page
export default function Error({ error, reset }) {
  // useEffect hook to log the error when it changes
  useEffect(() => {
    console.error(error);
  }, [error]);
  // Render a simple error message with a button to retry
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
