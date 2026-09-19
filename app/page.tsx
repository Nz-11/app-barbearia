import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollVideoHero } from "@/components/hero/ScrollVideoHero";
import { Services } from "@/components/sections/Services";
import { Barbers } from "@/components/sections/Barbers";
import { Gallery } from "@/components/sections/Gallery";
import { About } from "@/components/sections/About";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <ScrollVideoHero />
        <Services />
        <Barbers />
        <Gallery />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
