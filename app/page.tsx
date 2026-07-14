import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { ContentSections } from "@/features/home/content-sections";
import { HeroSection } from "@/features/home/hero-section";
import { GallerySection } from "@/features/gallery/gallery-section";
import { RegistrationSection } from "@/features/registration/registration-section";
import { getGalleryImages, getUpcomingClass } from "@/lib/data";

export default async function HomePage() {
  const [eventClass, images] = await Promise.all([
    getUpcomingClass(),
    getGalleryImages()
  ]);

  return (
    <main>
      <Navbar />
      <HeroSection eventClass={eventClass} />
      <ContentSections />
      <RegistrationSection eventClass={eventClass} />
      <GallerySection images={images} />
      <Footer />
    </main>
  );
}
