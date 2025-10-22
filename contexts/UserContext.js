// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { onAuthChange } from "@/lib/firebase-auth";
// import { auth } from "@/lib/firebase";

// const UserContext = createContext();

// export function UserProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchUserFromSupabase = async (firebaseUser) => {
//     try {
//       console.log(
//         "🔄 Fetching user from Supabase with authId:",
//         firebaseUser.uid
//       );

//       const response = await fetch(`/api/users/${firebaseUser.uid}`);

//       if (response.ok) {
//         const userData = await response.json();
//         console.log("✅ User data from Supabase:", userData);
//         setUser(userData);
//       } else {
//         console.log(
//           "❌ User not found in Supabase, creating basic user object"
//         );
//         // If user doesn't exist in Supabase, create basic user object from Firebase
//         setUser({
//           id: firebaseUser.uid,
//           email: firebaseUser.email,
//           auth_id: firebaseUser.uid,
//           status: "active",
//           role: "user", // Default role
//           first_name: null,
//           last_name: null,
//           phone: null,
//           employee_id: null,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//         });
//       }
//     } catch (error) {
//       console.error("❌ Error fetching user data from Supabase:", error);
//       // Fallback to Firebase data
//       setUser({
//         id: firebaseUser.uid,
//         email: firebaseUser.email,
//         auth_id: firebaseUser.uid,
//         status: "active",
//         role: "user",
//         first_name: null,
//         last_name: null,
//         phone: null,
//         employee_id: null,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       });
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthChange(async (firebaseUser) => {
//       console.log("🔥 Firebase auth state changed:", firebaseUser);

//       if (firebaseUser) {
//         await fetchUserFromSupabase(firebaseUser);
//       } else {
//         console.log("👤 No user authenticated");
//         setUser(null);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   // Function to refresh user data from Supabase
//   const refreshUser = async () => {
//     const firebaseUser = auth.currentUser;
//     if (firebaseUser) {
//       setLoading(true);
//       await fetchUserFromSupabase(firebaseUser);
//       setLoading(false);
//     }
//   };

//   const value = {
//     user,
//     loading,
//     setUser,
//     refreshUser,
//   };

//   return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
// }

// export function useUser() {
//   const context = useContext(UserContext);
//   if (context === undefined) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// }
