"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    id: number;
    category: string;
    subCategory: string;
    headline: string;
    description: string;
    author: string;
    date: string;
    likes: number;
    comments: number;
    image: string;
    slug: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "backwards"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden",
        className
      )}
      style={{ maxWidth: '100vw' }}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item) => (
          <li
            className="w-[280px] max-w-full relative rounded-2xl flex-shrink-0 overflow-hidden group"
            key={item.id}
          >
            <Link href={item.slug.startsWith('/') ? item.slug : `/blog/${item.slug}`} className="block h-full">
              {/* Background Image */}
              <div className="relative h-[320px] w-full">
                <Image
                  src={item.image}
                  alt={item.headline}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                  {/* Top Content */}
                  <div className="flex-1 flex flex-col justify-end space-y-3 mb-12">
                    {/* Headline */}
                    <h1 className="text-2xl md:text-3xl font-normal text-white leading-tight">
                      {item.headline}
                    </h1>
                    
                    {/* Description */}
                    <p className="text-sm font-light text-white/90 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Bottom Button */}
                  <div className="w-full bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full font-medium hover:bg-white/30 transition-colors flex items-center justify-between group/btn cursor-pointer mt-auto">
                    <span className="self-start">Discover More</span>
                    <svg 
                      className="w-4 h-4 self-end group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

