import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ScheduleProvider } from "@/context/ScheduleContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Planificador de Horarios UNAC 2026-B",
  description: "Herramienta optimizada para organizar tu horario universitario en la Universidad Nacional del Callao. Selecciona tus cursos, evita cruces y exporta a Excel, PDF nativo e ICS.",
  openGraph: {
    title: "Planificador UNAC 2026-B",
    description: "Arma tu horario fácilmente y expórtalo.",
    url: "https://horario-unac.vercel.app",
    siteName: "Planificador UNAC",
    locale: "es_PE",
    type: "website",
  }
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100 font-sans">
        <ScheduleProvider>
          {children}
        </ScheduleProvider>
      </body>
    </html>
  );
}
