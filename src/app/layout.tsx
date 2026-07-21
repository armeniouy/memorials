import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const technical = JetBrains_Mono({
  variable: "--font-technical",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Memorials — Un homenaje digital",
    template: "%s · Memorials",
  },
  description:
    "Escanea el código QR de un lugar y descubre la historia de quienes descansan ahí.",
};

// Un solo color, el del tema base: ya no seguimos la preferencia del sistema.
export const viewport: Viewport = {
  themeColor: "#050506",
};

// La primera visita siempre arranca en oscuro, sin mirar la preferencia del
// sistema: es el tono que le corresponde a un memorial. Si la persona usa el
// interruptor, esa elección queda guardada y manda a partir de entonces.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("memorials-theme");
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${technical.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
