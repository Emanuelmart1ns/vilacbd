import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import ChatWidget from "@/components/ChatWidget";
import { headers } from "next/headers";
import ConstructionBanner from "@/components/ConstructionBanner";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vila CBD | A melhor seleção CBD em Santa Maria da Feira",
  description: "Descubra a melhor seleção de produtos CBD premium em Santa Maria da Feira. Óleos, flores, gomas e cosmética com qualidade certificada em laboratório.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  
  // More inclusive check for the main domain while excluding development/preview environments
  const isProductionDomain = host.includes("vilacbd") && 
                             !host.includes("vercel.app") && 
                             !host.includes("localhost") && 
                             !host.includes("127.0.0.1");

  return (
    <html lang="pt">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AuthProvider>
          <CartProvider>
            {isProductionDomain ? (
              <ConstructionBanner />
            ) : (
              <>
                <AgeGate>
                  {children}
                  <Footer />
                </AgeGate>
                <CartSidebar />
                <ChatWidget />
              </>
            )}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
