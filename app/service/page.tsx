"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function Service() {
  const [scrollY, setScrollY] = useState(0);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
        }
      });
    }, observerOptions);

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  // Parallax effect for images
  useEffect(() => {
    const handleParallax = () => {
      imagesRef.current.forEach((imageContainer) => {
        if (imageContainer) {
          const rect = imageContainer.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const isInViewport = rect.top < windowHeight && rect.bottom > 0;
          
          if (isInViewport) {
            // Calculate parallax offset based on scroll position
            const parallaxSpeed = 0.2;
            const elementCenter = rect.top + rect.height / 2;
            const windowCenter = windowHeight / 2;
            const distanceFromCenter = elementCenter - windowCenter;
            const offset = distanceFromCenter * parallaxSpeed;
            
            const image = imageContainer.querySelector("img");
            if (image) {
              image.style.transform = `translateY(${offset}px)`;
            }
          }
        }
      });
    };

    handleParallax();
    window.addEventListener("scroll", handleParallax, { passive: true });
    return () => window.removeEventListener("scroll", handleParallax);
  }, []);
  return (
    <main className="bg-white">
      {/* Main Hero Section - Two Column Layout */}
      <section 
        ref={(el) => (sectionsRef.current[0] = el)}
        className="flex items-center pt-12 pb-20 md:pt-16 md:pb-32 opacity-0 transition-opacity duration-1000"
      >
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column - Promotional Content */}
            <div className="space-y-8">
              {/* Service Badge */}
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-700 bg-white">
                  service
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-6xl font-normal text-black leading-tight">
                Your Gateway to Authentic Luxury Street & Fashion.
              </h1>

              {/* Description */}
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                The definitive platform for the greatest products from the past, present and future. 100% Authentic. Real-time Tracking. 24/7 Support.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="group relative inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 md:px-8 md:py-4 font-semibold hover:bg-gray-900 transition-colors"
                >
                  Shop New Arrivals
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
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
                </Link>
                <Link
                  href="/service"
                  className="inline-flex items-center justify-center gap-2 bg-white text-black border-2 border-black px-6 py-3 md:px-8 md:py-4 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Our Services
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/service/verified.svg"
                    alt="Verified"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/service/fast.svg"
                    alt="Fast Shipping"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">Fast Shipping</span>
                </div>
              </div>
            </div>

            {/* Right Column - Product Display */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="relative w-[700px] h-[850px] flex-shrink-0">
                {/* Black Border Frame */}
                <div className="absolute top-0 left-0 w-full h-full border border-black" />
                
                {/* Product Image */}
                <div 
                  ref={(el) => (imagesRef.current[0] = el)}
                  className="absolute top-[18px] left-[18px] w-[calc(100%_-_36px)] h-[814px] overflow-hidden"
                >
                  <Image
                    src="/images/service/hero-1.jpeg"
                    alt="Luxury Street Fashion Product"
                    fill
                    className="object-cover transition-transform duration-300 ease-out"
                    sizes="(max-width: 700px) 100vw, 664px"
                    unoptimized
                  />
                </div>

                {/* Live Stock Badge - Top Right */}
                <div className="absolute top-[38px] right-[38px] z-10">
                  <span className="inline-block bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full text-xs font-medium border border-red-500/30">
                    Live Stock
                  </span>
                </div>

                {/* THE DROP Title - Bottom Left */}
                <div className="absolute bottom-[70px] left-[42px] z-10">
                  <h2 className="text-7xl font-light text-black leading-tight mb-3">THE DROP</h2>
                  <p className="text-2xl font-light text-black">Latest Arrivals / Footwear / Apparel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Lab Section - Two Column Layout */}
      <section 
        ref={(el) => (sectionsRef.current[1] = el)}
        className="py-20 md:py-32 bg-white opacity-0 transition-opacity duration-1000"
      >
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column - Image with Border */}
            <div className="w-full flex justify-center lg:justify-start">
              <div className="relative w-[700px] h-[850px] flex-shrink-0">
                {/* Black Border Frame */}
                <div className="absolute top-0 left-0 w-full h-full border border-black" />
                
                {/* Product Image */}
                <div 
                  ref={(el) => (imagesRef.current[1] = el)}
                  className="absolute top-[18px] left-[18px] w-[calc(100%_-_36px)] h-[814px] overflow-hidden"
                >
                  <Image
                    src="/images/service/hero-2.jpeg"
                    alt="Authentication Lab Product"
                    fill
                    className="object-cover transition-transform duration-300 ease-out"
                    sizes="(max-width: 700px) 100vw, 664px"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-8">
              {/* Service Badge */}
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-black text-xs font-medium text-black bg-white">
                  service
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black leading-tight">
                Authentication Lab
                <br />
                Precision Checks for True
                <br />
                Originals.
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                Every item is rigorously inspected by our team of expert authenticators. We guarantee 100% originality or 3x your money back.
              </p>

              {/* Bullet Points */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Multi-point Verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">AI-Powered Analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">100% Original Guarantee</span>
                </li>
              </ul>

              {/* More Info Button */}
              <Link
                href="/service"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 md:px-8 md:py-4 font-semibold hover:bg-gray-900 transition-colors rounded-lg"
              >
                More Info
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Tracking Section - Two Column Layout */}
      <section 
        ref={(el) => (sectionsRef.current[2] = el)}
        className="py-20 md:py-32 bg-white opacity-0 transition-opacity duration-1000"
      >
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Service Badge */}
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-black text-xs font-medium text-black bg-white">
                  service
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black leading-tight">
                REAL-TIME TRACKING
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                Track your grail from our warehouse to your doorstep with live GPS updates and instant push notifications.
              </p>

              {/* Bullet Points */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Live GPS Map View</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Instant SMS Updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Estimated Delivery Window</span>
                </li>
              </ul>

              {/* More Info Button */}
              <Link
                href="/service"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 md:px-8 md:py-4 font-semibold hover:bg-gray-900 transition-colors rounded-lg"
              >
                More Info
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
              </Link>
            </div>

            {/* Right Column - Image with Border */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="relative w-[700px] h-[850px] flex-shrink-0">
                {/* Black Border Frame */}
                <div className="absolute top-0 left-0 w-full h-full border border-black" />
                
                {/* Product Image */}
                <div 
                  ref={(el) => (imagesRef.current[2] = el)}
                  className="absolute top-[18px] left-[18px] w-[calc(100%_-_36px)] h-[814px] overflow-hidden"
                >
                  <Image
                    src="/images/service/hero-3.jpeg"
                    alt="Real-Time Tracking Technology"
                    fill
                    className="object-cover transition-transform duration-300 ease-out"
                    sizes="(max-width: 700px) 100vw, 664px"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 24/7 Concierge Section - Two Column Layout */}
      <section 
        ref={(el) => (sectionsRef.current[3] = el)}
        className="py-20 md:py-32 bg-white opacity-0 transition-opacity duration-1000"
      >
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column - Image with Border */}
            <div className="w-full flex justify-center lg:justify-start">
              <div className="relative w-[700px] h-[850px] flex-shrink-0">
                {/* Black Border Frame */}
                <div className="absolute top-0 left-0 w-full h-full border border-black" />
                
                {/* Product Image */}
                <div 
                  ref={(el) => (imagesRef.current[3] = el)}
                  className="absolute top-[18px] left-[18px] w-[calc(100%_-_36px)] h-[814px] overflow-hidden"
                >
                  <Image
                    src="/images/service/hero-4.png"
                    alt="24/7 Concierge Support"
                    fill
                    className="object-cover transition-transform duration-300 ease-out"
                    sizes="(max-width: 700px) 100vw, 664px"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-8">
              {/* Service Badge */}
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-black text-xs font-medium text-black bg-white">
                  service
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black leading-tight">
                24/7 Concierge Always Here for Your Exclusive Needs
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                Our dedicated support team is available round-the-clock to assist with sizing, order status, and styling advice.
              </p>

              {/* Bullet Points */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Instant Chat Response</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Personal Styling Advice</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Global Language Support</span>
                </li>
              </ul>

              {/* More Info Button */}
              <Link
                href="/service"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 md:px-8 md:py-4 font-semibold hover:bg-gray-900 transition-colors rounded-lg"
              >
                More Info
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Sourcing Section - Two Column Layout */}
      <section 
        ref={(el) => (sectionsRef.current[4] = el)}
        className="py-20 md:py-32 bg-white opacity-0 transition-opacity duration-1000"
      >
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Service Badge */}
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-black text-xs font-medium text-black bg-white">
                  service
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black leading-tight">
                GLOBAL SOURCING
                <br />
                Authentic Finds Worldwide
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                Can&apos;t find what you&apos;re looking for? Our sourcing network spans Tokyo, NYC, Paris, and Milan to find rare exclusives.
              </p>

              {/* Bullet Points */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Rare Sneaker Requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Archive Apparel Access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Exclusive Drop Reservations</span>
                  </li>
              </ul>

              {/* More Info Button */}
              <Link
                href="/service"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 md:px-8 md:py-4 font-semibold hover:bg-gray-900 transition-colors rounded-lg"
              >
                More Info
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
              </Link>
            </div>

            {/* Right Column - Image with Border */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="relative w-[700px] h-[850px] flex-shrink-0">
                {/* Black Border Frame */}
                <div className="absolute top-0 left-0 w-full h-full border border-black" />
                
                {/* Product Image */}
                <div 
                  ref={(el) => (imagesRef.current[4] = el)}
                  className="absolute top-[18px] left-[18px] w-[calc(100%_-_36px)] h-[814px] overflow-hidden"
                >
                  <Image
                    src="https://plus.unsplash.com/premium_photo-1712254285267-8dfd7510c9de?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Global Sourcing Network"
                    fill
                    className="object-cover transition-transform duration-300 ease-out"
                    sizes="(max-width: 700px) 100vw, 664px"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secure Vault Section - Two Column Layout */}
      <section 
        ref={(el) => (sectionsRef.current[5] = el)}
        className="py-20 md:py-32 bg-white opacity-0 transition-opacity duration-1000"
      >
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column - Image with Border */}
            <div className="w-full flex justify-center lg:justify-start">
              <div className="relative w-[700px] h-[850px] flex-shrink-0">
                {/* Black Border Frame */}
                <div className="absolute top-0 left-0 w-full h-full border border-black" />
                
                {/* Product Image */}
                <div 
                  ref={(el) => (imagesRef.current[5] = el)}
                  className="absolute top-[18px] left-[18px] w-[calc(100%_-_36px)] h-[814px] overflow-hidden"
                >
                  <Image
                    src="/images/service/hero-6.png"
                    alt="Secure Vault Protection"
                    fill
                    className="object-cover transition-transform duration-300 ease-out"
                    sizes="(max-width: 700px) 100vw, 664px"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-8">
              {/* Service Badge */}
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-black text-xs font-medium text-black bg-white">
                  service
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black leading-tight">
                SECURE VAULT
                <br />
                Protection You Can Trust
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                Transactions are protected by bank-level encryption. Your data and payment details are never compromised.
              </p>

              {/* Bullet Points */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Encrypted Payment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Fraud Detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base md:text-lg font-medium text-black">Anonymous Buying Options</span>
                </li>
              </ul>

              {/* More Info Button */}
              <Link
                href="/service"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 md:px-8 md:py-4 font-semibold hover:bg-gray-900 transition-colors rounded-lg"
              >
                More Info
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </main>
  );
}

