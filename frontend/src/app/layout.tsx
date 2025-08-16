import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryProvider } from "@/providers/query-provider";
import { MainContent } from "@/components/layout/main-content";
import { ErrorLogViewer } from "@/components/debug/error-log-viewer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SalesHub CRM",
  description: "Modern AI-enabled sales and inbound marketing CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <MainContent>
              {children}
            </MainContent>
            <ErrorLogViewer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
