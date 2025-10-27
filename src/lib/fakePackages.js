import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

export async function generateFakePackagesAndReviews() {
  const packagesToAdd = 3;
  const data = [];

  for (let i = 0; i < packagesToAdd; i++) {
    const packageTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate a random number of ratings/reviews for this package
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(packageTimestamp.toDate())
      );

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

    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;


    const selectedPackage = randomData.packages[
      randomNumberBetween(0, randomData.packages.length - 1)
    ]
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

    data.push({
      packageData,
      ratingsData,
    });
  }
  return data;
}
