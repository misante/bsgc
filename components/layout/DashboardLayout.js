// "use client";
// import { useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import Sidebar from "./Sidebar";
// import Header from "./Header";

// const navigation = [
//   { name: "Dashboard", href: "/dashboard", icon: "📊" },
//   { name: "Projects", href: "/dashboard/projects", icon: "🏗️" },
//   { name: "Manpower", href: "/dashboard/manpower", icon: "👥" },
//   { name: "Materials", href: "/dashboard/materials", icon: "📦" },
//   { name: "Equipment", href: "/dashboard/equipment", icon: "🚜" },
//   { name: "Safety", href: "/dashboard/safety", icon: "🛡️" },
//   { name: "Tasks", href: "/dashboard/tasks", icon: "📊" },
//   { name: "Reports", href: "/dashboard/reports", icon: "📈" },
// ];

// export default function DashboardLayout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const pathname = usePathname();
//   const router = useRouter();

//   const isActive = (href) => {
//     if (href === "/dashboard") {
//       return pathname === "/dashboard";
//     }
//     return pathname.startsWith(href);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex dark:bg-gray-900">
//       {/* Mobile Sidebar */}
//       <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

//       {/* Desktop Sidebar */}
//       <div className="hidden lg:flex lg:flex-shrink-0">
//         <div className="flex flex-col w-64">
//           <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
//             <div
//               onClick={() => router.replace("/dashboard")}
//               className="flex items-center flex-shrink-0 px-4 cursor-pointer"
//             >
//               <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
//                 <img
//                   src="/images/logo.png"
//                   alt="BSGC Logo"
//                   className="h-8 w-8 object-contain"
//                   onError={(e) => {
//                     e.target.style.display = "none";
//                     e.target.nextSibling.style.display = "flex";
//                   }}
//                 />
//                 {/* <div className="h-8 w-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold text-sm hidden">
//                   <img
//                     src="/images/logo.png"
//                     alt="BSGC Logo"
//                     className="h-8 w-8 object-contain"
//                     onError={(e) => {
//                       e.target.style.display = "none";
//                       e.target.nextSibling.style.display = "flex";
//                     }}
//                   />{" "}
//                 </div> */}
//               </div>
//               <span className="ml-3 text-xl font-semibold text-gray-900 tracking-tight dark:text-white">
//                 BSGC
//               </span>
//             </div>
//             <nav className="mt-8 flex-1 flex flex-col px-4 space-y-1">
//               {navigation.map((item) => {
//                 const active = isActive(item.href);
//                 return (
//                   <a
//                     key={item.name}
//                     href={item.href}
//                     className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
//                       active
//                         ? "bg-primary-50 text-primary-700 border border-primary-100 shadow-sm dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800"
//                         : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
//                     }`}
//                   >
//                     <span
//                       className={`mr-3 text-lg transition-colors duration-200 ${
//                         active
//                           ? "text-primary-600 dark:text-primary-400"
//                           : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
//                       }`}
//                     >
//                       {item.icon}
//                     </span>
//                     {item.name}
//                     {active && (
//                       <span className="ml-auto w-2 h-2 bg-primary-600 rounded-full dark:bg-primary-400"></span>
//                     )}
//                   </a>
//                 );
//               })}
//             </nav>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <Header setSidebarOpen={setSidebarOpen} />

//         <main className="flex-1 relative z-0 focus:outline-none">
//           <div className="py-6">
//             <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
//               {children}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {
  FaChevronDown,
  FaChevronRight,
  FaTools,
  FaUsers,
  FaCog,
  FaUserClock,
  FaDollarSign,
} from "react-icons/fa";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Projects", href: "/dashboard/projects", icon: "🏗️" },
  { name: "Manpower", href: "/dashboard/manpower", icon: "👥" },
  { name: "Materials", href: "/dashboard/materials", icon: "📦" },
  { name: "Equipment", href: "/dashboard/equipment", icon: "🚜" },
  { name: "Safety", href: "/dashboard/safety", icon: "🛡️" },
  { name: "Tasks", href: "/dashboard/tasks", icon: "📊" },
  { name: "Reports", href: "/dashboard/reports", icon: "📈" },
];

// Financials submenu structure
const financialsMenu = {
  name: "Financials",
  href: "#", // Use "#" to prevent navigation
  icon: "💰",
  items: [
    {
      name: "Masters",
      icon: FaCog,
      items: [
        { name: "Equipment", href: "/master/equipment", icon: FaTools },
        { name: "Manpower", href: "/master/manpower", icon: FaUsers },
      ],
    },
    {
      name: "Planning",
      icon: FaUserClock,
      items: [
        {
          name: "Equipment Planning",
          href: "/planning/equipment",
          icon: FaCog,
        },
        {
          name: "Manpower Planning",
          href: "/planning/manpower",
          icon: FaUserClock,
        },
      ],
    },
  ],
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "#") return false;
    return pathname.startsWith(href);
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isMenuExpanded = (menuName) => {
    return expandedMenus[menuName];
  };

  const isFinancialsActive = () => {
    return pathname.startsWith("/master/") || pathname.startsWith("/planning/");
  };

  const renderMenuItem = (item, level = 0) => {
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = isMenuExpanded(item.name);
    const active = isActive(item.href);

    // Check if any child items are active
    const isChildActive =
      hasSubItems &&
      item.items.some((subItem) =>
        subItem.items
          ? subItem.items.some((child) => isActive(child.href))
          : isActive(subItem.href)
      );

    const baseClasses = `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      active || isChildActive
        ? "bg-primary-50 text-primary-700 border border-primary-100 shadow-sm dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
    } ${level > 0 ? `ml-${level * 3}` : ""}`;

    if (hasSubItems) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleMenu(item.name)}
            className={`w-full text-left ${baseClasses}`}
          >
            <span
              className={`mr-3 transition-colors duration-200 ${
                active || isChildActive
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
              } ${typeof item.icon === "string" ? "text-lg" : "h-4 w-4"}`}
            >
              {typeof item.icon === "string" ? item.icon : <item.icon />}
            </span>
            <span className="flex-1">{item.name}</span>
            <span className="text-gray-400 ml-2">
              {isExpanded ? (
                <FaChevronDown className="h-3 w-3" />
              ) : (
                <FaChevronRight className="h-3 w-3" />
              )}
            </span>
            {(active || isChildActive) && (
              <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full dark:bg-primary-400"></span>
            )}
          </button>

          {isExpanded && (
            <div className="mt-1 space-y-1 ml-3">
              {item.items.map((subItem) => (
                <div key={subItem.name}>
                  {subItem.href ? (
                    <a
                      href={subItem.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(subItem.href)
                          ? "bg-primary-50 text-primary-700 border border-primary-100 shadow-sm dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      } ml-3`}
                    >
                      <span
                        className={`mr-3 transition-colors duration-200 ${
                          isActive(subItem.href)
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        } ${
                          typeof subItem.icon === "string"
                            ? "text-lg"
                            : "h-4 w-4"
                        }`}
                      >
                        {typeof subItem.icon === "string" ? (
                          subItem.icon
                        ) : (
                          <subItem.icon />
                        )}
                      </span>
                      <span className="flex-1">{subItem.name}</span>
                      {isActive(subItem.href) && (
                        <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full dark:bg-primary-400"></span>
                      )}
                    </a>
                  ) : (
                    renderMenuItem(subItem, level + 1)
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <a key={item.name} href={item.href} className={baseClasses}>
        <span
          className={`mr-3 text-lg transition-colors duration-200 ${
            active
              ? "text-primary-600 dark:text-primary-400"
              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }`}
        >
          {item.icon}
        </span>
        {item.name}
        {active && (
          <span className="ml-auto w-2 h-2 bg-primary-600 rounded-full dark:bg-primary-400"></span>
        )}
      </a>
    );
  };

  return (
    <div className="px-2 min-h-screen bg-gray-50 flex dark:bg-gray-900">
      {/* Mobile Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
            <div
              onClick={() => router.replace("/dashboard")}
              className="flex items-center flex-shrink-0 px-4 cursor-pointer"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                <img
                  src="/images/logo.png"
                  alt="BSGC Logo"
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900 tracking-tight dark:text-white">
                BSGC
              </span>
            </div>
            <nav className="mt-8 flex-1 flex flex-col px-4 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-primary-50 text-primary-700 border border-primary-100 shadow-sm dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={`mr-3 text-lg transition-colors duration-200 ${
                        active
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                    {active && (
                      <span className="ml-auto w-2 h-2 bg-primary-600 rounded-full dark:bg-primary-400"></span>
                    )}
                  </a>
                );
              })}

              {/* Financials Menu */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {renderMenuItem(financialsMenu)}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 relative z-0 focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
