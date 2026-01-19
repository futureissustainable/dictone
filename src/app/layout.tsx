import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DICTONE - Great artists steal.",
  description: "Write lyrics with rhyme scheme highlighting and discover bars from your favorite artists. Great artists steal.",
  keywords: ["lyrics", "rhymes", "songwriting", "rap", "hip-hop", "rhyme scheme", "copycat"],
  authors: [{ name: "DICTONE" }],
  openGraph: {
    title: "DICTONE - Great artists steal.",
    description: "Write lyrics with rhyme scheme highlighting and discover bars from your favorite artists.",
    url: "https://dictone.com",
    siteName: "DICTONE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DICTONE - Great artists steal.",
    description: "Write lyrics with rhyme scheme highlighting and discover bars from your favorite artists.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
