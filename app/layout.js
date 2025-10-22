import "./globals.css";
// import AuthProvider from "@/components/layout/AuthProvider";
import AppProvider from "@/contexts/AppProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata = {
  title: "BSGC Construction Management",
  description: "Construction Project Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0, fontFamily: "font-sans" }}>
        <AppProvider>
          <ThemeProvider>
            {/* <AuthProvider> */}
            {children}
            {/* </AuthProvider> */}
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
