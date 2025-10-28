"use client";

// This components handles the package listings page
// It receives data from src/app/page.jsx, such as the initial packages and search params from the URL
// import next components
import Link from "next/link";
// import react and hooks
import { React, useState, useEffect } from "react";
// import next router
import { useRouter } from "next/navigation";
// import renderStars
import renderStars from "@/src/components/Stars.jsx";
// import firestore functions
import { getPackagesSnapshot } from "@/src/lib/firebase/firestore.js";
// import Filters component
import Filters from "@/src/components/Filters.jsx";
// component PackageItem
const PackageItem = ({ myPackage }) => (
  <li key={myPackage.id}>
    <Link href={`/package/${myPackage.id}`}>
      <ActivePackage myPackage={myPackage} />
    </Link>
  </li>
);
// component ActivePackage
const ActivePackage = ({ myPackage }) => (
  <div>
    <ImageCover photo={myPackage.photo} name={myPackage.name} />
    <PackageDetails myPackage={myPackage} />
  </div>
);
//  component ImageCover
const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);
// component PackageDetails
const PackageDetails = ({ myPackage }) => (
  <div className="package__details">
    <h2>{myPackage.name}</h2>
    <PackageRating myPackage={myPackage} />
    <PackageMetadata myPackage={myPackage} />
  </div>
);
// component PackageRating
const PackageRating = ({ myPackage }) => (
  <div className="package__rating">
    <ul>{renderStars(myPackage.avgRating)}</ul>
    <span>({myPackage.numRatings})</span>
  </div>
);
// component PackageMetadata
const PackageMetadata = ({ myPackage }) => (
  <div className="package__meta">
    <p>
      {myPackage.category}
    </p>
  </div>
);
// main component PackageListings
export default function PackageListings({
  initialPackages,
  searchParams,
}) {
  // next router
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    category: searchParams.category || "",
    sort: searchParams.sort || "",
  };
  // state for packages and filters
  const [packages, setPackages] = useState(initialPackages);
  const [filters, setFilters] = useState(initialFilters);
  // useEffect to update URL and get packages based on filters
  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);
  // useEffect to get real-time updates of packages based on filters
  useEffect(() => {
    return getPackagesSnapshot((data) => {
      setPackages(data);
    }, filters);
  }, [filters]);
  // render package listings
  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="packages">
        {packages.map((myPackage) => (
          <PackageItem key={myPackage.id} myPackage={myPackage} />
        ))}
      </ul>
    </article>
  );
}
// function to update router with filters
function routerWithFilters(router, filters) {
  // create query params
  const queryParams = new URLSearchParams();
  // append filters to query params
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }
  // push new URL to router
  const queryString = queryParams.toString();
  // update router
  router.push(`?${queryString}`);
}
