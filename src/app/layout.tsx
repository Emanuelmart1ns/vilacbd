import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vila Cãnhamo | A melhor seleção de Cãnhamo em Santa Maria da Feira",
  description: "Descubra a melhor seleção de produtos de cãnhamo premium em Santa Maria da Feira. Óleos, flores, gomas e cosmética com qualidade certificada em laboratório.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AuthProvider>
          <CartProvider>
            <AgeGate>
              {children}
              <Footer />
            </AgeGate>
            <CartSidebar />
            <ChatWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
