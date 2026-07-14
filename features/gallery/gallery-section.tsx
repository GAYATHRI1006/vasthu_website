"use client";

import { useState } from "react";
import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { GalleryImage } from "@/types";

export function GallerySection({ images }: { images: GalleryImage[] }) {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  if (!images.length) {
    return null;
  }

  return (
    <section id="gallery" className="py-20">
      <div className="container">
        <p className="text-sm uppercase tracking-[0.3em] text-secondary">Gallery</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="section-title max-w-2xl">Previous workshop moments, loaded directly from your gallery folder.</h2>
          <p className="max-w-lg text-sm leading-7 text-slate-600">
            Replace images in `public/images/gallery` and the carousel updates automatically.
          </p>
        </div>
        <Dialog>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={24}
            loop
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            breakpoints={{
              0: { slidesPerView: 1.1 },
              768: { slidesPerView: 2.1 },
              1280: { slidesPerView: 3 }
            }}
            className="mt-12 !overflow-visible"
          >
            {images.map((image) => (
              <SwiperSlide key={image.id}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className="group relative block overflow-hidden rounded-[28px] border border-primary/10 bg-white shadow-panel"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  </button>
                </DialogTrigger>
              </SwiperSlide>
            ))}
          </Swiper>
          <DialogContent className="border-none bg-transparent p-0 shadow-none">
            {activeImage ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[28px]">
                <Image src={activeImage.src} alt={activeImage.alt} fill className="object-cover" />
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
