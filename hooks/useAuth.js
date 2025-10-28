"use client";
import { useState } from "react";
import { loginUser, registerUser, logoutUser } from "@/lib/firebase-auth";
import { useManpower } from "@/contexts/ManpowerContext";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { manpower, setManpower, refreshManpower } = useManpower();
  const router = useRouter();

  const checkManpowerExists = async (userId, token) => {
    try {
      const response = await fetch(`/api/manpower?auth_id=${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check manpower record");
      }

      const data = await response.json();

      return data.exists && data.manpower !== null;
    } catch (error) {
      console.error("❌ Error checking manpower:", error);
      return false;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await loginUser(email, password);
      const firebaseUser = userCredential.user;

      // 2. Get Firebase token
      const token = await firebaseUser.getIdToken();

      // 3. Check if user exists in manpower table
      const manpowerExists = await checkManpowerExists(firebaseUser.uid, token);

      if (!manpowerExists) {
        // Log out the user since they don't exist in manpower
        await logoutUser();
        throw new Error(
          "Account not found in company records. Please contact your administrator or register for an account."
        );
      }

      // 4. Refresh manpower context to get user data
      await refreshManpower();

      // 5. Set success and redirect
      setSuccess(
        <div className="flex items-center">
          <p>Login successful! Redirecting to dashboard...</p>
          <Loader className="h-3 w-3 animate-spin ml-4" />
        </div>
      );

      // Redirect after short delay to show success message
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);

      return userCredential;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);

      setError(errorMessage);

      // Don't re-throw the error to prevent uncaught promise rejections
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, manpowerData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Create user in Firebase
      const userCredential = await registerUser(email, password);
      const firebaseUser = userCredential.user;

      // 2. Get Firebase token for the new user
      const token = await firebaseUser.getIdToken();

      // 3. Create manpower record in Supabase
      const supabaseManpowerData = {
        ...manpowerData,
        auth_id: firebaseUser.uid,
      };

      const response = await fetch("/api/manpower", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ manpowerData: supabaseManpowerData }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // If Supabase fails, delete the Firebase user to keep data consistent
        await firebaseUser.delete();
        throw new Error(
          responseData.error ||
            "Failed to create company record. Please try again."
        );
      }
      // 4. Set success state and redirect
      setSuccess(
        <div className="flex items-center">
          <p>Account created successfully! Welcome to BSGC. Redirecting...</p>
          <Loader className="h-4 w-4 animate-spin ml-4" />
        </div>
      );
      // setSuccess(
      //   "Account created successfully! Welcome to BSGC. Redirecting..."
      // );

      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);

      return responseData;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);

      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Authenticate with Google
      const { signInWithGoogle: firebaseGoogleSignIn } = await import(
        "@/lib/firebase-auth"
      );
      const result = await firebaseGoogleSignIn();
      const firebaseUser = result.user;

      // 2. Get Firebase token
      const token = await firebaseUser.getIdToken();

      // 3. Check if user exists in manpower table
      const manpowerExists = await checkManpowerExists(firebaseUser.uid, token);

      if (!manpowerExists) {
        // If user doesn't exist in manpower, we need to create a record

        const googleManpowerData = {
          auth_id: firebaseUser.uid,
          first_name: firebaseUser.displayName?.split(" ")[0] || "Google",
          last_name:
            firebaseUser.displayName?.split(" ").slice(1).join(" ") || "User",
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber || "",
          role: "Employee", // Default role
          employee_id: `GOOGLE-${firebaseUser.uid.slice(0, 8)}`,
          status: "active",
          created_at: new Date().toISOString(),
        };

        const response = await fetch("/api/manpower", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ manpowerData: googleManpowerData }),
        });

        if (!response.ok) {
          throw new Error(
            "Failed to create user profile. Please contact administrator."
          );
        }

        console.log("✅ Google user profile created in manpower");
      }

      // 4. Refresh manpower context to get user data
      await refreshManpower();

      // 5. Set success and redirect
      // setSuccess("Google sign in successful! Redirecting...");
      setSuccess(
        <div className="flex items-center">
          <p>Google sign in successful! Redirecting...</p>
          <Loader className="h-4 w-4 animate-spin ml-4" />
        </div>
      );

      // Redirect after short delay to show success message
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);

      return result;
    } catch (error) {
      // Handle popup closure gracefully - don't show error to user
      if (error.code === "auth/popup-closed-by-user") {
        // Don't set error for popup closure - it's expected behavior
        return null;
      }

      console.error("🔴 Google sign in process failed:", error);

      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);

      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setManpower(null);
      setSuccess("Logged out successfully!");
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate email
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }

      // Import the resetPassword function from firebase-auth
      const { resetPassword: firebaseResetPassword } = await import(
        "@/lib/firebase-auth"
      );
      await firebaseResetPassword(email);

      setSuccess(
        "Password reset email sent! Check your inbox for further instructions."
      );
    } catch (error) {
      console.error("🔴 Password reset failed:", error);

      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced error message handler for Firebase errors
  const getFirebaseErrorMessage = (error) => {
    if (!error || !error.code) {
      // Check if it's a custom error message from our logic
      if (
        error.message &&
        (error.message.includes("company records") ||
          error.message.includes("manpower record") ||
          error.message.includes("company record") ||
          error.message.includes("administrator"))
      ) {
        return error.message;
      }

      return "An unexpected error occurred. Please try again.";
    }

    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/user-disabled":
        return "This account has been disabled. Please contact administrator.";

      case "auth/user-not-found":
        return "No account found with this email. Please check your email or create a new account.";

      case "auth/wrong-password":
        return "The password you entered is incorrect. Please try again.";

      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials and try again.";

      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later or reset your password.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";

      case "auth/email-already-in-use":
        return "An account with this email already exists. Please try logging in instead.";

      case "auth/weak-password":
        return "Password should be at least 6 characters long.";

      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled. Please contact administrator.";

      case "auth/configuration-not-found":
        return "Authentication service is not configured properly. Please contact administrator.";

      case "auth/requires-recent-login":
        return "Please sign in again to perform this action.";

      case "auth/provider-already-linked":
        return "This account is already linked with another provider.";

      case "auth/credential-already-in-use":
        return "This credential is already associated with another user account.";

      // Password reset specific errors
      case "auth/user-not-found":
        return "No account found with this email address. Please check the email or create a new account.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/too-many-requests":
        return "Too many reset attempts. Please try again later.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";

      // Google Auth specific errors
      case "auth/popup-blocked":
        return "Popup was blocked by your browser. Please allow popups for this site and try again.";

      case "auth/popup-closed-by-user":
        return "Sign in was cancelled. Please try again.";

      case "auth/unauthorized-domain":
        return "This domain is not authorized for Google sign in. Please contact administrator.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email but different sign-in method. Please use email/password to sign in.";

      default:
        // Check if it's a custom error message from our logic
        if (
          error.message &&
          (error.message.includes("company records") ||
            error.message.includes("manpower record") ||
            error.message.includes("company record") ||
            error.message.includes("administrator"))
        ) {
          return error.message;
        }

        return "An unexpected error occurred. Please try again or contact support if the problem continues.";
    }
  };

  // Clear error manually
  const clearError = () => {
    setError(null);
  };

  // Clear success manually
  const clearSuccess = () => {
    setSuccess(null);
  };

  return {
    // Authentication methods
    login,
    register,
    logout,
    resetPassword,
    signInWithGoogle,

    // State
    loading,
    error,
    success,

    // State setters
    setError,
    setSuccess,
    clearError,
    clearSuccess,
  };
}
