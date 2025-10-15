"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    "/images/carousel-1.png",
    "/images/carousel-2.png",
    "/images/carousel-3.png",
    "/images/carousel-4.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={image}
              alt={`Carousel slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20"></div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/75"
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Title Overlay */}
      <div className="absolute bottom-20 left-8 z-30 text-white">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
          Make a Difference Today
        </h2>
        <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
          Your generosity changes lives
        </p>
      </div>
    </div>
  );
}