import React from 'react';

const ImageSkeleton = () => {
  return (
    <div className="bg-white border animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 h-8 sm:h-9 bg-gray-200"></div>
          <div className="flex-1 h-8 sm:h-9 bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};

const InputSkeleton = () => {
  return (
    <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 border border-gray-700">
      <div className="mb-4 sm:mb-6">
        <div className="w-full h-24 sm:h-28 bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="w-full h-12 sm:h-14 bg-gray-600 rounded animate-pulse"></div>
    </div>
  );
};

const HeaderSkeleton = () => {
  return (
    <header className="text-center mb-6 sm:mb-8 lg:mb-12">
      <div className="h-8 sm:h-10 lg:h-12 xl:h-14 bg-gray-700 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
      <div className="h-4 sm:h-5 lg:h-6 bg-gray-600 rounded w-1/2 mx-auto animate-pulse"></div>
    </header>
  );
};

const SkeletonLoader = ({ type = 'image' }) => {
  const skeletons = {
    image: <ImageSkeleton />,
    input: <InputSkeleton />,
    header: <HeaderSkeleton />
  };

  return skeletons[type] || skeletons.image;
};

export { ImageSkeleton, InputSkeleton, HeaderSkeleton, SkeletonLoader };
