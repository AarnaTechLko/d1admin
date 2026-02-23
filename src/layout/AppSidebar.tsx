"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo1/logo.webp";
import d1 from "@/public/images/signin/d1.png";
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
  Ticket,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { FaTrophy } from "react-icons/fa";

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
    const storedRole = sessionStorage.getItem("role") || "Admin"; // fallback
    setRole(storedRole);
  }, []);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  useEffect(() => {
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

  // ==========================
  // Define all navItems per role
  // ==========================
  const navItems: NavItem[] =
    role === "Customer Support"
      ? [
          {
            name: "Ticket",
            icon: <Ticket />,
            subItems: [
              { name: "My Ticket", path: "/myticket" },
              { name: "View Ticket", path: "/ticket" },
              { name: "Create Ticket", path: "/createticket" },
            ],
          },
          {
            name: "Coaches",
            icon: <UserCheck />,
            subItems: [
              { name: "Active Coach", path: "/coach" },
              { name: "Suspended Coach", path: "/suspend" },
              { name: "Disable Coach", path: "/disablecoach" },
            ],
          },
          {
            name: "Players",
            icon: <User />,
            subItems: [
              { name: "Active Player", path: "/player" },
              { name: "InActive Player", path: "/inactiveplayer" },
              { name: "Suspended Player", path: "/suspendplayer" },
              { name: "Disable Player", path: "/disableplayer" },
            ],
          },
          {
            name: "Organizations",
            icon: <Building2 />,
            subItems: [
              { name: "Active Organizations", path: "/organization" },
              { name: "Suspended Organization", path: "/suspendorg" },
              { name: "Disable Organization", path: "/disableorg" },
            ],
          },
          {
            name: "Chat",
            icon: <MessageCircle />,
            subItems: [{ name: "View Chat", path: "/chats" }],
          },
        ]
      : role === "Admin"
      ? [
          {
            name: "Dashboard",
            icon: <LayoutDashboard />,
            path: "/dashboard",
          },
          {
            name: "Coaches",
            icon: <UserCheck />,
            subItems: [
              { name: "Pending Approvals", path: "/newcoach" },
              { name: "Incomplete Coaches", path: "/incompletecoach" },
              { name: " Active/Approved Coaches", path: "/coach" },
              { name: "Unapproved Coaches", path: "/declinecoach" },
              { name: "Suspended Coach", path: "/suspend" },
              { name: "Disable Coach", path: "/disablecoach" },
            ],
          },
          {
            name: "Players",
            icon: <User />,
            subItems: [
              { name: "Incomplete Players", path: "/incompleteplayer" },
              { name: "Active Player", path: "/player" },
              { name: "Inactive Players", path: "/inactiveplayer" },
              { name: "Suspended Player", path: "/suspendplayer" },
              { name: "Disabled Players", path: "/disableplayer" },
            ],
          },
          {
            name: "Organizations",
            icon: <Building2 />,
            subItems: [
              { name: "Active Organizations", path: "/organization" },
              { name: "Suspended Organization", path: "/suspendorg" },
              { name: "Disable Organization", path: "/disableorg" },
            ],
          },
          {
            name: "Teams",
            icon: <Users />,
            subItems: [
              { name: "Active Team", path: "/team" },
              { name: "Suspended Team", path: "/suspendteam" },
              { name: "Disable Team", path: "/disableteam" },
            ],
          },
          {
            name: "Chat",
            icon: <MessageCircle />,
            subItems: [{ name: "View Chat", path: "/chats" }],
          },
          {
            name: "Notifications",
            icon: <Bell />,
            subItems: [
              { name: "Send Notification", path: "/notification" },
              { name: "View Notification", path: "/viewnotification" },
            ],
          },
          {
            name: "Staff",
            icon: <ClipboardList />,
            subItems: [
              { name: "Add", path: "/subadmin" },
              { name: "View", path: "/view" },
            ],
          },
          {
            name: "Ticket",
            icon: <Ticket />,
            subItems: [
              { name: "Assign Ticket", path: "/assignticket" },
              { name: "View Ticket", path: "/ticket" },
              { name: "Create Ticket", path: "/createticket" },
            ],
          },
          {
            name: "Ranking",
            icon: <FaTrophy />,
            subItems: [
              { name: "Add Ranking", path: "/ranking" },
              { name: "View Ranking", path: "/viewranking" },
            ],
          },
          {
            name: "Payment",
            icon: <FaTrophy />,
            subItems: [
              { name: "Refunded", path: "/refunded" },
              { name: "Captured", path: "/captured" },
              { name: "Authorized", path: "/authorize" },
              { name: "Pending", path: "/pending" },
              { name: "Free", path: "/released" },
              { name: "Cancelled", path: "/canceled" },
              { name: "Failed", path: "/failed" },
            ],
          },
          {
            name: "Block List",
            icon: <GridIcon />,
            path: "/blocks",
          },
        ]
      : []; // Add other roles (Manager, Executive, Tech) as you already have

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group cursor-pointer ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            <Link
              href={nav.path!}
              className={`menu-item group ${
                isActive(nav.path!) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`${
                  isActive(nav.path!)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
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
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
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

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image src={logo} alt="Logo" width={140} height={40} className="dark:hidden" />
              <Image src={d1} alt="Logo Dark" width={150} height={40} className="hidden dark:block" />
            </>
          ) : (
            <Image src={d1} alt="Logo Small" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              {(isExpanded || isHovered || isMobileOpen) && (
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  Menu
                </h2>
              )}
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
