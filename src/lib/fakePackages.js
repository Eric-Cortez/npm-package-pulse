// import necessary utilities and data
import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";
// import Timestamp from Firebase Firestore
import { Timestamp } from "firebase/firestore";
// function to generate fake packages and reviews
export async function generateFakePackagesAndReviews() {
  // number of packages to add
  const packagesToAdd = 3;
  // array to hold generated data
  const data = [];
  // loop to create each package
  for (let i = 0; i < packagesToAdd; i++) {
    const packageTimestamp = Timestamp.fromDate(getRandomDateBefore());
    // array to hold ratings for the package
    const ratingsData = [];

    // Generate a random number of ratings/reviews for this package
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(packageTimestamp.toDate())
      );
      // create individual rating data
      const ratingData = {
        rating:
          randomData.packageReviews[
            randomNumberBetween(0, randomData.packageReviews.length - 1)
          ].rating,
        text: randomData.packageReviews[
          randomNumberBetween(0, randomData.packageReviews.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      ratingsData.push(ratingData);
    }
    // calculate average rating for the package
    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    // select a random package from the random data
    const selectedPackage = randomData.packages[
      randomNumberBetween(0, randomData.packages.length - 1)
    ];
    // create package data object
    const packageData = {
      category: selectedPackage.category,
      name: selectedPackage.name,
      avgRating,
      numRatings: ratingsData.length,
      sumRating: ratingsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      photo: selectedPackage.photo,
      timestamp: packageTimestamp,
    };
      // push package and its ratings to the data array
    data.push({
      packageData,
      ratingsData,
    });
  }

  // return the generated data
  return data;
}
