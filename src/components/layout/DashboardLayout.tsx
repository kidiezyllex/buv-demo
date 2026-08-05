"use client"

import {
  Drawer, DrawerContent
} from "@/components/ui/drawer";
import { RippleEffect } from "@/components/ui/ripple-effect";
import { useUser } from "@/context/useUserContext";
import { useResponsive } from "@/hooks/use-mobile";
import type { MenuItem } from "@/interface/types";
import { cn } from "@/lib/utils";
import { useMenuSidebar } from "@/stores/useMenuSidebar";
import { mdiFullscreen, mdiFullscreenExit } from "@mdi/js";
import { Icon } from "@mdi/react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { getDashboardMenuItems } from "./dashboardMenuItems";

const CommonHeader = dynamic(() => import("../Common/CommonHeader"), {
  ssr: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  if (isTablet) {
    return <TabletLayout>{children}</TabletLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}

function DesktopLayout({ children }: { children: React.ReactNode }) {
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { isOpen, toggle } = useMenuSidebar();
  const { profile } = useUser();
  const permissions = profile?.data?.permissions || [];
  const role = profile?.data?.role;
  const dashboardMenuItems: MenuItem[] = getDashboardMenuItems(permissions, role);

  const isMenuActive = (menu: MenuItem) => {
    if (menu.path && pathname === menu.path) return true;
    return false;
  };

  const handleMouseEnter = (menuId: string) => {
    if (!isOpen) setHoverMenu(menuId);
  };

  const handleMouseLeave = () => setHoverMenu(null);

  const handleMenuClick = (menu: MenuItem) => {
    if (menu.subMenu && menu.subMenu.length > 0) {
      setExpandedMenu(expandedMenu === menu.id ? null : menu.id);
    }
  };

  return (
    <div className="min-h-screen bg-darkBackgroundV1" suppressHydrationWarning>
      <CommonHeader />
      <div className="flex overflow-y-auto pt-[78px]">
        <div
          className={cn(
            "bg-darkBackgroundV1 transition-all duration-300 flex-shrink-0 sticky top-[78px] h-[calc(100vh-78px)] self-start",
            isOpen
              ? "w-[250px]"
              : "w-0 md:w-16 overflow-hidden flex justify-center",
          )}
        >
          <div className="flex flex-col h-full bg-darkBackgroundV1">
            <nav className="flex-1 overflow-y-auto py-4 bg-darkBackgroundV1 custom-scrollbar">
              <ul className={cn("", isOpen ? "pr-0 pl-2" : "pr-0")}>
                {dashboardMenuItems.map((menu) => (
                  <li key={menu.id}>
                    <div
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(menu.id)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleMenuClick(menu)}
                    >
                      {!menu.subMenu || menu.subMenu.length === 0 ? (
                        <Link href={menu.path}>
                          <RippleEffect
                            rippleColor="rgba(68, 215, 182, 0.3)"
                            duration={500}
                          >
                            <div
                              className={cn(
                                "flex items-center rounded-lg p-[10px] h-[46px] text-sm font-semibold transition-all duration-300 border cursor-pointer",
                                isMenuActive(menu)
                                  ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(65,198,81,0.1)]"
                                  : "text-neutral-300/70 border-transparent hover:bg-primary/5 hover:text-primary/80 hover:border-primary/10",
                                !isOpen && "!justify-center w-[46px]",
                              )}
                            >
                              <div
                                className={cn(
                                  "!w-7 !h-7 flex-shrink-0 rounded-md flex items-center justify-center transition-colors",
                                  isMenuActive(menu)
                                    ? "bg-primary/20"
                                    : "bg-darkBorderV1",
                                  isOpen ? "mr-2" : "mr-0",
                                )}
                              >
                                <Icon
                                  path={menu.icon}
                                  size={0.8}
                                  className={cn(
                                    isMenuActive(menu)
                                      ? "text-primary flex-shrink-0"
                                      : "text-neutral-300/70 flex-shrink-0",
                                  )}
                                />
                              </div>
                              {isOpen && (
                                <span className="text-nowrap text-sm">
                                  {menu.name}
                                </span>
                              )}
                            </div>
                          </RippleEffect>
                        </Link>
                      ) : (
                        <RippleEffect
                          rippleColor="rgba(68, 215, 182, 0.3)"
                          duration={500}
                        >
                          <div
                            className={cn(
                              "flex items-center rounded-lg p-[10px] h-[46px] text-sm font-semibold transition-all duration-300 border cursor-pointer",
                              isMenuActive(menu)
                                ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(65,198,81,0.1)]"
                                : "text-neutral-300/70 border-transparent hover:bg-primary/5 hover:text-primary/80 hover:border-primary/10",
                              !isOpen && "!justify-center w-[46px]",
                            )}
                          >
                            <div
                              className={cn(
                                "!w-7 !h-7 flex-shrink-0 rounded-md flex items-center justify-center transition-colors",
                                isMenuActive(menu)
                                  ? "bg-primary/20"
                                  : "bg-darkBorderV1",
                                isOpen ? "mr-2" : "mr-0",
                              )}
                            >
                              <Icon
                                path={menu.icon}
                                size={0.8}
                                className={cn(
                                  isMenuActive(menu)
                                    ? "text-primary flex-shrink-0"
                                    : "text-neutral-300/70 flex-shrink-0",
                                )}
                              />
                            </div>
                            {isOpen && (
                              <span className="text-nowrap flex items-center justify-between gap-1 flex-1">
                                {menu.name}
                                {expandedMenu === menu.id ? (
                                  <IconChevronUp size={18} className="ml-1" />
                                ) : (
                                  <IconChevronDown size={18} className="ml-1" />
                                )}
                              </span>
                            )}
                          </div>
                        </RippleEffect>
                      )}
                      {isOpen && menu.subMenu && menu.subMenu.length > 0 && (
                        <AnimatePresence initial={false}>
                          {expandedMenu === menu.id && (
                            <motion.ul
                              className="ml-4 mt-1"
                              initial="collapsed"
                              animate="open"
                              exit="collapsed"
                              variants={{
                                open: { opacity: 1, height: "auto" },
                                collapsed: { opacity: 0, height: 0 },
                              }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              style={{ overflow: "hidden" }}
                            >
                              {menu.subMenu.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={sub.path}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <RippleEffect
                                      rippleColor="rgba(68, 215, 182, 0.2)"
                                      duration={400}
                                    >
                                      <div
                                        className={cn(
                                          "flex items-center rounded-lg p-[8px] h-[38px] text-sm font-semibold transition-all duration-300 border cursor-pointer",
                                          pathname === sub.path
                                            ? "bg-primary/10 text-primary border-primary/20"
                                            : "text-neutral-300/70 border-transparent hover:bg-primary/5 hover:text-primary/80 hover:border-primary/10",
                                        )}
                                      >
                                        <Icon
                                          path={sub.icon || ""}
                                          size={0.8}
                                          className={cn(
                                            pathname === sub.path
                                              ? "text-primary flex-shrink-0"
                                              : "text-neutral-300/70 flex-shrink-0",
                                            "mr-3",
                                          )}
                                        />
                                        <span>{sub.name}</span>
                                      </div>
                                    </RippleEffect>
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      )}
                      {!isOpen && hoverMenu === menu.id && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                            className="fixed ml-16 mt-[-30px] bg-darkBorderV1 border border-neutral-700 text-neutral-300 text-sm py-1.5 px-3 rounded-md z-[1000] whitespace-nowrap flex items-center"
                          >
                            <span className="w-2 h-2 rounded-full bg-primary mr-1.5"></span>
                            <span className="font-semibold text-primary">{menu.name}</span>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={cn("pb-4 w-full transition-all duration-100", isOpen ? "pl-4" : "px-0 flex justify-center")}>
              <Button
                onClick={toggle}
                size={isOpen ? "default" : "icon"}
                className={cn(
                  "bg-darkBorderV1 hover:bg-darkBorderV1/70 transition-all duration-100",
                  isOpen ? "w-full flex items-center justify-center gap-2" : "w-[46px] h-[46px] p-0 flex items-center justify-center rounded-lg"
                )}
              >
                <Icon path={isOpen ? mdiFullscreenExit : mdiFullscreen} size={0.8} className="flex-shrink-0" />
                {isOpen && <span>Đóng Sidebar</span>}
              </Button>
            </div>
          </div>
        </div>
        <main className={`flex-1 overflow-y-auto h-[calc(100vh-78px)] custom-scrollbar py-4 pr-4 ${isOpen ? "pl-2" : "px-0"}`}>
          {children}
        </main>
      </div>
    </div >
  );
}

function TabletLayout({ children }: { children: React.ReactNode }) {
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { profile } = useUser();
  const permissions = profile?.data?.permissions || [];
  const role = profile?.data?.role;
  const menuItems = getDashboardMenuItems(permissions, role);

  return (
    <div className="min-h-screen bg-darkBackgroundV1 flex flex-col">
      <CommonHeader />
      <div className="flex-1 flex mt-[78px] h-[calc(100vh-78px)] overflow-hidden">
        {/* Sidebar thu gọn: icon-only + tooltip */}
        <div className="w-16 border-r border-darkBorderV1 h-full flex flex-col items-center py-4 bg-darkBackgroundV1">
          <nav className="flex-1 w-full px-2 space-y-2">
            {menuItems.map((menu) => (
              <div
                key={menu.id}
                className="relative group"
                onMouseEnter={() => setHoverMenu(menu.id)}
                onMouseLeave={() => setHoverMenu(null)}
              >
                <Link href={menu.subMenu && menu.subMenu.length > 0 ? (menu.subMenu[0]?.path || menu.path) : menu.path}>
                  <RippleEffect rippleColor="rgba(68, 215, 182, 0.3)" duration={500}>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all border cursor-pointer",
                      pathname === menu.path || (menu.subMenu?.some(s => pathname === s.path))
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "text-neutral-300 border-transparent hover:bg-white/5 hover:text-neutral-300"
                    )}>
                      <Icon path={menu.icon} size={0.8} className="flex-shrink-0" />
                    </div>
                  </RippleEffect>
                </Link>

                <AnimatePresence>
                  {hoverMenu === menu.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute left-14 top-1/2 -translate-y-1/2 bg-darkBorderV1 text-neutral-300 text-sm py-1.5 px-3 rounded-md shadow-xl z-50 whitespace-nowrap pointer-events-none"
                    >
                      {menu.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>
        <main className="flex-1 overflow-y-auto  p-3 md:p-4 custom-scrollbar bg-darkBackgroundV1">
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileLayout({ children }: { children: React.ReactNode }) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { profile } = useUser();
  const { isOpen, toggle } = useMenuSidebar();
  const permissions = profile?.data?.permissions || [];
  const role = profile?.data?.role;
  const menuItems = getDashboardMenuItems(permissions, role);

  return (
    <div className="h-screen bg-darkBackgroundV1 flex flex-col overflow-hidden">
      <Drawer open={isOpen} onOpenChange={(val) => { if (!val && isOpen) toggle(); }} direction="left">
        <CommonHeader />
        <DrawerContent
          className="!inset-x-auto !inset-y-0 !left-0 !right-auto !mt-0 !rounded-none !rounded-r-2xl w-[300px] h-full border-r border-darkBorderV1 bg-darkCardV1 flex flex-col p-0 [&>div:first-child]:hidden"
        >
          <div className="p-3 border-b border-darkBorderV1 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center select-none">
              <div className="flex items-center -space-x-3 mr-2">
                <span className="text-3xl font-bold relative z-10" style={{ color: '#FEFE01', fontFamily: 'var(--font-serif-logo)', lineHeight: '1' }}>E</span>
                <span className="text-5xl font-bold relative z-20" style={{ color: '#0201FD', fontFamily: 'var(--font-serif-logo)', lineHeight: '1', textShadow: '0 0 15px rgba(2, 1, 253, 0.5)' }}>A</span>
                <span className="text-3xl font-bold relative z-30" style={{ color: '#FB0100', fontFamily: 'var(--font-serif-logo)', lineHeight: '1' }}>S</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {menuItems.map(item => (
              <div key={item.id}>
                {!item.subMenu || item.subMenu.length === 0 ? (
                  <Link
                    href={item.path}
                    onClick={toggle}
                  >
                    <RippleEffect rippleColor="rgba(68, 215, 182, 0.3)" duration={500}>
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all border cursor-pointer",
                        pathname === item.path
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "text-neutral-300 border-transparent hover:bg-white/5"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          pathname === item.path ? "bg-primary/20" : "bg-darkBorderV1"
                        )}>
                          <Icon path={item.icon} size={0.8} className="flex-shrink-0" />
                        </div>
                        <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                    </RippleEffect>
                  </Link>
                ) : (
                  <>
                    <RippleEffect rippleColor="rgba(68, 215, 182, 0.3)" duration={500}>
                      <button
                        className="w-full flex items-center gap-3 !p-3 rounded-xl transition-all border text-neutral-300 border-transparent hover:bg-white/5"
                        onClick={() => setExpandedMenu(expandedMenu === item.id ? null : item.id)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-darkBorderV1 flex items-center justify-center flex-shrink-0">
                          <Icon path={item.icon} size={0.8} className="flex-shrink-0" />
                        </div>
                        <span className="font-semibold text-sm flex-1 text-left">{item.name}</span>
                        <IconChevronDown
                          size={16}
                          className={cn("transition-transform duration-200", expandedMenu === item.id && "rotate-180")}
                        />
                      </button>
                    </RippleEffect>
                    <AnimatePresence initial={false}>
                      {expandedMenu === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                          className="ml-4 mt-1 space-y-1"
                        >
                          {item.subMenu.map(sub => (
                            <Link
                              key={sub.id}
                              href={sub.path}
                              onClick={toggle}
                            >
                              <RippleEffect rippleColor="rgba(68, 215, 182, 0.2)" duration={400}>
                                <div className={cn(
                                  "flex items-center gap-3 p-2.5 rounded-lg transition-all border cursor-pointer",
                                  pathname === sub.path
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "text-neutral-300 border-transparent hover:bg-white/5 hover:text-neutral-300"
                                )}>
                                  <Icon path={sub.icon || item.icon} size={0.8} className="flex-shrink-0" />
                                  <span className="text-sm">{sub.name}</span>
                                </div>
                              </RippleEffect>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>

      <main className="flex-1 mt-[78px] overflow-y-auto p-3 pb-24 md:pb-0 bg-darkBackgroundV1 custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
