// This component handles the list of reviews for a given package
// import React from "react";
import React from "react";
// import necessary functions and components
import { getReviewsByPackageId } from "@/src/lib/firebase/firestore.js";
// import ReviewsListClient
import ReviewsListClient from "@/src/components/Reviews/ReviewsListClient";
// import Reviews list skeleton
import { ReviewSkeleton } from "@/src/components/Reviews/Review";
// import Firestore
import { getFirestore } from "firebase/firestore";
// import authenticated Firebase app for server
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
// main ReviewsList component
export default async function ReviewsList({ packageId, userId }) {
  // get authenticated Firebase app for server
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // fetch reviews for the given packageId
  const reviews = await getReviewsByPackageId(
    getFirestore(firebaseServerApp),
    packageId
  );
  // return the ReviewsListClient component with fetched reviews
  return (
    <ReviewsListClient
      initialReviews={reviews}
      packageId={packageId}
      userId={userId}
    />
  );
}
// skeleton loader for ReviewsList
export function ReviewsListSkeleton({ numReviews }) {
  // return skeleton loader for reviews list
  return (
    <article>
      <ul className="reviews">
        <ul>
          {Array(numReviews)
            .fill(0)
            .map((value, index) => (
              <ReviewSkeleton key={`loading-review-${index}`} />
            ))}
        </ul>
      </ul>
    </article>
  );
}
