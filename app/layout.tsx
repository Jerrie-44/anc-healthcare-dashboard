// app/layout.tsx
import "@/styles/globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/application/navigation/navbar";

export const metadata = {
  title: "ANC Healthcare",
  description: "Operational Platform",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='%23007aff'/><path d='M11 6h2v5h5v2h-5v5h-2v-5H6v-2h5V6z' fill='white'/></svg>",
        type: "image/svg+xml",
      },
    ],
  },
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