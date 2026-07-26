import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/components/UserContext";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Betme — social predictive market",
  description:
    "Post predictions, attract participants, and earn more when your calls are accurate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <NavBar />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
