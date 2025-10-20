// Import the RestaurantListings component to display the list of restaurants
import RestaurantListings from "@/src/components/RestaurantListings.jsx";
// Import the getRestaurants function to fetch restaurant data from Firestore
import { getRestaurants } from "@/src/lib/firebase/firestore.js";
// Import function to get authenticated Firebase app instance for server-side operations
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import getFirestore to create a Firestore database instance
import { getFirestore } from "firebase/firestore";

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it

// Export dynamic configuration to force server-side rendering for every request
export const dynamic = "force-dynamic";

// This line also forces this route to be server-side rendered
// export const revalidate = 0;

// Default export function that serves as the Home page component
// Takes props parameter which contains Next.js page properties
export default async function Home(props) {
  // Await the searchParams from props to access URL query parameters
  const searchParams = await props.searchParams;
  // Using seachParams which Next.js provides, allows the filtering to happen on the server-side, for example:
  // ?city=London&category=Indian&sort=Review

  // Get the authenticated Firebase server app instance for server-side operations
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Fetch restaurants from Firestore using the server app and search parameters
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp), // Create Firestore instance from server app
    searchParams // Pass search parameters for filtering
  );

  // Return JSX that renders the main home page content
  return (
    <main className="main__home">
      <RestaurantListings
        initialRestaurants={restaurants}
        searchParams={searchParams}
      />
    </main>
  );
}
