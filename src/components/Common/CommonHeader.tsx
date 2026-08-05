import { useMenuSidebar } from "@/stores/useMenuSidebar";
import { Icon } from "@mdi/react";
import { useUser } from "@/context/useUserContext";
import { useMe } from "@/hooks/useAuth";
import { mdiBell, mdiCog, mdiThemeLightDark, mdiLogout, mdiStarFourPoints } from "@mdi/js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { HamburgerMenu } from "iconsax-reactjs";

export default function CommonHeader() {
  const { toggle } = useMenuSidebar();
  const { logoutUser } = useUser();
  const { data: profileResponse } = useMe();
  const profile = profileResponse?.data;

  return (
    <>
      <div
        className="w-full fixed top-0 left-0 right-0 z-50
      p-3 md:p-4 px-4 bg-darkCardV1 border-b border-b-darkBorderV1 flex justify-between items-center h-[78px]"
      >
        <div className="flex items-center w-fit md:w-[250px] justify-between gap-3 md:gap-4">
          <button
            onClick={toggle}
            className="bg-darkBorderV1 flex items-center justify-center hover:bg-darkBorderV1/70 !text-neutral-300/70 !p-0 !h-10 !w-10 rounded-full md:hidden flex-shrink-0"
          >
            <HamburgerMenu size="20" color="#fff" />
          </button>
          <Link target="_blank" href="https://giaiphaptudongdien.com/" className="flex items-center select-none">
            <Image quality={100} draggable={false} src="/images/logo2.webp" width={1000} height={1000} alt="Logo" className="h-12 md:w-full md:h-full object-contain rounded" />
          </Link>
        </div>
        <div className="bg-darkBorderV1 h-10 w-full flex-1 rounded-lg relative overflow-hidden hidden md:flex items-center shadow-[inset_0_0_10px_rgba(68,215,182,0.05)]">
          <div className="flex animate-marquee-header items-center select-none">
            <div className="flex items-center px-12 gap-3 md:gap-4">
              <span className="marquee-premium-text">CÔNG TY TNHH GIẢI PHÁP TỰ ĐỘNG ĐIỆN</span>
              <span className="marquee-premium-text">ELECTRIC</span>
              <Icon path={mdiStarFourPoints} size={0.8} className="text-[#41C651] animate-pulse" />
              <span className="marquee-premium-text">AUTOMATION</span>
              <Icon path={mdiStarFourPoints} size={0.8} className="text-[#41C651] animate-pulse" />
              <span className="marquee-premium-text">SOLUTION</span>
            </div>
            <div className="flex items-center px-12 gap-3 md:gap-4">
              <span className="marquee-premium-text">CÔNG TY TNHH GIẢI PHÁP TỰ ĐỘNG ĐIỆN</span>
              <span className="marquee-premium-text">ELECTRIC</span>
              <Icon path={mdiStarFourPoints} size={0.8} className="text-[#41C651] animate-pulse" />
              <span className="marquee-premium-text">AUTOMATION</span>
              <Icon path={mdiStarFourPoints} size={0.8} className="text-[#41C651] animate-pulse" />
              <span className="marquee-premium-text">SOLUTION</span>
            </div>
          </div>
          {/* Edge Fading Masks for Premium Look */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-darkCardV1 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-darkCardV1 to-transparent z-10 pointer-events-none" />
        </div>
        <div className="flex items-center gap-3 md:gap-4 ml-4">
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm text-neutral-300 font-semibold">
                👋 Xin chào, {profile?.user?.position || profile?.role || "Quản trị viên"}
              </span>
              <span className="text-xs font-semibold text-primary">
                {profile?.user?.fullName || profile?.fullName || profile?.username || "Admin"}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/70 shadow-[0_0_15px_rgba(68,215,182,0.2)] p-0.5 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                  <img
                    src={profile?.user?.avatar || `https://api.dicebear.com/9.x/bottts/svg?seed=${profile?.username || "Sophie"}`}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-darkCardV1 border-darkBorderV1 text-neutral-300" align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-semibold">{profile?.user?.fullName || profile?.fullName || profile?.username || "Admin"}</span>
                  <span className="text-xs text-neutral-300 font-normal">@{profile?.username || "admin"}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-darkBorderV1" />
                <DropdownMenuItem className="bg-transparent hover:!bg-primary/10 hover:!text-primary transition-colors cursor-pointer gap-2">
                  <Icon path={mdiThemeLightDark} size={0.8} className="flex-shrink-0" />
                  <span>Chế độ sáng/tối</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="bg-transparent hover:!bg-primary/10 hover:!text-primary transition-colors cursor-pointer gap-2">
                  <Icon path={mdiCog} size={0.8} className="flex-shrink-0" />
                  <span>Cài đặt hệ thống</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="bg-transparent hover:!bg-primary/10 hover:!text-primary transition-colors cursor-pointer gap-2">
                  <Icon path={mdiBell} size={0.8} className="flex-shrink-0" />
                  <span>Thông báo</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-darkBorderV1" />
                <DropdownMenuItem
                  onClick={logoutUser}
                  className="bg-transparent hover:!bg-red-500/10 hover:!text-red-400 transition-colors cursor-pointer gap-2 text-red-400"
                >
                  <Icon path={mdiLogout} size={0.8} className="flex-shrink-0" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}
