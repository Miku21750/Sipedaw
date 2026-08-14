import "./globals.css";

export const metadata = {
  title: "SIPEDAW",
  description: "Sistem Pendataan Warga",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
