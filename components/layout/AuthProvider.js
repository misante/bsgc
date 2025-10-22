"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthChange } from "../../lib/firebase-auth";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });

        // Redirect to dashboard if on auth pages
        if (pathname === "/auth/login" || pathname === "/auth/register") {
          router.push("/dashboard");
        }
      } else {
        setUser(null);
        // Redirect to login if not on auth pages
        if (pathname !== "/auth/login" && pathname !== "/auth/register") {
          router.push("/auth/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
