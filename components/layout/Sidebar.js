// "use client";
// import { Fragment } from "react";
// import {
//   Dialog,
//   DialogPanel,
//   Transition,
//   TransitionChild,
// } from "@headlessui/react";
// import { FaTimes } from "react-icons/fa";

// const navigation = [
//   { name: "Dashboard", href: "/dashboard", icon: "🏠" },
//   { name: "Projects", href: "/dashboard/projects", icon: "📁" },
//   { name: "Manpower", href: "/dashboard/manpower", icon: "👥" },
//   { name: "Materials", href: "/dashboard/materials", icon: "🏪" },
//   { name: "Equipment", href: "/dashboard/equipment", icon: "🚚" },
//   { name: "Safety", href: "/dashboard/safety", icon: "🛡️" },
//   { name: "Tasks", href: "/dashboard/tasks", icon: "📊" },
//   { name: "Reports", href: "/dashboard/reports", icon: "📊" },
// ];

// export default function Sidebar({ open, setOpen }) {
//   return (
//     <Transition show={open} as={Fragment}>
//       <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
//         <TransitionChild
//           as={Fragment}
//           enter="transition-opacity ease-linear duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="transition-opacity ease-linear duration-300"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
//         </TransitionChild>

//         <div className="fixed inset-0 z-40 flex">
//           <TransitionChild
//             as={Fragment}
//             enter="transition ease-in-out duration-300 transform"
//             enterFrom="-translate-x-full"
//             enterTo="translate-x-0"
//             leave="transition ease-in-out duration-300 transform"
//             leaveFrom="translate-x-0"
//             leaveTo="-translate-x-full"
//           >
//             <DialogPanel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
//               <TransitionChild
//                 as={Fragment}
//                 enter="ease-in-out duration-300"
//                 enterFrom="opacity-0"
//                 enterTo="opacity-100"
//                 leave="ease-in-out duration-300"
//                 leaveFrom="opacity-100"
//                 leaveTo="opacity-0"
//               >
//                 <div className="absolute top-0 right-0 -mr-12 pt-2">
//                   <button
//                     type="button"
//                     className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
//                     onClick={() => setOpen(false)}
//                   >
//                     <span className="sr-only">Close sidebar</span>
//                     <FaTimes
//                       className="h-6 w-6 text-white"
//                       aria-hidden="true"
//                     />
//                   </button>
//                 </div>
//               </TransitionChild>
//               <div className="flex flex-shrink-0 items-center px-4">
//                 <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                   <span className="text-white font-bold text-sm">
//                     {" "}
//                     <img
//                       src="/images/logo.png"
//                       alt="BSGC Logo"
//                       className="h-8 w-8 object-contain"
//                       onError={(e) => {
//                         e.target.style.display = "none";
//                         e.target.nextSibling.style.display = "flex";
//                       }}
//                     />{" "}
//                   </span>
//                 </div>
//                 <span className="ml-2 text-xl font-bold text-gray-900">
//                   BSGC
//                 </span>
//               </div>
//               <div className="mt-5 h-0 flex-1 overflow-y-auto">
//                 <nav className="px-2">
//                   <div className="space-y-1">
//                     {navigation.map((item) => (
//                       <a
//                         key={item.name}
//                         href={item.href}
//                         className="text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
//                         onClick={() => setOpen(false)}
//                       >
//                         <span className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6">
//                           {item.icon}
//                         </span>
//                         {item.name}
//                       </a>
//                     ))}
//                   </div>
//                 </nav>
//               </div>
//             </DialogPanel>
//           </TransitionChild>
//           <div className="w-14 flex-shrink-0" aria-hidden="true">
//             {/* Dummy element to force sidebar to shrink to fit close icon */}
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }
// components/layout/Sidebar.jsx
"use client";
import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaTools,
  FaUsers,
  FaCog,
  FaUserClock,
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

const financialsMenu = {
  name: "Financials",
  href: "#",
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

export default function Sidebar({ open, setOpen }) {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isMenuExpanded = (menuName) => {
    return expandedMenus[menuName];
  };

  const renderMenuItem = (item, level = 0, setOpen) => {
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = isMenuExpanded(item.name);

    return (
      <div key={item.name}>
        {hasSubItems ? (
          <button
            onClick={() => toggleMenu(item.name)}
            className={`w-full text-left text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md ${
              level > 0 ? `pl-${level * 4 + 2}` : ""
            }`}
          >
            <span className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6">
              {typeof item.icon === "string" ? (
                item.icon
              ) : (
                <item.icon className="h-4 w-4" />
              )}
            </span>
            <span className="flex-1">{item.name}</span>
            {hasSubItems && (
              <span className="text-gray-400">
                {isExpanded ? (
                  <FaChevronDown className="h-3 w-3" />
                ) : (
                  <FaChevronRight className="h-3 w-3" />
                )}
              </span>
            )}
          </button>
        ) : (
          <a
            href={item.href}
            className="text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
            onClick={() => setOpen(false)}
          >
            <span className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6">
              {typeof item.icon === "string" ? (
                item.icon
              ) : (
                <item.icon className="h-4 w-4" />
              )}
            </span>
            {item.name}
          </a>
        )}

        {hasSubItems && isExpanded && (
          <div className="ml-4 space-y-1">
            {item.items.map((subItem) => (
              <div key={subItem.name}>
                {subItem.href ? (
                  <a
                    href={subItem.href}
                    className="text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md ml-4"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-5 w-5">
                      {typeof subItem.icon === "string" ? (
                        subItem.icon
                      ) : (
                        <subItem.icon className="h-3 w-3" />
                      )}
                    </span>
                    {subItem.name}
                  </a>
                ) : (
                  renderMenuItem(subItem, level + 1, setOpen)
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </TransitionChild>

        <div className="fixed inset-0 z-40 flex">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              <TransitionChild
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <FaTimes
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </TransitionChild>
              <div className="flex flex-shrink-0 items-center px-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {" "}
                    <img
                      src="/images/logo.png"
                      alt="BSGC Logo"
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />{" "}
                  </span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  BSGC
                </span>
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="px-2">
                  <div className="space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6">
                          {item.icon}
                        </span>
                        {item.name}
                      </a>
                    ))}

                    {/* Financials Menu */}
                    <div className="pt-4 border-t border-gray-200">
                      {renderMenuItem(financialsMenu, 0, setOpen)}
                    </div>
                  </div>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
          <div className="w-14 flex-shrink-0" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
