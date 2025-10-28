"use client";
// import react and hooks
import React, { useState, useEffect } from "react";
// import firestore functions
import { getReviewsSnapshotByPackageId } from "@/src/lib/firebase/firestore.js";
// import Review component
import { Review } from "@/src/components/Reviews/Review";
// function component ReviewsListClient
export default function ReviewsListClient({
  initialReviews,
  packageId,
  userId,
}) {
  // state for reviews
  const [reviews, setReviews] = useState(initialReviews);
  // useEffect to get real-time updates
  useEffect(() => {
    return getReviewsSnapshotByPackageId(packageId, (data) => {
      setReviews(data);
    });
  }, [packageId]);

  // render reviews
  return (
    <article>
      <ul className="reviews">
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review) => (
              <Review
                key={review.id}
                rating={review.rating}
                text={review.text}
                timestamp={review.timestamp}
              />
            ))}
          </ul>
        ) : (
          <p>
            This package has not been reviewed yet,{" "}
            {!userId ? "first login and then" : ""} add your own review!
          </p>
        )}
      </ul>
    </article>
  );
}
