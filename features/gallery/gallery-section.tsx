"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { GalleryImage } from "@/types";

export function GallerySection({ images }: { images: GalleryImage[] }) {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) {
    return null;
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <section id="gallery" className="py-20">
      <div className="container">
        <p className="text-sm uppercase tracking-[0.3em] text-secondary">Gallery</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="section-title max-w-2xl">Previous workshop moments, loaded directly from your gallery folder.</h2>
        </div>
        <Dialog>
          <div className="relative mt-12 overflow-hidden rounded-[28px] border border-primary/10 bg-white shadow-panel">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((image) => (
                <div key={image.id} className="w-full shrink-0">
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className="group relative block w-full"
                    >
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          unoptimized
                          sizes="100vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
                    </button>
                  </DialogTrigger>
                </div>
              ))}
            </div>

            <button
              type="button"
              aria-label="Previous image"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-white/85 p-3 text-primary shadow-lg transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Next image"
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-white/85 p-3 text-primary shadow-lg transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={`Go to image ${index + 1}`}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2.5 rounded-full transition ${
                    index === currentIndex ? "w-8 bg-white" : "w-2.5 bg-white/55"
                  }`}
                />
              ))}
            </div>
          </div>
          <DialogContent className="border-none bg-transparent p-0 shadow-none">
            {activeImage ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[28px]">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  unoptimized
                  sizes="92vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
