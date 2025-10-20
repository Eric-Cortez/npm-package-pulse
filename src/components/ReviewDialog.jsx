"use client"; // Directive for Next.js to render this component on the client-side

// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

import { useEffect, useLayoutEffect, useRef } from "react"; // Importing necessary hooks from React
import RatingPicker from "@/src/components/RatingPicker.jsx"; // Importing the RatingPicker component
import { handleReviewFormSubmission } from "@/src/app/actions.js"; // Importing the server action for form submission

// Functional component for the review dialog
const ReviewDialog = ({
  isOpen, // Prop to control if the dialog is open
  handleClose, // Prop function to close the dialog
  review, // Prop object containing review data
  onChange, // Prop function to handle changes in the review form
  userId, // Prop for the user's ID
  id, // Prop for the restaurant's ID
}) => {
  const dialog = useRef(); // Creating a ref for the dialog element

  // Effect to handle showing and closing the modal dialog
  useLayoutEffect(() => {
    if (isOpen) {
      dialog.current.showModal(); // Show the modal dialog
    } else {
      dialog.current.close(); // Close the modal dialog
    }
  }, [isOpen, dialog]); // Dependency array for the effect

  // Function to handle clicks outside the modal to close it
  const handleClick = (e) => {
    // close if clicked outside the modal
    if (e.target === dialog.current) {
      handleClose(); // Call the handleClose function
    }
  };

  // JSX for the component
  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form
        action={handleReviewFormSubmission} // Server action to handle form submission
        onSubmit={() => {
          handleClose(); // Close the dialog
        }}
      >
        <header>
          <h3>Add your review</h3>
        </header>
        <article>
          <RatingPicker /> {/* Rating picker component */}
          <p>
            <input
              type="text" // Input type text
              name="text" // Name of the input
              id="review" // ID of the input
              placeholder="Write your thoughts here" // Placeholder text
              required // Makes the input required
              value={review.text} // Value of the input from props
              onChange={(e) => onChange(e.target.value, "text")} // onChange handler
            />
          </p>
          <input type="hidden" name="restaurantId" value={id} />{" "}
          {/* Hidden input for restaurant ID */}
          <input type="hidden" name="userId" value={userId} />{" "}
          {/* Hidden input for user ID */}
        </article>
        <footer>
          <menu>
            <button
              autoFocus // Autofocus on this button
              type="reset" // Button type reset
              onClick={handleClose} // onClick handler to close the dialog
              className="button--cancel" // CSS class for styling
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

export default ReviewDialog; // Exporting the component
