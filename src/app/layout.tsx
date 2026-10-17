import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../styles/tailwind-built.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/allatmento-web' : '';

export const metadata: Metadata = {
  title: 'Állatmentő Portál - Sürgősségi Segítség & Koordináció',
  description: 'Valós idejű állatmentő és diszpécser koordinációs portál bejelentők és hitelesített mentőszervezetek számára.',
  icons: {
    icon: `${basePath}/logo.png`,
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
      </head>
      <body className="antialiased h-dvh xl:h-auto xl:min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden xl:overflow-auto" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ScrollToTop />
              <Header />
              <main className="flex-1 min-h-0 flex flex-col overflow-y-auto xl:overflow-visible">
                {children}
              </main>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
