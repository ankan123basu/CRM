import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Prosperr's display face (prosperr.io headings).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});


// Google Analytics is opt-in: set NEXT_PUBLIC_GA_ID to enable it.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID
export const metadata: Metadata = {
  title: { default: 'Prosperr Sales CRM', template: '%s | Prosperr CRM' },
  description: "Prosperr's in-house B2B sales CRM: prospecting, SQL qualification, L1–L3 meetings, multithreading and revival in one place.",
  applicationName: 'Prosperr Sales CRM',
  icons: {
    icon: [{ url: '/brand/prosperr-mark-512.png', type: 'image/png' }],
    apple: '/brand/prosperr-mark-512.png',
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        {/* Dark mode — runs before paint to prevent white flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.classList.add('dark');}catch(e){}})();` }} />
      </head>
      <body className="min-h-full flex flex-col">
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(GA_ID)});`}</Script>
          </>
        )}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
