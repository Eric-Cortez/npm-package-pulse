import { gemini20Flash, googleAI } from "@genkit-ai/googleai"; // Importing Gemini AI models and plugins
import { genkit } from "genkit"; // Importing the Genkit library for AI integration
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js"; // Importing function to get reviews from Firestore
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp"; // Importing function to get authenticated Firebase app
import { getFirestore } from "firebase/firestore"; // Importing Firestore instance

// Async component to generate a summary of reviews using Gemini AI
export async function GeminiSummary({ restaurantId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser(); // Getting the authenticated Firebase app for the user
  const reviews = await getReviewsByRestaurantId(
    // Fetching reviews for the given restaurant ID
    getFirestore(firebaseServerApp), // Passing the Firestore instance
    restaurantId // Passing the restaurant ID
  );

  const reviewSeparator = "@"; // Defining a separator for joining review texts
  const prompt = ` // Creating a prompt for the AI model
    Based on the following restaurant reviews,
    where each review is separated by a '${reviewSeparator}' character,
    create a one-sentence summary of what people think of the restaurant.

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    // Starting a try-catch block for error handling
    if (!process.env.GEMINI_API_KEY) {
      // Checking if the Gemini API key is set in environment variables
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://firebase.google.com/docs/genkit/get-started
      throw new Error( // Throwing an error if the API key is not set
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance.
    const ai = genkit({
      // Initializing Genkit with plugins and a model
      plugins: [googleAI()], // Using the Google AI plugin
      model: gemini20Flash, // Setting the default model to Gemini 2.0 Flash
    });
    const { text } = await ai.generate(prompt); // Generating the summary text using the AI model

    return (
      // Returning the JSX for the summary
      <div className="restaurant__review_summary">
        <p>{text}</p> {/* Displaying the generated summary text */}
        <p>✨ Summarized with Gemini</p> {/* Attribution to Gemini */}
      </div>
    );
  } catch (e) {
    // Catching any errors that occur
    console.error(e); // Logging the error to the console
    return <p>Error summarizing reviews.</p>; // Returning an error message
  }
}

// Component to show a loading skeleton while the summary is being generated
export function GeminiSummarySkeleton() {
  return (
    // Returning the JSX for the skeleton
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p> {/* Loading message */}
    </div>
  );
}
