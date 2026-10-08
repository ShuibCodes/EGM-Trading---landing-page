import { ChatProvider } from "@/components/Chat";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Stock } from "@/components/Stock";
import { Sell } from "@/components/Sell";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <ChatProvider>
      <Nav />
      <main id="top">
        <Hero />
        <Stock />
        <Sell />
      </main>
      <Footer />
    </ChatProvider>
  );
}
