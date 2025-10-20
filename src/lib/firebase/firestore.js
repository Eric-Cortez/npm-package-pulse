// Import function to generate fake restaurant and review data for testing
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

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

// Export async function to update a restaurant's image URL in Firestore
export async function updateRestaurantImageReference(
  restaurantId, // The ID of the restaurant to update
  publicImageUrl // The new image URL to set for the restaurant
) {
  // Get a reference to the specific restaurant document in the collection
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  // Check if the restaurant reference exists
  if (restaurantRef) {
    // Update the photo field with the new image URL
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// Private function to update restaurant rating data
const updateWithRating = async (
  transaction, // The Firestore transaction object
  docRef, // Reference to the restaurant document
  newRatingDocument, // Reference to the new rating document to be created
  review // The review object containing rating and other data
) => {
  const restaurant = await transaction.get(docRef); // Get the restaurant document within the transaction
  const data = restaurant.data(); // Get the data from the restaurant document
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1; // Increment the number of ratings
  const newSumRating = (data?.sumRating || 0) + Number(review.rating); // Add the new rating to the sum of ratings
  const newAverage = newSumRating / newNumRatings; // Calculate the new average rating

  transaction.update(docRef, { // Update the restaurant document within the transaction
    numRatings: newNumRatings, // Set the new number of ratings
    sumRating: newSumRating, // Set the new sum of ratings
    avgRating: newAverage, // Set the new average rating
  });

  transaction.set(newRatingDocument, { // Create the new rating document within the transaction
    ...review, // Spread the review object to include all its properties
    timestamp: Timestamp.fromDate(new Date()), // Add a server timestamp to the rating
  });
};


// Export async function to add a review to a restaurant
export async function addReviewToRestaurant(db, restaurantId, review) {
  if (!restaurantId) { // Check if a restaurant ID has been provided
    throw new Error("No restaurant ID has been provided."); // Throw an error if no restaurant ID is provided
  }

  if (!review) { // Check if a valid review has been provided
    throw new Error("A valid review has not been provided."); // Throw an error if no review is provided
  }

  try { // Start a try-catch block for error handling
    const docRef = doc(collection(db, "restaurants"), restaurantId); // Get a reference to the restaurant document
    const newRatingDocument = doc( // Get a reference for a new rating document in the ratings subcollection
      collection(db, `restaurants/${restaurantId}/ratings`)
    );

    // corrected line
    await runTransaction(db, transaction => // Run a Firestore transaction
      updateWithRating(transaction, docRef, newRatingDocument, review) // Call the private function to update ratings within the transaction
    );
  } catch (error) { // Catch any errors that occur during the transaction
    console.error( // Log an error message to the console
      "There was an error adding the rating to the restaurant",
      error
    );
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Function to apply filtering and sorting to a Firestore query
function applyQueryFilters(q, { category, city, price, sort }) {
  // Check if category filter is provided
  if (category) {
    // Add where clause to filter by category field
    q = query(q, where("category", "==", category));
  }
  // Check if city filter is provided
  if (city) {
    // Add where clause to filter by city field
    q = query(q, where("city", "==", city));
  }
  // Check if price filter is provided
  if (price) {
    // Add where clause to filter by price (using length of price string as numeric value)
    q = query(q, where("price", "==", price.length));
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

// Export async function to get restaurants from Firestore with optional filtering
export async function getRestaurants(db = db, filters = {}) {
  // Create base query for the restaurants collection
  let q = query(collection(db, "restaurants"));

  // Apply any provided filters and sorting to the query
  q = applyQueryFilters(q, filters);
  // Execute the query and get the results
  const results = await getDocs(q);
  // Map the results to return formatted restaurant objects
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

// Export function to listen for real-time updates to restaurants collection
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Validate that callback parameter is a function
  if (typeof cb !== "function") {
    // Log error message if callback is not a function
    console.log("Error: The callback parameter is not a function");
    // Exit early if invalid callback
    return;
  }

  // Create base query for the restaurants collection
  let q = query(collection(db, "restaurants"));
  // Apply any provided filters and sorting to the query
  q = applyQueryFilters(q, filters);

  // Set up real-time listener on the query
  return onSnapshot(q, (querySnapshot) => {
    // Map the snapshot results to formatted restaurant objects
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

// Export async function to get a specific restaurant by its ID
export async function getRestaurantById(db, restaurantId) {
  // Validate that a restaurant ID was provided
  if (!restaurantId) {
    // Log error message for invalid ID
    console.log("Error: Invalid ID received: ", restaurantId);
    // Exit early if no valid ID
    return;
  }
  // Get reference to the specific restaurant document
  const docRef = doc(db, "restaurants", restaurantId);
  // Fetch the document snapshot
  const docSnap = await getDoc(docRef);
  // Return formatted restaurant object with converted timestamp
  return {
    ...docSnap.data(), // Spread all document fields
    timestamp: docSnap.data().timestamp.toDate(), // Convert Firestore timestamp to JavaScript Date
  };
}

// Export function to listen for real-time updates to a specific restaurant
export function getRestaurantSnapshotById(restaurantId, cb) {
  // Get reference to the specific restaurant document
  const docRef = doc(db, "restaurants", restaurantId);
  // Set up real-time listener on the document
  return onSnapshot(docRef, (docSnap) => {
    // Call the provided callback function with the document data
    cb(docSnap.data());
  });
}

// Export async function to get all reviews for a specific restaurant
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Validate that a restaurant ID was provided
  if (!restaurantId) {
    // Log error message for invalid restaurant ID
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    // Exit early if no valid ID
    return;
  }

  // Create query for the ratings subcollection within the specific restaurant
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"), // Path to ratings subcollection
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

// Export function to listen for real-time updates to reviews for a specific restaurant
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Validate that a restaurant ID was provided
  if (!restaurantId) {
    // Log error message for invalid restaurant ID
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    // Exit early if no valid ID
    return;
  }

  // Create query for the ratings subcollection within the specific restaurant
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"), // Path to ratings subcollection
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

// Export async function to add fake restaurants and reviews to Firestore for testing
export async function addFakeRestaurantsAndReviews() {
  // Generate fake restaurant and review data using the utility function
  const data = await generateFakeRestaurantsAndReviews();
  // Loop through each restaurant and its associated ratings data
  for (const { restaurantData, ratingsData } of data) {
    // Try to add restaurant and rating data to Firestore
    try {
      // Add the restaurant document to the restaurants collection
      const docRef = await addDoc(
        collection(db, "restaurants"), // Reference to restaurants collection
        restaurantData // Restaurant data object to store
      );

      // Loop through each rating for this restaurant
      for (const ratingData of ratingsData) {
        // Add each rating document to the ratings subcollection
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"), // Path to ratings subcollection
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
