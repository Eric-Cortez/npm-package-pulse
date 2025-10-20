import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Importing Firebase Storage functions

import { storage } from "@/src/lib/firebase/clientApp"; // Importing the Firebase Storage instance

import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore"; // Importing function to update image reference in Firestore

// Async function to update a restaurant's image
export async function updateRestaurantImage(restaurantId, image) {
    try { // Starting a try-catch block for error handling
        if (!restaurantId) { // Checking if a restaurant ID has been provided
            throw new Error("No restaurant ID has been provided."); // Throwing an error if no restaurant ID is provided
        }

        if (!image || !image.name) { // Checking if a valid image has been provided
            throw new Error("A valid image has not been provided."); // Throwing an error if no valid image is provided
        }

        const publicImageUrl = await uploadImage(restaurantId, image); // Uploading the image and getting the public URL
        await updateRestaurantImageReference(restaurantId, publicImageUrl); // Updating the image reference in Firestore

        return publicImageUrl; // Returning the public image URL
    } catch (error) { // Catching any errors that occur
        console.error("Error processing request:", error); // Logging the error to the console
    }
}

// Async function to upload an image to Firebase Storage
async function uploadImage(restaurantId, image) {
    const filePath = `images/${restaurantId}/${image.name}`; // Creating a file path for the image
    const newImageRef = ref(storage, filePath); // Creating a reference to the new image in Firebase Storage
    await uploadBytesResumable(newImageRef, image); // Uploading the image to the specified reference

    return await getDownloadURL(newImageRef); // Getting and returning the download URL for the uploaded image
}
