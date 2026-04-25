import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vila Cãnhamo | A melhor seleção Cãnhamo em Santa Maria da Feira",
  description: "Descubra a melhor seleção de produtos Cãnhamo premium em Santa Maria da Feira. Óleos, flores, gomas e cosmética com qualidade certificada em laboratório.",
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
            {children}
            <CartSidebar />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
