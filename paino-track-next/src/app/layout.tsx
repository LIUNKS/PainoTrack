import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "PainoTrack | Notaría Paino",
  description: "Seguridad jurídica con transparencia digital en tiempo real",
};

import { Providers } from "@/components/Providers";

// ... (keep structure)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${jakarta.variable} ${inter.variable} antialiased bg-background text-white selection:bg-primary/30 selection:text-white`}
      >
        <Providers>
          {/* Background Gradient/Mesh */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-30" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full opacity-30" />
          </div>
          <main className="relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
