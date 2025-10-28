"use server";
// Import the necessary functions to interact with Firestore
import { addReviewToPackage} from "@/src/lib/firebase/firestore.js";
// Import authentication helper
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import Firestore
import { getFirestore } from "firebase/firestore";

// This is a Server Action
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
// Replace the function below
// This is a next.js server action, which is an alpha feature, so
// use with caution.
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
export async function handleReviewFormSubmission(data) {
    // Get an authenticated Firebase app instance for the current user
    const { app } = await getAuthenticatedAppForUser();
    // Get Firestore instance
    const db = getFirestore(app);
    // Add the review to the specified package
    await addReviewToPackage(db, data.get("packageId"), {
        text: data.get("text"),
        rating: data.get("rating"),

        // This came from a hidden form field.
        userId: data.get("userId"),
    });
}
