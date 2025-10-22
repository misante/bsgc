// "use client";
// import { onAuthChange } from "@/lib/firebase-auth";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function HomePage() {
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthChange((user) => {
//       if (user) {
//         router.push("/dashboard");
//       } else {
//         router.push("/auth/login");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <div className="flex justify-center mb-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//         <h2 className="text-2xl font-bold text-gray-900">
//           BSGC Construction Management
//         </h2>
//         <p className="mt-2 text-gray-600">Loading...</p>
//       </div>
//     </div>
//   );
// }
"use client";
import { onAuthChange } from "@/lib/firebase-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthChange((user) => {
      if (!isMounted) return;

      console.log("Auth state changed:", user ? "User logged in" : "No user");

      if (user) {
        console.log("Redirecting to dashboard...");
        // Use replace instead of push to avoid adding to history
        router.replace("/dashboard");
      } else {
        console.log("Redirecting to login...");
        router.replace("/auth/login");
      }

      setIsChecking(false);
    });

    // Add a timeout fallback in case auth state doesn't resolve
    const timeoutId = setTimeout(() => {
      if (isMounted && isChecking) {
        console.log("Auth check timeout, redirecting to login...");
        router.replace("/auth/login");
        setIsChecking(false);
      }
    }, 5000); // 5 second timeout

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [router, isChecking]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          BSGC Construction Management
        </h2>
        <p className="mt-2 text-gray-600">
          {isChecking ? "Checking authentication..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
