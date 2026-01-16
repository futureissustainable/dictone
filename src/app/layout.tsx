import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dictone - Lyrics Writing Tool",
  description: "Write lyrics with rhyme scheme highlighting and discover bars from your favorite artists",
  keywords: ["lyrics", "rhymes", "songwriting", "rap", "hip-hop", "rhyme scheme"],
  authors: [{ name: "Dictone" }],
  openGraph: {
    title: "Dictone - Lyrics Writing Tool",
    description: "Write lyrics with rhyme scheme highlighting and discover bars from your favorite artists",
    url: "https://dictone.com",
    siteName: "Dictone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dictone - Lyrics Writing Tool",
    description: "Write lyrics with rhyme scheme highlighting and discover bars from your favorite artists",
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
