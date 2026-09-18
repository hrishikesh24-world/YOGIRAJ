import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { getServerSession } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YOGIRAJ — Water Can Business",
  description: "Manage your water can delivery business",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          {session ? (
            <div className="min-h-screen">
              <Navigation />
              {/* Main content: top pad for mobile header, left pad for desktop sidebar, bottom pad for mobile nav */}
              <main className="md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8">
                  {children}
                </div>
              </main>
            </div>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  );
}
