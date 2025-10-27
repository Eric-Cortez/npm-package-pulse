// This component shows package metadata, and offers some actions to the user like uploading a new package image, and adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const PackageDetails = ({
  myPackage,
  userId,
  handlePackageImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  return (
    <div className="review-page-container">
      <div className="review-page-content">
        <section className="img__section">
          <img src={myPackage.photo} alt={myPackage.name} />

          <div className="package__rating">
            <ul>{renderStars(myPackage.avgRating)}</ul>
            <span>({myPackage.numRatings})</span>
          </div>

          <div className="actions">
            {userId && (
              <img
                alt="review"
                className="reviews"
                onClick={() => {
                  setIsOpen(!isOpen);
                }}
                src="/reviews.svg"
              />
            )}
            <label
              onChange={(event) => handlePackageImage(event.target)}
              htmlFor="upload-image"
              className="add"
            >
              <input
                name=""
                type="file"
                id="upload-image"
                className="file-input hidden w-full h-full"
              />

              <img className="add-image" src="/add.svg" alt="Add image" />
            </label>
          </div>
        </section>

        <div className="details__container">
          <div className="package-header-details">
            <h2>{myPackage.name}</h2>
            <p>{myPackage.category}</p>
          </div>

          <div className="details package__review_summary">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
