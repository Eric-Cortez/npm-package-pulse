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
    <section className="img__section">
      <img src={myPackage.photo} alt={myPackage.name} />

      <div className="actions">
        {userId && (
          <img
            alt="review"
            className="review"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            src="/review.svg"
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

      <div className="details__container">
        <div className="details">
          <h2>{myPackage.name}</h2>

          <div className="package__rating">
            <ul>{renderStars(myPackage.avgRating)}</ul>

            <span>({myPackage.numRatings})</span>
          </div>

          <p>
            {myPackage.category}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default PackageDetails;
