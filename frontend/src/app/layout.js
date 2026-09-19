import { Fredoka, Caveat } from "next/font/google";
import "./globals.css";
import TemptationRadar from "../components/TemptationRadar";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "PennyPal",
  description: "Create your PennyPal account and start your money journey!",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9FF] text-[#5B3F91] font-sans">
        {children}
        <TemptationRadar />
      </body>
    </html>
  );
}