"use client";

import { Suspense } from "react";
import GalleryPageContent from "./GalleryNavigator";

const Gallery = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryPageContent />
    </Suspense>
  );
};

export default Gallery;
