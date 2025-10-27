// Import function to generate fake package and review data for testing
import { generateFakePackagesAndReviews } from "@/src/lib/fakePackages.js";

// Import Firestore database functions and utilities from Firebase SDK
import {
  collection, // Function to get reference to a Firestore collection
  onSnapshot, // Function to listen for real-time updates to documents
  query, // Function to create queries with filters and ordering
  getDocs, // Function to get documents from a query (one-time read)
  doc, // Function to get reference to a specific document
  getDoc, // Function to get a single document (one-time read)
  updateDoc, // Function to update fields in an existing document
  orderBy, // Function to order query results by a field
  Timestamp, // Firestore timestamp utility class
  runTransaction, // Function to run operations within a transaction
  where, // Function to add where clauses to queries for filtering
  addDoc, // Function to add a new document to a collection
  getFirestore, // Function to get Firestore database instance
} from "firebase/firestore";

// Import the Firestore database instance from client app configuration
import { db } from "@/src/lib/firebase/clientApp";

// Export async function to update a package's image URL in Firestore
export async function updatePackageImageReference(
  packageId, // The ID of the package to update
  publicImageUrl // The new image URL to set for the package
) {
  // Get a reference to the specific package document in the collection
  const packageRef = doc(collection(db, "packages"), packageId);
  // Check if the package reference exists
  if (packageRef) {
    // Update the photo field with the new image URL
    await updateDoc(packageRef, { photo: publicImageUrl });
  }
}

// Private function to update package rating data
const updateWithRating = async (
  transaction, // The Firestore transaction object
  docRef, // Reference to the package document
  newRatingDocument, // Reference to the new rating document to be created
  review // The review object containing rating and other data
) => {
  const myPackage = await transaction.get(docRef); // Get the package document within the transaction
  const data = myPackage.data(); // Get the data from the package document
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1; // Increment the number of ratings
  const newSumRating = (data?.sumRating || 0) + Number(review.rating); // Add the new rating to the sum of ratings
  const newAverage = newSumRating / newNumRatings; // Calculate the new average rating

  transaction.update(docRef, { // Update the package document within the transaction
    numRatings: newNumRatings, // Set the new number of ratings
    sumRating: newSumRating, // Set the new sum of ratings
    avgRating: newAverage, // Set the new average rating
  });

  transaction.set(newRatingDocument, { // Create the new rating document within the transaction
    ...review, // Spread the review object to include all its properties
    timestamp: Timestamp.fromDate(new Date()), // Add a server timestamp to the rating
  });
};


// Export async function to add a review to a package
export async function addReviewToPackage(db, packageId, review) {
  if (!packageId) { // Check if a package ID has been provided
    throw new Error("No package ID has been provided."); // Throw an error if no package ID is provided
  }

  if (!review) { // Check if a valid review has been provided
    throw new Error("A valid review has not been provided."); // Throw an error if no review is provided
  }

  try { // Start a try-catch block for error handling
    const docRef = doc(collection(db, "packages"), packageId); // Get a reference to the package document
    const newRatingDocument = doc( // Get a reference for a new rating document in the ratings subcollection
      collection(db, `packages/${packageId}/ratings`)
    );

    // corrected line
    await runTransaction(db, transaction => // Run a Firestore transaction
      updateWithRating(transaction, docRef, newRatingDocument, review) // Call the private function to update ratings within the transaction
    );
  } catch (error) { // Catch any errors that occur during the transaction
    console.error( // Log an error message to the console
      "There was an error adding the rating to the package",
      error
    );
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Function to apply filtering and sorting to a Firestore query
function applyQueryFilters(q, { category, sort }) {
  // Check if category filter is provided
  if (category) {
    // Add where clause to filter by category field
    q = query(q, where("category", "==", category));
  }
  // Check sorting preference - default to "Rating" if not specified
  if (sort === "Rating" || !sort) {
    // Sort by average rating in descending order (highest ratings first)
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    // Sort by number of ratings in descending order (most reviewed first)
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the modified query with applied filters and sorting
  return q;
}

// Export async function to get packages from Firestore with optional filtering
export async function getPackages(db = db, filters = {}) {
  // Create base query for the packages collection
  let q = query(collection(db, "packages"));

  // Apply any provided filters and sorting to the query
  q = applyQueryFilters(q, filters);
  // Execute the query and get the results
  const results = await getDocs(q);
  // Map the results to return formatted package objects
  return results.docs.map((doc) => {
    // Return object with document ID and data
    return {
      id: doc.id, // Document ID from Firestore
      ...doc.data(), // Spread all document fields
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JavaScript Date
    };
  });
}

// Export function to listen for real-time updates to packages collection
export function getPackagesSnapshot(cb, filters = {}) {
  // Validate that callback parameter is a function
  if (typeof cb !== "function") {
    // Log error message if callback is not a function
    console.log("Error: The callback parameter is not a function");
    // Exit early if invalid callback
    return;
  }

  // Create base query for the packages collection
  let q = query(collection(db, "packages"));
  // Apply any provided filters and sorting to the query
  q = applyQueryFilters(q, filters);

  // Set up real-time listener on the query
  return onSnapshot(q, (querySnapshot) => {
    // Map the snapshot results to formatted package objects
    const results = querySnapshot.docs.map((doc) => {
      // Return object with document ID and data
      return {
        id: doc.id, // Document ID from Firestore
        ...doc.data(), // Spread all document fields
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JavaScript Date
      };
    });

    // Call the provided callback function with the results
    cb(results);
  });
}

// Export async function to get a specific package by its ID
export async function getPackageById(db, packageId) {
  // Validate that a package ID was provided
  if (!packageId) {
    // Log error message for invalid ID
    console.log("Error: Invalid ID received: ", packageId);
    // Exit early if no valid ID
    return;
  }
  // Get reference to the specific package document
  const docRef = doc(db, "packages", packageId);
  // Fetch the document snapshot
  const docSnap = await getDoc(docRef);
  // Return formatted package object with converted timestamp
  return {
    ...docSnap.data(), // Spread all document fields
    timestamp: docSnap.data().timestamp.toDate(), // Convert Firestore timestamp to JavaScript Date
  };
}

// Export function to listen for real-time updates to a specific package
export function getPackageSnapshotById(packageId, cb) {
  // Get reference to the specific package document
  const docRef = doc(db, "packages", packageId);
  // Set up real-time listener on the document
  return onSnapshot(docRef, (docSnap) => {
    // Call the provided callback function with the document data
    cb(docSnap.data());
  });
}

// Export async function to get all reviews for a specific package
export async function getReviewsByPackageId(db, packageId) {
  // Validate that a package ID was provided
  if (!packageId) {
    // Log error message for invalid package ID
    console.log("Error: Invalid packageId received: ", packageId);
    // Exit early if no valid ID
    return;
  }

  // Create query for the ratings subcollection within the specific package
  const q = query(
    collection(db, "packages", packageId, "ratings"), // Path to ratings subcollection
    orderBy("timestamp", "desc") // Sort by timestamp in descending order (newest first)
  );

  // Execute the query and get the results
  const results = await getDocs(q);
  // Map the results to return formatted review objects
  return results.docs.map((doc) => {
    // Return object with document ID and data
    return {
      id: doc.id, // Document ID from Firestore
      ...doc.data(), // Spread all document fields
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JavaScript Date
    };
  });
}

// Export function to listen for real-time updates to reviews for a specific package
export function getReviewsSnapshotByPackageId(packageId, cb) {
  // Validate that a package ID was provided
  if (!packageId) {
    // Log error message for invalid package ID
    console.log("Error: Invalid packageId received: ", packageId);
    // Exit early if no valid ID
    return;
  }

  // Create query for the ratings subcollection within the specific package
  const q = query(
    collection(db, "packages", packageId, "ratings"), // Path to ratings subcollection
    orderBy("timestamp", "desc") // Sort by timestamp in descending order (newest first)
  );
  // Set up real-time listener on the query
  return onSnapshot(q, (querySnapshot) => {
    // Map the snapshot results to formatted review objects
    const results = querySnapshot.docs.map((doc) => {
      // Return object with document ID and data
      return {
        id: doc.id, // Document ID from Firestore
        ...doc.data(), // Spread all document fields
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JavaScript Date
      };
    });
    // Call the provided callback function with the results
    cb(results);
  });
}

// Export async function to add fake packages and reviews to Firestore for testing
export async function addFakePackagesAndReviews() {
  // Generate fake package and review data using the utility function
  const data = await generateFakePackagesAndReviews();
  // Loop through each package and its associated ratings data
  for (const { packageData, ratingsData } of data) {
    // Try to add package and rating data to Firestore
    try {
      // Add the package document to the packages collection
      const docRef = await addDoc(
        collection(db, "packages"), // Reference to packages collection
        packageData // Package data object to store
      );

      // Loop through each rating for this package
      for (const ratingData of ratingsData) {
        // Add each rating document to the ratings subcollection
        await addDoc(
          collection(db, "packages", docRef.id, "ratings"), // Path to ratings subcollection
          ratingData // Rating data object to store
        );
      }
    } catch (e) {
      // Log error message if there was a problem adding documents
      console.log("There was an error adding the document");
      // Log the detailed error information
      console.error("Error adding document: ", e);
    }
  }
}
