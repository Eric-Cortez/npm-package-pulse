// This is a Server Component
// It fetches the package data from Firestore

//import the Package component to display package details
import Package from "@/src/components/Package.jsx";
//import Suspense for handling loading states
import { Suspense } from "react";
//import function to get package data by ID from Firestore
import { getPackageById } from "@/src/lib/firebase/firestore.js";
//import functions to get authenticated Firebase app and user info
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
//import ReviewsList and GeminiSummary components for displaying reviews and summary
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
//import Suspense fallback component for GeminiSummary
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
//import Firestore function to interact with the database
import { getFirestore } from "firebase/firestore";
//default export async function for the package detail page
export default async function Home(props) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const myPackage = await getPackageById(
    getFirestore(firebaseServerApp),
    params.id
  );
  // Render the Package component with the fetched data
  return (
    <main className="main__package">
      <Package
        id={params.id}
        initialPackage={myPackage}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary packageId={params.id} />
        </Suspense>
      </Package>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={myPackage.numRatings} />}
      >
        <ReviewsList packageId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}
