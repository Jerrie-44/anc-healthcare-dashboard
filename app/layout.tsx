// app/layout.tsx
import "@/styles/globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/application/navigation/navbar";

export const metadata = {
  title: "ANC Healthcare",
  description: "Operational Platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-[#f8fafc] text-text-primary">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}