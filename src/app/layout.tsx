import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../styles/tailwind-built.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { FontSizeProvider } from '@/context/FontSizeContext';
import { AuthProvider } from '@/context/AuthContext';
import { OfflineSyncProvider } from '@/context/OfflineSyncContext';
import { Header } from '@/components/layout/Header';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { WelcomeModal } from '@/components/common/WelcomeModal';
import { OfflineSyncBar } from '@/components/common/OfflineSyncBar';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

const basePath = process.env.GITHUB_PAGES === 'true' ? '/allatmento-web' : '';

export const metadata: Metadata = {
  title: 'Állatmentő Portál - Sürgősségi Segítség & Koordináció',
  description: 'Valós idejű állatmentő és diszpécser koordinációs portál bejelentők és hitelesített mentőszervezetek számára.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Állatmentő',
  },
  icons: {
    icon: `${basePath}/logo.png`,
    apple: `${basePath}/logo.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Állatmentő" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var fs = localStorage.getItem('allatmento_font_size');
                  if (fs === 'normal') {
                    document.documentElement.style.fontSize = '100%';
                    document.documentElement.setAttribute('data-font-size', 'normal');
                  } else if (fs === 'large') {
                    document.documentElement.style.fontSize = '112.5%';
                    document.documentElement.setAttribute('data-font-size', 'large');
                  } else {
                    // Alapértelmezett: 'larger' (125%)
                    document.documentElement.style.fontSize = '125%';
                    document.documentElement.setAttribute('data-font-size', 'larger');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased h-dvh xl:h-auto xl:min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 overflow-hidden xl:overflow-auto" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <FontSizeProvider>
              <AuthProvider>
                <OfflineSyncProvider>
                  <ScrollToTop />
                  <Header />
                  <OfflineSyncBar />
                  <main className="flex-1 min-h-0 flex flex-col overflow-y-auto xl:overflow-visible pb-safe pl-safe pr-safe">
                    {children}
                  </main>
                  <WelcomeModal />
                </OfflineSyncProvider>
              </AuthProvider>
            </FontSizeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
