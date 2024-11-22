import type { Metadata } from "next";
import localFont from "next/font/local";
import { AlertProvider } from './contexts/AlertContext';
import { AuthProvider } from "./contexts/AuthContext";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Camayenne - Votre guide local",
  description: "Découvrez Camayenne comme jamais auparavant avec notre application de géolocalisation interactive",
  keywords: "Camayenne, Conakry, Guinée, géolocalisation, carte, points d'intérêt, navigation",
  authors: [{ name: "Équipe Camayenne" }],
  openGraph: {
    title: "Camayenne - Votre guide local",
    description: "Découvrez Camayenne comme jamais auparavant",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""/>
          {/* favicon */}
          <link rel="icon" href="/3d-map.png" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
