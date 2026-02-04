"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
// import { MoreHorizontal } from "lucide-react";
import d1 from "@/public/images/signin/d1.png"
import logo from "@/public/images/logo1/logo.webp"
// import user from "@/public/images/user/user-01.jpg"
// import LL from "@/public/images/logo/LL.png"

import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  Bell,
  Building2,
  ChevronDownIcon,
  ClipboardList,
  GridIcon,
  LayoutDashboard,
  MessageCircle,
  // HorizontaLDots,
 
  Ticket,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { FaTrophy } from "react-icons/fa";
// import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    setRole(storedRole);
  }, []);
  const navItems: NavItem[] =
    role === "Customer Support"
      ? [
        {
          name: "Ticket",
            icon: <Ticket />,
          subItems: [{ name: "My Ticket", path: "/myticket", pro: false },
          //  { name: "Received Ticket", path: "/receivedticket", pro: false },
        //  { name: "Sent Ticket", path: "/sentticket", pro: false },
          // { name: "Assign Ticket", path: "/assignticket", pro: false },
          { name: "View Ticket", path: "/ticket", pro: false },
          { name: "Create Ticket", path: "/createticket", pro: false },

          ],
        },
        {
          name: "Coaches",
          icon: <UserCheck />,
          subItems: [{ name: "Active Coach", path: "/coach", pro: false },
          { name: "Suspended Coach", path: "/suspend", pro: false },
          { name: "Disable Coach", path: "/disablecoach", pro: false },
          ],
        },
        {
          name: "Players",
          icon: <User/>,
          subItems: [{ name: "Active Player", path: "/player", pro: false },
          { name: "InActive Player", path: "/inactiveplayer", pro: false },
          { name: "Suspended Player", path: "/suspendplayer", pro: false },
          { name: "Disable Player", path: "/disableplayer", pro: false },

          ],
        },
        {
          name: "Organizations",
                     icon: <Building2 />,
          subItems: [
            { name: "Active Organizations", path: "/organization", pro: false },
            { name: "Suspended Organization", path: "/suspendorg", pro: false },
            { name: "Disable Organization", path: "/disableorg", pro: false },

          ],
        },
           {
            icon:<MessageCircle/>,
            name: "Chat",
            subItems: [
              { name: "View Chat", path: "/chats", pro: false },
            ],
          },
      ]
      : role === "Admin"
        ? [
          {
            icon: <LayoutDashboard />,
            name: "Dashboard",
            path: "/dashboard",
          },
          {
            name: "Coaches",
            icon: <UserCheck />,
            subItems: [{ name: "Unapproved Coach", path: "/newcoach", pro: false },
            { name: "Incomplete Coaches", path: "/incompletecoach", pro: false },
            { name: "Active Coach", path: "/coach", pro: false },
            { name: "Decline Coach", path: "/declinecoach", pro: false },
            { name: "Suspended Coach", path: "/suspend", pro: false },
            { name: "Disable Coach", path: "/disablecoach", pro: false },
            ],
          },
          {
            name: "Players",
            icon: <User />,
            subItems: [
              { name: "Incomplete Players", path: "/incompleteplayer", pro: false },
              { name: "Active Player", path: "/player", pro: false },
              { name: "InActive Player", path: "/inactiveplayer", pro: false },
              { name: "Suspended Player", path: "/suspendplayer", pro: false },
              { name: "Disable Player", path: "/disableplayer", pro: false },

            ],
          },
          {
            name: "Organizations",
            icon: <Building2 />,
            subItems: [
              { name: "Active Organizations", path: "/organization", pro: false },
              { name: "Suspended Organization", path: "/suspendorg", pro: false },
              { name: "Disable Organization", path: "/disableorg", pro: false },

            ],
          },
          {
            name: "Teams",
            icon: <Users />,
            subItems: [{ name: "Active Team", path: "/team", pro: false },
            { name: "Suspended Team", path: "/suspendteam", pro: false },
            { name: "Disable Team", path: "/disableteam", pro: false },

            ],
          },
           {
            icon:<MessageCircle/>,
            name: "Chat",
            subItems: [
              { name: "View Chat", path: "/chats", pro: false },
            ],
          },
          {
            name: "Notifications",
            icon: <Bell />,
            subItems: [
              { name: "Send Notification", path: "/notification", pro: false },
              { name: "View Notification", path: "/viewnotification", pro: false },
            ],
          },
          {
            name: "Staff",
            icon: <ClipboardList />,
            subItems: [
              { name: "Add", path: "/subadmin", pro: false },
              { name: "View", path: "/view", pro: false },
            ],
          },
          {
            name: "Ticket",
            icon: <Ticket />,
            subItems: [
              // { name: "My Ticket", path: "/myticket", pro: false },
            { name: "Assign Ticket", path: "/assignticket", pro: false },
        //  { name: "Sent Ticket", path: "/sentticket", pro: false },
            { name: "View Ticket", path: "/ticket", pro: false },
            { name: "Create Ticket", path: "/createticket", pro: false },

            ],
          },
          // {
          //   name: "Accounting",
          //   icon: <FaWallet />,
          //   subItems: [
          //     { name: "Add Category", path: "/category", pro: false },
          //     { name: "Add Expense", path: "/expense", pro: false },
          //   ],
          // },
           {
            name: "Ranking",
            icon: <FaTrophy />,
            subItems: [
              { name: " Add Ranking", path: "/ranking", pro: false },
              { name: " View Ranking", path: "/viewranking", pro: false },
            ],
          },
            {
            name: "Payment",
            icon: <FaTrophy />,
            subItems: [
              { name: " Refunded", path: "/refunded", pro: false },
              { name: " Captured", path: "/captured", pro: false },
              { name: "Authorized", path: "/authorize", pro: false },
              { name: "Pending", path: "/pending", pro: false},
              { name: "Free", path: "/released", pro: false},
              { name: "Cancelled", path: "/canceled", pro: false },
              { name: "Failed", path: "/failed", pro: false },
            ],
          },
          {
            icon: <GridIcon />,
            name: "Block List",
            path: "/blocks",
          },

        ]
        : role === "Manager"
          ? [
            {
              icon: <LayoutDashboard />,
              name: "Dashboard",
              path: "/dashboard",
            },
        
            {
              name: "Coaches",
                          icon: <UserCheck />,
              subItems: [{ name: "Active Coach", path: "/coach", pro: false }],
            },
            {
              name: "Players",
              icon: <User/>,
              subItems: [{ name: "Active Player", path: "/player", pro: false }],
            },
            {
              name: "Organizations",
            icon: <Building2 />,
              subItems: [
                { name: "View Organizations", path: "/organization", pro: false },
              ],
            },
            {
              name: "Teams",
                         icon: <Users />,
              subItems: [{ name: "View Team", path: "/team", pro: false }],
            },
            {
              name: "Ticket",
            icon: <Ticket />,
              subItems: [{ name: "My Ticket", path: "/myticket", pro: false },
                // { name: "Received Ticket", path: "/receivedticket", pro: false },
        //  { name: "Sent Ticket", path: "/sentticket", pro: false },
              { name: "Assign Ticket", path: "/assignticket", pro: false },
              { name: "View Ticket", path: "/ticket", pro: false },
              { name: "Create Ticket", path: "/createticket", pro: false },

              ],
            },

            {
              name: "Payment",
              icon: <FaTrophy />,
              subItems: [
                { name: " Refunded", path: "/refunded", pro: false },
                { name: " Captured", path: "/captured", pro: false },
                { name: "Authorized", path: "/authorize", pro: false },
                { name: "Pending", path: "/pending", pro: false},
                { name: "Free", path: "/released", pro: false},
                { name: "Cancelled", path: "/canceled", pro: false },
                { name: "Failed", path: "/failed", pro: false },
              ],
            },

          ]
          : role === "Executive Level"
            ? [

              {
                icon: <LayoutDashboard />,
                name: "Dashboard",
                path: "/dashboard",
              },
              {
                name: "Coaches",
            icon: <UserCheck />,
                subItems: [{ name: "Unapproved Coach", path: "/newcoach", pro: false },
                { name: "Incomplete Coaches", path: "/incompletecoach", pro: false },
                { name: "Active Coach", path: "/coach", pro: false },
                { name: "Decline Coach", path: "/declinecoach", pro: false },
                { name: "Suspended Coach", path: "/suspend", pro: false },
                { name: "Disable Coach", path: "/disablecoach", pro: false },
                ],
              },
              {
                name: "Players",
                icon: <User />,
                subItems: [{ name: "Incomplete Players", path: "/incompleteplayer", pro: false },
                { name: "Active Player", path: "/player", pro: false },
              { name: "InActive Player", path: "/inactiveplayer", pro: false },
                { name: "Suspended Player", path: "/suspendplayer", pro: false },
                { name: "Disable Player", path: "/disableplayer", pro: false },

                ],
              },
              {
                name: "Organizations",
            icon: <Building2 />,
                subItems: [
                  { name: "Active Organizations", path: "/organization", pro: false },
                  { name: "Suspended Organization", path: "/suspendorg", pro: false },
                  { name: "Disable Organization", path: "/disableorg", pro: false },

                ],
              },
              {
                name: "Teams",
            icon: <Users />,
                subItems: [{ name: "Active Team", path: "/team", pro: false },
                { name: "Suspended Team", path: "/suspendteam", pro: false },
                { name: "Disable Team", path: "/disableteam", pro: false },

                ],
              },
              {
                name: "Notifications",
            icon: <Bell />,
                subItems: [
                  { name: "View Notification", path: "/notification", pro: false },
                ],
              },
              {
                name: "Staff",
            icon: <ClipboardList />,
                subItems: [
                  { name: "Add", path: "/subadmin", pro: false },
                  { name: "View", path: "/view", pro: false },
                ],
              },
              {
                name: "Ticket",
            icon: <Ticket />,
                subItems: [{ name: "My Ticket", path: "/myticket", pro: false },
                  // { name: "Received Ticket", path: "/receivedticket", pro: false },
        //  { name: "Sent Ticket", path: "/sentticket", pro: false },
                { name: "Assign Ticket", path: "/assignticket", pro: false },
                { name: "View Ticket", path: "/ticket", pro: false },
                { name: "Create Ticket", path: "/createticket", pro: false },
                ],
              },
              {
                name: "Payment",
                icon: <FaTrophy />,
                subItems: [
                  { name: " Refunded", path: "/refunded", pro: false },
                  { name: " Captured", path: "/captured", pro: false },
                  { name: "Authorized", path: "/authorize", pro: false },
                  { name: "Pending", path: "/pending", pro: false},
                  { name: "Free", path: "/released", pro: false},
                  { name: "Cancelled", path: "/canceled", pro: false },
                  { name: "Failed", path: "/failed", pro: false },
                ],
              },
              {
                icon: <GridIcon />,
                name: "Block List",
                path: "/blocks",
              },
            ]
            : role === "Tech"
              ? [
                {
                  name: "Ticket",
            icon: <Ticket />,
                  subItems: [{ name: "My Ticket", path: "/myticket", pro: false },
                    // { name: "Received Ticket", path: "/receivedticket", pro: false },
        //  { name: "Sent Ticket", path: "/sentticket", pro: false },
                  { name: "Assign Ticket", path: "/assignticket", pro: false },
                  { name: "View Ticket", path: "/ticket", pro: false },
              { name: "Create Ticket", path: "/createticket", pro: false },

                  ],
                },
                {
                  name: "Coaches",
            icon: <UserCheck />,
                  subItems: [{ name: "Incomplete Coaches", path: "/incompletecoach", pro: false },
                  { name: "Active Coach", path: "/coach", pro: false },
                  { name: "Suspended Coach", path: "/suspend", pro: false },
                  { name: "Disable Coach", path: "/disablecoach", pro: false },
                  ],
                },
                {
                  name: "Players",
                  icon: <User />,
                  subItems: [{ name: "Incomplete Players", path: "/incompleteplayer", pro: false },
                  { name: "Active Player", path: "/player", pro: false },
              { name: "InActive Player", path: "/inactiveplayer", pro: false },
                  { name: "Suspended Player", path: "/suspendplayer", pro: false },
                  { name: "Disable Player", path: "/disableplayer", pro: false },

                  ],
                },
                {
                  name: "Organizations",
                           icon: <Building2 />,

                  subItems: [
                    { name: "Active Organizations", path: "/organization", pro: false },
                    { name: "Suspended Organization", path: "/suspendorg", pro: false },
                    { name: "Disable Organization", path: "/disableorg", pro: false },

                  ],
                },
              ]

              : [];



  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // useEffect(() => {
  //   // Check if the current path matches any submenu item
  //   let submenuMatched = false;
  //   ["main", "others"].forEach((menuType) => {
  //     const items = menuType === "main" ? navItems : othersItems;
  //     items.forEach((nav, index) => {
  //       if (nav.subItems) {
  //         nav.subItems.forEach((subItem) => {
  //           if (isActive(subItem.path)) {
  //             setOpenSubmenu({
  //               type: menuType as "main" | "others",
  //               index,
  //             });
  //             submenuMatched = true;
  //           }
  //         });
  //       }
  //     });
  //   });

  //   // If no submenu item matches, close the open submenu
  //   if (!submenuMatched) {
  //     setOpenSubmenu(null);
  //   }
  // }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;

      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              {/* <div className="w-40 h-40 overflow-hidden "> */}
              <Image
                className="dark:hidden"
                src={logo}
                alt="Logo123"
                width={140}

                height={40}
              />
              {/* </div> */}
              <Image
                className="hidden dark:block"
                src={d1}
                alt="Logo2"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src={d1}
              alt="Logo3"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              {(isExpanded || isHovered || isMobileOpen) && (
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
                >
                  Menu
                </h2>
              )}

              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              {(isExpanded || isHovered || isMobileOpen) && (
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
                >

                </h2>
              )}

              {/* {renderMenuItems(othersItems, "others")} */}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
