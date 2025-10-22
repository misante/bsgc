"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const router = useRouter();

  const {
    login,
    signInWithGoogle,
    loading: authLoading,
    error,
    success: authSuccess,
    setError: setAuthError,
  } = useAuth();

  // Update toast when error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error || localError) {
      setLocalError("");
      setAuthError(null);
    }
  }, [email, password, error, localError, setAuthError]);

  const validateForm = () => {
    if (!email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!email.includes("@")) {
      setLocalError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setLocalError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError("");
    setAuthError(null);

    if (!validateForm()) {
      setLocalLoading(false);
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      console.error("Unexpected login error:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalLoading(true);
    setLocalError("");
    setAuthError(null);

    // small timeout to ensure loading state is visible
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const result = await signInWithGoogle();

      // If result is null and no error is set, it means popup was closed
      if (result === null && !error) {
        // Popup was closed by user - no action needed
        console.log("Google sign in cancelled by user");
      }
    } catch (error) {
      console.error("Unexpected Google sign in error:", error);
    } finally {
      setLocalLoading(false);
    }
  };
  const isLoading = localLoading || authLoading;
  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Full-screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-700 font-medium">
              {authSuccess ? "Redirecting..." : "Signing you in..."}
            </p>
            <p className="text-center text-gray-500 text-sm mt-2">
              {authSuccess
                ? "Taking you to your dashboard..."
                : "Verifying your credentials..."}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img className="h-12 w-auto" src="/images/logo.png" alt="BSGC" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to BSGC
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Construction Management System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Success Message */}
          {authSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {authSuccess}
              </div>
            </div>
          )}

          {/* Error Display */}
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <span className="font-medium">Login failed</span>
                  <p className="mt-1">{displayError}</p>
                  {(displayError.includes("No account found") ||
                    displayError.includes("Invalid email or password")) && (
                    <div className="mt-2 text-xs">
                      <Link
                        href="/auth/register"
                        className="text-red-600 hover:text-red-500 underline"
                      >
                        Create a new account
                      </Link>{" "}
                      or{" "}
                      <Link
                        href="/auth/forgot-password"
                        className="text-red-600 hover:text-red-500 underline"
                      >
                        reset your password
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {authSuccess ? "Redirecting..." : "Signing in..."}
                </div>
              ) : (
                "Sign in with Email"
              )}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Create one here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useAuth } from "@/hooks/useAuth";
// import toast from "react-hot-toast";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [localLoading, setLocalLoading] = useState(false);
//   const [localError, setLocalError] = useState("");
//   const [loginError, setLoginError] = useState("");
//   const router = useRouter();

//   useEffect(() => {
//     setLoginError(error);
//   }, []);
//   const {
//     login,
//     loading: authLoading,
//     error,
//     success: authSuccess,
//     setError: setAuthError,
//   } = useAuth();
//   console.log("authError:", loginError);
//   // Clear errors when user starts typing
//   useEffect(() => {
//     if (loginError || localError) {
//       setLocalError("");
//       setAuthError(null);
//     }
//   }, [email, password, error, localError, setAuthError]);

//   const validateForm = () => {
//     if (!email.trim()) {
//       setLocalError("Email is required");
//       return false;
//     }
//     if (!email.includes("@")) {
//       setLocalError("Please enter a valid email address");
//       return false;
//     }
//     if (!password) {
//       setLocalError("Password is required");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLocalLoading(true);
//     setLocalError("");
//     setAuthError(null);

//     if (!validateForm()) {
//       setLocalLoading(false);
//       return;
//     }
//     // Just call login and let useAuth handle everything
//     await login(email, password);
//     if (loginError) {
//       toast(
//         loginError
//         // "Invalid email or password. Please check your credentials and try again."
//       );
//     }
//     setLocalLoading(false);
//   };
//   const isLoading = localLoading || authLoading;
//   const displayError = localError || error;

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       {/* Full-screen Loading Overlay */}
//       {isLoading && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
//             <div className="flex items-center justify-center mb-4">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//             <p className="text-center text-gray-700 font-medium">
//               {authSuccess ? "Redirecting..." : "Signing you in..."}
//             </p>
//             <p className="text-center text-gray-500 text-sm mt-2">
//               {authSuccess
//                 ? "Taking you to your dashboard..."
//                 : "Verifying your credentials..."}
//             </p>
//           </div>
//         </div>
//       )}

//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="flex justify-center">
//             <img className="h-12 w-auto" src="/images/logo.png" alt="BSGC" />
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in to BSGC
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Construction Management System
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {/* Success Message */}
//           {authSuccess && (
//             <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
//               <div className="flex items-center">
//                 <svg
//                   className="w-5 h-5 mr-2"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 {authSuccess}
//               </div>
//             </div>
//           )}

//           {/* Error Display */}
//           {displayError && (
//             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
//               <div className="flex items-start">
//                 <svg
//                   className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 <div>
//                   <span className="font-medium">Login failed</span>
//                   <p className="mt-1">{displayError}</p>
//                   {(displayError.includes("No account found") ||
//                     displayError.includes("Invalid email or password")) && (
//                     <div className="mt-2 text-xs">
//                       <Link
//                         href="/auth/register"
//                         className="text-red-600 hover:text-red-500 underline"
//                       >
//                         Create a new account
//                       </Link>{" "}
//                       or{" "}
//                       <Link
//                         href="/auth/forgot-password"
//                         className="text-red-600 hover:text-red-500 underline"
//                       >
//                         reset your password
//                       </Link>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//           <div className="space-y-4">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                 placeholder="Enter your email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 disabled={isLoading}
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={isLoading}
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isLoading}
//               />
//               <label
//                 htmlFor="remember-me"
//                 className="ml-2 block text-sm text-gray-900"
//               >
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <Link
//                 href="/auth/forgot-password"
//                 className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
//               >
//                 Forgot your password?
//               </Link>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   {authSuccess ? "Redirecting..." : "Signing in..."}
//                 </div>
//               ) : (
//                 "Sign in"
//               )}
//             </button>
//           </div>

//           <div className="text-center pt-4 border-t border-gray-200">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{" "}
//               <Link
//                 href="/auth/register"
//                 className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
//               >
//                 Create one here
//               </Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
