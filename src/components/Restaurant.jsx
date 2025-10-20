"use client"; // Directive for Next.js to render this component on the client-side

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react"; // Importing necessary hooks and components from React
import dynamic from "next/dynamic"; // Importing dynamic from Next.js for lazy loading
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js"; // Importing function to get restaurant data from Firestore
import { useUser } from "@/src/lib/getUser"; // Importing custom hook to get user data
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx"; // Importing the RestaurantDetails component
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js"; // Importing function to update restaurant image in storage

const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx")); // Dynamically importing the ReviewDialog component for lazy loading

// Functional component for a single restaurant
export default function Restaurant({
  id, // Prop for the restaurant's ID
  initialRestaurant, // Prop for the initial restaurant data
  initialUserId, // Prop for the initial user ID
  children, // Prop for child components
}) {
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant); // State for restaurant details
  const [isOpen, setIsOpen] = useState(false); // State to control the review dialog

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId; // Getting the user ID from the custom hook or initial props
  const [review, setReview] = useState({
    // State for the review form
    rating: 0, // Initial rating
    text: "", // Initial review text
  });

  // Function to handle changes in the review form
  const onChange = (value, name) => {
    setReview({ ...review, [name]: value }); // Updating the review state
  };

  // Function to handle updating the restaurant image
  async function handleRestaurantImage(target) {
    const image = target.files ? target.files[0] : null; // Getting the image file from the input
    if (!image) {
      // If no image is selected
      return; // Exit the function
    }

    const imageURL = await updateRestaurantImage(id, image); // Calling the function to update the image in storage and get the URL
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL }); // Updating the restaurant details with the new image URL
  }

  // Function to handle closing the review dialog
  const handleClose = () => {
    setIsOpen(false); // Set the dialog to closed
    setReview({ rating: 0, text: "" }); // Reset the review form
  };

  // Effect to get real-time updates for the restaurant data
  useEffect(() => {
    return getRestaurantSnapshotById(id, (data) => {
      // Subscribing to restaurant data snapshots
      setRestaurantDetails(data); // Updating the restaurant details state with new data
    });
  }, [id]); // Dependency array for the effect

  // JSX for the component
  return (
    <>
      <RestaurantDetails
        restaurant={restaurantDetails} // Passing restaurant details to the RestaurantDetails component
        userId={userId} // Passing user ID to the RestaurantDetails component
        handleRestaurantImage={handleRestaurantImage} // Passing the image handler function
        setIsOpen={setIsOpen} // Passing the function to set the dialog state
        isOpen={isOpen} // Passing the dialog state
      >
        {children} {/* Rendering child components */}
      </RestaurantDetails>
      {userId && ( // If there is a user ID
        <Suspense fallback={<p>Loading...</p>}>
          {" "}
          {/* Suspense for lazy loading the ReviewDialog */}
          <ReviewDialog
            isOpen={isOpen} // Passing the dialog state
            handleClose={handleClose} // Passing the close handler function
            review={review} // Passing the review state
            onChange={onChange} // Passing the change handler function
            userId={userId} // Passing the user ID
            id={id} // Passing the restaurant ID
          />
        </Suspense>
      )}
    </>
  );
}
