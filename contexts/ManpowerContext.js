"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ManpowerContext = createContext();

export const useManpower = () => {
  const context = useContext(ManpowerContext);
  if (context === undefined) {
    throw new Error("useManpower must be used within a ManpowerProvider");
  }
  return context;
};

export function ManpowerProvider({ children }) {
  const [manpower, setManpower] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchManpowerFromSupabase = async (firebaseUser) => {
    try {
      console.log("🔄 Fetching manpower data for auth_id:", firebaseUser.uid);

      const response = await fetch(`/api/manpower/user/${firebaseUser.uid}`);

      if (response.ok) {
        const userData = await response.json();
        console.log("✅ Manpower data fetched:", userData);
        setManpower(userData);
        setError(null);
      } else {
        console.log("❌ Manpower not found in Supabase");
        // Create basic user object from Firebase if not found in Supabase
        const basicUser = {
          id: null,
          auth_id: firebaseUser.uid,
          email: firebaseUser.email,
          first_name:
            firebaseUser.displayName || firebaseUser.email.split("@")[0],
          last_name: "",
          role: "user",
          status: "active",
          // Add other fields as needed
        };
        setManpower(basicUser);
        setError("User not found in manpower table");
      }
    } catch (error) {
      console.error("❌ Error fetching manpower data:", error);
      // Fallback to basic Firebase data
      const basicUser = {
        id: null,
        auth_id: firebaseUser.uid,
        email: firebaseUser.email,
        first_name:
          firebaseUser.displayName || firebaseUser.email.split("@")[0],
        last_name: "",
        role: "user",
        status: "active",
      };
      setManpower(basicUser);
      setError("Failed to fetch user data");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Firebase auth state changed:", firebaseUser);

      if (firebaseUser) {
        await fetchManpowerFromSupabase(firebaseUser);
      } else {
        console.log("👤 No user authenticated");
        setManpower(null);
        setError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to refresh manpower data
  const refreshManpower = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      setLoading(true);
      await fetchManpowerFromSupabase(firebaseUser);
      setLoading(false);
    }
  };

  const value = {
    manpower, // Full manpower data from Supabase
    setManpower,
    loading, // Loading state
    error, // Error message if any
    isAuthenticated: !!manpower, // Auth check
    refreshManpower, // Function to refresh data
  };

  return (
    <ManpowerContext.Provider value={value}>
      {children}
    </ManpowerContext.Provider>
  );
}
