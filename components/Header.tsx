import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { Search } from "lucide-react";
import { MagnifyingGlass, ChatTeardropText, BellRinging } from "phosphor-react";
import { useAuthStore } from "@/store/auth";
import Image from "next/image";
import { HamburgerMenu } from "./MobileMenu";

export default function Header() {
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const toggleMessages = () => setShowMessages(!showMessages);
  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex flex-wrap md:flex-nowrap items-center justify-between p-4 bg-white text-black shadow-md min-w-full">
      {" "}
      {/* Left section - Greeting */}
      {isMobile && <HamburgerMenu />}
      <div className="w-full flex flex-row md:w-auto md:order-2 order-3">
        <div>
          <h1 className="text-xl font-bold">
            Hi, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-sm">Let&apos;s check your Garage today</p>
        </div>
      </div>
      {/* Center section - Search and notifications */}
      <div className="flex-1 flex items-center justify-center max-w-3xl mx-auto w-full md:w-auto order-5 md:order-2 mt-2 md:mt-0">
        <div className="flex items-center h-full">
          <div className="relative w-full md:w-[400px]  flex items-center">
            <MagnifyingGlass
              className="absolute left-3 text-gray-400"
              size={22}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2.5 rounded-lg bg-gray-200 text-black pl-10 pr-10"
              onFocus={() => console.log("Focus search")}
            />
            <span className="absolute right-4  text-gray-500">⌘ K</span>
          </div>
          <div className="flex items-center space-x-6 ml-8">
            <div className="relative">
              <button onClick={toggleMessages}>
                <ChatTeardropText size={22} />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {showMessages && (
                <div className="absolute bg-white text-black p-4 shadow-lg rounded-md transform -translate-x-full md:translate-x-0">
                  Mock Messages
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={toggleNotifications}>
                <BellRinging size={22} />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full transform -translate-x-full md:translate-x-0"></span>
              </button>
              {showNotifications && (
                <div className="absolute bg-white text-black p-4 shadow-lg rounded-md">
                  Mock Notifications
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Right section - Profile */}
      <div className="relative flex flex-row-reverse md:flex-row  space-x-3 w-1/2 md:w-auto order-2 md:order-3">
        {user?.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt="User Avatar"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-gray-700 mr-0">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-gray-800">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-xs text-gray-500">{user?.role}</span>
        </div>
        <button onClick={toggleProfileMenu}>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black p-4 shadow-lg rounded-md">
              <button
                onClick={() => router.push("/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
              >
                Profile
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
              >
                Settings
              </button>
              <button
                onClick={() => router.push("/logout")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
