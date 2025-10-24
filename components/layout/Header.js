"use client";
import { Fragment, useState, useEffect } from "react";
import {
  Menu,
  MenuButton,
  Transition,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";
// import AuthModal from "@/components/AuthModal";
// import UserButton from "@/components/UserButton";
import AuthModal from "../users/AuthModal";
import { useManpower } from "@/contexts/ManpowerContext";
import { useRouter } from "next/navigation";

export default function Header({ setSidebarOpen }) {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { manpower, loading } = useManpower();
  const { logout } = useAuth();
  const router = useRouter();
  console.log("manpower:", manpower);
  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDarkMode =
      localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDarkMode);
    updateDarkMode(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    updateDarkMode(newDarkMode);
  };

  const updateDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (manpower) => {
    if (manpower?.first_name && manpower?.last_name) {
      return `${manpower.first_name[0]}${manpower.last_name[0]}`.toUpperCase();
    }
    if (manpower?.email) {
      return manpower.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (manpower) => {
    if (manpower?.first_name) {
      return `${manpower.first_name}`;
    }
    // if (manpower?.email) {
    //   return manpower.email.split("@")[0];
    // }
    return "User";
  };

  return (
    <div className="sticky z-30 top-0 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:bg-gray-800 dark:border-gray-700 sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FaBars className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div
        className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden"
        aria-hidden="true"
      />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          {/* You can add search input here if needed */}
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="sr-only">
              {darkMode ? "Switch to light mode" : "Switch to dark mode"}
            </span>
            {darkMode ? (
              <FaSun className="h-5 w-5 text-yellow-500" aria-hidden="true" />
            ) : (
              <FaMoon className="h-5 w-5 text-gray-600" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <span className="sr-only">View notifications</span>
            <FaBell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700"
            aria-hidden="true"
          />

          {/* Authentication Section */}
          {loading ? (
            // Loading state
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="hidden lg:block">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ) : manpower ? (
            // User is authenticated - Show user dropdown
            <Menu as="div" className="relative">
              <div>
                <MenuButton className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(manpower)}
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      className="ml-1 capitalize text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
                      aria-hidden="true"
                    >
                      {manpower.first_name || manpower.email.split("@")[0]}
                      {/* {getUserDisplayName(manpower)} */}
                    </span>
                  </span>
                </MenuButton>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 z-40 mt-2.5 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 focus:outline-none">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-600 mb-1">
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-100 truncate">
                      {/* {getUserDisplayName(user)} */}
                      {manpower.email}
                    </p>
                    {/* <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {manpower.first_name}
                    </p> */}
                  </div>

                  <MenuItem>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`${
                          active ? "bg-gray-50 dark:bg-gray-700" : ""
                        } flex items-center px-3 py-2 text-sm leading-6 text-gray-900 dark:text-gray-100`}
                      >
                        <FaUserCircle className="h-4 w-4 mr-2 text-gray-400" />
                        Your profile
                      </a>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`${
                          active ? "bg-gray-50 dark:bg-gray-700" : ""
                        } flex items-center px-3 py-2 text-sm leading-6 text-gray-900 dark:text-gray-100`}
                      >
                        <FaCog className="h-4 w-4 mr-2 text-gray-400" />
                        Settings
                      </a>
                    )}
                  </MenuItem>
                  <div className="border-t border-gray-100 dark:border-gray-600 mt-1 pt-1">
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={`${
                            active ? "bg-red-50 dark:bg-red-900/20" : ""
                          } flex items-center w-full px-3 py-2 text-sm leading-6 text-red-600 dark:text-red-400`}
                        >
                          <FaSignOutAlt className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          ) : (
            // User is not authenticated - Show sign in buttons
            <div className="flex items-center space-x-3">
              <button
                // onClick={() => setIsAuthModalOpen(true)}
                onClick={() => router.replace("/auth/login")}
                className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FaSignInAlt className="h-4 w-4" />
                <span>Sign In</span>
              </button>

              <button
                // onClick={() => setIsAuthModalOpen(true)}
                onClick={() => router.replace("/auth/login")}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <FaUserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </button>

              {/* Mobile sign in button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="sm:hidden -m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Sign in</span>
                <FaSignInAlt className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
