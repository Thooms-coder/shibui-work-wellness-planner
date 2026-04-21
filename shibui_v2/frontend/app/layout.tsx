import "./globals.css";
import type { ReactNode } from "react";


export const metadata = {
  title: "Shibui",
  description: "Balanced planning for work and movement.",
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <video autoPlay muted loop playsInline id="bg-video">
          <source src="/bgvideo.mp4" type="video/mp4" />
        </video>
        <div className="page-overlay" />
        {children}
      </body>
    </html>
  );
}
