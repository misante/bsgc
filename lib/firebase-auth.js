import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase";

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const loginUser = async (email, password) => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email, password) => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const onAuthChange = (callback) => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

export const resetPassword = async (email) => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    // Don't log popup closure errors - they're expected user behavior
    if (error.code !== "auth/popup-closed-by-user") {
      console.error("🔴 Google sign in error:", error.code, error.message);
    }
    throw error;
  }
};

// Utility function to get current user
export const getCurrentUser = () => {
  return auth?.currentUser;
};

// Utility function to get user ID token
export const getUserToken = async () => {
  try {
    if (!auth?.currentUser) {
      return null;
    }
    return await auth.currentUser.getIdToken();
  } catch (error) {
    return null;
  }
};
