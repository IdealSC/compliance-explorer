import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { SessionProvider } from "@/components/auth/DemoSessionProvider";
import { DemoAuthWarningBanner } from "@/components/governance";
import { getCurrentSession, toClientSession } from "@/auth/session";
import { getPermissionsForRoles } from "@/auth/roles";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISC Compliance Explorer",
  description:
    "Regulatory landscape orientation tool for senior biopharma supply chain leaders managing the transition from clinical development into commercial execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = getCurrentSession();
  const clientSession = toClientSession(session);
  const permissions = session ? getPermissionsForRoles(session.roles) : [];

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full font-sans" style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        <SessionProvider initialUser={clientSession} initialPermissions={permissions}>
          <TooltipProvider>
            <AppShell>
              <DemoAuthWarningBanner className="mb-4" />
              {children}
            </AppShell>
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

