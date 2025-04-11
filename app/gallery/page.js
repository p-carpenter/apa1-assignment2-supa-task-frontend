"use client";

import { Suspense } from "react";
import GalleryPageContent from "./GalleryNavigator";

/**
 * Gallery page component with Suspense for loading state
 * Wraps the main GalleryPageContent in a Suspense boundary
 */
const Gallery = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryPageContent />
    </Suspense>
  );
};

export default Gallery;
