/*
This file puts the landing page together from its sections, top to bottom.
Edit this file when sections are added, removed, or reordered.
Do not copy this file. Add new sections under src/sections and list them here.
*/

import { useLatestRelease } from "../features/release/useLatestRelease";
import { AppSection } from "../sections/AppSection";
import { Faq } from "../sections/Faq";
import { Features } from "../sections/Features";
import { Footer } from "../sections/Footer";
import { Hero } from "../sections/Hero";
import { HowItWorks } from "../sections/HowItWorks";
import { Install } from "../sections/Install";
import { Nav } from "../sections/Nav";
import { Privacy } from "../sections/Privacy";
import { TrySection } from "../sections/TrySection";

export function App() {
  const release = useLatestRelease();
  return (
    <>
      <Nav release={release} />
      <main>
        <Hero release={release} />
        <TrySection />
        <HowItWorks />
        <AppSection />
        <Features />
        <Privacy />
        <Install release={release} />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
