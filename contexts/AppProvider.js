// context/AppProvider.jsx
"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { FaRegCircleCheck } from "react-icons/fa6";
import { ManpowerProvider } from "./ManpowerContext";
// import DevelopmentBanner from "@/components/common/DevelopmentBanner";

export default function AppProvider({ children }) {
  // Changed to default export
  return (
    <ManpowerProvider>
      {/* <DevelopmentBanner /> */}
      <main>{children}</main>
      <Toaster
        toastOptions={{
          success: {
            style: {
              background: "lime",
              minWidth: "fitContent",
              color: "white",
              position: "top-center",
              icon: <FaRegCircleCheck />,
              iconTheme: {
                primary: "#00ff80",
                secondary: "black",
              },
            },
          },
          error: {
            style: {
              background: "red",
            },
          },
        }}
      />
    </ManpowerProvider>
  );
}
