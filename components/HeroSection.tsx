"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import TextFlip from "@/components/TextFlip";

export default function HeroSection() {
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch hero images from API
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch("/api/hero-images");
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          setHeroImages(data.images);
        }
      } catch (error) {
        console.error("Error fetching hero images:", error);
      }
    };

    fetchHeroImages();
  }, []);

  // Auto-rotate images
  useEffect(() => {
    if (heroImages.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        setIsTransitioning(false);
      }, 500); // Half of transition duration
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative text-white min-h-screen flex items-center overflow-hidden">
      {/* Background Images with Fade Transition */}
      <div className="absolute inset-0 z-0">
        {heroImages.length > 0 ? (
          heroImages.map((src, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={src}
                alt={`Fashion Background ${index + 1}`}
                fill
                className="object-cover object-top"
                style={{ objectPosition: 'center top' }}
                priority={index === 0}
                unoptimized
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
        )}
      </div>

      {/* Overlay untuk readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-0"></div>

      {/* Cloud Background Effect */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute top-20 right-10 w-64 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-32 w-48 h-24 bg-white rounded-full blur-2xl"></div>
        <div className="absolute top-40 left-20 w-56 h-28 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-10 py-16">
        <div className="flex items-center min-h-[80vh]">
          {/* Text Content */}
          <div className="space-y-6">
            {/* Exclusive Collection Badge */}
            <div className="inline-block">
              <span className="border-2 border-white text-white px-6 py-3 rounded-full text-base font-semibold bg-transparent">
                Exclusive Collection
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-normal leading-tight max-w-4xl flex flex-col gap-2 md:gap-3 lg:gap-4">
              <span className="whitespace-nowrap text-white flex items-baseline">
                <TextFlip 
                  text="" 
                  words={["PREMIUM", "EXCLUSIVE", "LUXURY", "ELITE"]}
                  duration={3000}
                  className="text-white"
                />
                <span className="ml-2">CLOTHS &</span>
              </span>
              <span className="whitespace-nowrap text-white">
                ACCESSORIES COLLECTION
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl font-light">
              Level up your fashion experience with up to 50% of top quality products & brand only for a limited time
            </p>

            {/* Explore Deals Button */}
            <Link
              href="/products"
              className="inline-flex items-center justify-between bg-white text-black pl-6 pr-2 h-[85px] rounded-full font-medium hover:bg-white/95 transition-all duration-200 mt-[2px] shadow-sm"
            >
              <span className="text-base">Explore more</span>
              <span className="bg-black text-white w-[70px] h-[70px] rounded-full flex items-center justify-center flex-shrink-0 ml-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

