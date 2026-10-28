// app/layout.tsx
import "@/styles/globals.css";
import { ReactNode } from "react";

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
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}