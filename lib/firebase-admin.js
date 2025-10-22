// Simple mock for development
export const verifyFirebaseToken = async (token) => {
  console.log("🔐 Mock token verification for development");
  // In development, you might want to return a mock user
  return {
    uid: "mock-user-id",
    email: "mock@example.com",
  };
};
