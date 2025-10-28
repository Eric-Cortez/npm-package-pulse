// import React from "react";
import renderStars from "@/src/components/Stars.jsx";
// functional component to display a single review
export function Review({ rating, text, timestamp }) {
  // return JSX to display review
  return (
    <li className="review__item">
      <ul className="package__rating">{renderStars(rating)}</ul>
      <p>{text}</p>

      <time>
        {new Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
        }).format(timestamp)}
      </time>
    </li>
  );
}
// skeleton loader for review
export function ReviewSkeleton() {
  // return a skeleton loader for review
  return (
    <li className="review__item">
      <div className="package__rating">
        <div
          style={{
            height: "2rem",
            backgroundColor: "rgb(156 163 175)",
            width: "10rem",
          }}
        ></div>
      </div>
      <div
        style={{
          height: "19px",
          backgroundColor: "rgb(156 163 175)",
          width: "12rem",
        }}
      ></div>
      <p>{"   "}</p>
    </li>
  );
}
