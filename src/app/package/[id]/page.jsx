import Package from "@/src/components/Package.jsx";
import { Suspense } from "react";
import { getPackageById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { getFirestore } from "firebase/firestore";

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
