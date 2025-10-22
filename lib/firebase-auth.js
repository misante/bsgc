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

    console.log("🟡 Attempting to sign in user:", email);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("✅ User signed in successfully:", userCredential.user.uid);
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

    console.log("🟡 Attempting to register user:", email);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("✅ User registered successfully:", userCredential.user.uid);
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

    console.log("🟡 Signing out user");
    await signOut(auth);
    console.log("✅ User signed out successfully");
  } catch (error) {
    throw error;
  }
};

export const onAuthChange = (callback) => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    return () => {};
  }

  console.log("🟡 Setting up auth state listener");
  return onAuthStateChanged(auth, (user) => {
    console.log(
      "🟢 Auth state changed:",
      user ? `User ${user.uid}` : "No user"
    );
    callback(user);
  });
};

export const resetPassword = async (email) => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    console.log("🟡 Sending password reset email to:", email);
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Password reset email sent successfully");
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    console.log("🟡 Attempting Google sign in");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("✅ Google sign in successful:", result.user.uid);
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
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
//   sendPasswordResetEmail,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from "firebase/auth";
// import { auth } from "./firebase";

// const googleProvider = new GoogleAuthProvider();

// export const loginUser = async (email, password) => {
//   try {
//     if (!auth) {
//       throw new Error("Firebase auth is not initialized");
//     }

//     console.log("🟡 Attempting to sign in user:", email);
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     console.log("✅ User signed in successfully:", userCredential.user.uid);
//     return userCredential;
//   } catch (error) {
//     // Don't log here - let the useAuth hook handle logging
//     throw error;
//   }
// };

// export const registerUser = async (email, password) => {
//   try {
//     if (!auth) {
//       throw new Error("Firebase auth is not initialized");
//     }

//     console.log("🟡 Attempting to register user:", email);
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     console.log("✅ User registered successfully:", userCredential.user.uid);
//     return userCredential;
//   } catch (error) {
//     throw error;
//   }
// };

// export const logoutUser = async () => {
//   try {
//     if (!auth) {
//       throw new Error("Firebase auth is not initialized");
//     }

//     console.log("🟡 Signing out user");
//     await signOut(auth);
//     console.log("✅ User signed out successfully");
//   } catch (error) {
//     throw error;
//   }
// };

// export const onAuthChange = (callback) => {
//   if (!auth) {
//     console.error("Firebase auth is not initialized");
//     return () => {};
//   }

//   console.log("🟡 Setting up auth state listener");
//   return onAuthStateChanged(auth, (user) => {
//     console.log(
//       "🟢 Auth state changed:",
//       user ? `User ${user.uid}` : "No user"
//     );
//     callback(user);
//   });
// };

// export const resetPassword = async (email) => {
//   try {
//     if (!auth) {
//       throw new Error("Firebase auth is not initialized");
//     }

//     console.log("🟡 Sending password reset email to:", email);
//     await sendPasswordResetEmail(auth, email);
//     console.log("✅ Password reset email sent successfully");
//   } catch (error) {
//     throw error;
//   }
// };

// export const signInWithGoogle = async () => {
//   try {
//     if (!auth) {
//       throw new Error("Firebase auth is not initialized");
//     }

//     console.log("🟡 Attempting Google sign in");
//     const result = await signInWithPopup(auth, googleProvider);
//     console.log("✅ Google sign in successful:", result.user.uid);
//     return result;
//   } catch (error) {
//     throw error;
//   }
// };

// // Utility function to get current user
// export const getCurrentUser = () => {
//   return auth?.currentUser;
// };

// // Utility function to get user ID token
// export const getUserToken = async () => {
//   try {
//     if (!auth?.currentUser) {
//       return null;
//     }
//     return await auth.currentUser.getIdToken();
//   } catch (error) {
//     return null;
//   }
// };
