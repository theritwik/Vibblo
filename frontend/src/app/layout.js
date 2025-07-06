import RootLayoutClient from "@/components/RootLayoutClient";
import "./globals.css";

export const metadata = {
  title: "Social Media APP",
  description: "Social Media App built with Next.js, React, and Redux",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen m-0 bg-[#F5F6FA]">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
