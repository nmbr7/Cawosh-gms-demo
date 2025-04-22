import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function Header() {
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const toggleMessages = () => setShowMessages(!showMessages);
  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);

  return (
    <header className="flex items-center justify-between p-4 bg-white text-black shadow-md">
      {/* Left section - Greeting */}
      <div>
        <h1 className="text-xl font-bold">Hi, {user?.firstName} {user?.lastName}</h1>
        <p className="text-sm">Let's check your Garage today</p>
      </div>

      {/* Center section - Search and notifications */}
      <div className="flex-1 flex items-center justify-center max-w-3xl mx-auto">
        <div className="flex items-center">
          <div className="relative w-[400px]">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2.5 rounded-lg bg-gray-200 text-black pl-10 pr-10"
              onFocus={() => console.log('Focus search')}
            />
            <span className="absolute right-4 top-2.5 text-gray-500">⌘ K</span>
          </div>
          <div className="flex items-center space-x-6 ml-8">
            <div className="relative">
              <button onClick={toggleMessages}>
                <Mail className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {showMessages && <div className="absolute bg-white text-black p-4 shadow-lg rounded-md">Mock Messages</div>}
            </div>
            <div className="relative">
              <button onClick={toggleNotifications}>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {showNotifications && <div className="absolute bg-white text-black p-4 shadow-lg rounded-md">Mock Notifications</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Right section - Profile */}
      <div className="relative flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
        <div className="flex flex-col">
          <span>{user?.firstName} {user?.lastName}</span>
          <span className="text-sm text-gray-500">{user?.role}</span>
        </div>
        <button onClick={toggleProfileMenu}>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black p-4 shadow-lg rounded-md">
              <button onClick={() => router.push('/profile')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Profile</button>
              <button onClick={() => router.push('/settings')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Settings</button>
              <button onClick={() => router.push('/logout')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Logout</button>
            </div>
          )}
        </button>
      </div>
    </header>
  );
} 