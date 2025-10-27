"use client";

// This components handles the package listings page
// It receives data from src/app/page.jsx, such as the initial packages and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getPackagesSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

const PackageItem = ({ myPackage }) => (
  <li key={myPackage.id}>
    <Link href={`/package/${myPackage.id}`}>
      <ActivePackage myPackage={myPackage} />
    </Link>
  </li>
);

const ActivePackage = ({ myPackage }) => (
  <div>
    <ImageCover photo={myPackage.photo} name={myPackage.name} />
    <PackageDetails myPackage={myPackage} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const PackageDetails = ({ myPackage }) => (
  <div className="package__details">
    <h2>{myPackage.name}</h2>
    <PackageRating myPackage={myPackage} />
    <PackageMetadata myPackage={myPackage} />
  </div>
);

const PackageRating = ({ myPackage }) => (
  <div className="package__rating">
    <ul>{renderStars(myPackage.avgRating)}</ul>
    <span>({myPackage.numRatings})</span>
  </div>
);

const PackageMetadata = ({ myPackage }) => (
  <div className="package__meta">
    <p>
      {myPackage.category}
    </p>
  </div>
);

export default function PackageListings({
  initialPackages,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    category: searchParams.category || "",
    sort: searchParams.sort || "",
  };

  const [packages, setPackages] = useState(initialPackages);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getPackagesSnapshot((data) => {
      setPackages(data);
    }, filters);
  }, [filters]);

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

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
