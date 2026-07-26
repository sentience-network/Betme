import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { UserProvider } from "@/components/UserContext";
import { ToastProvider } from "@/components/Toast";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Betme — social predictive market",
  description:
    "Post predictions, attract participants, and earn more when your calls are accurate.",
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {ADSENSE_CLIENT && (
          <Script
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <UserProvider>
          <ToastProvider>
            <NavBar />
            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
