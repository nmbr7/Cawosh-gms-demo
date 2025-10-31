import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  ChatTeardropText,
  BellRinging,
  CaretDown,
  Gear,
  UserCircle,
  SignOut,
} from 'phosphor-react';
import { useAuthStore } from '@/store/auth';
import Image from 'next/image';
import { HamburgerMenu } from './MobileMenu';
import { links } from './Sidebar';

import Fuse from 'fuse.js';

const fuse = new Fuse(links, {
  keys: ['name', 'href'],
  threshold: 0.35,
  minMatchCharLength: 1,
  ignoreLocation: true,
});

export default function Header() {
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);

  // Defensive: Ensure links is an array
  const safeLinks = Array.isArray(links) ? links : [];

  // Allow search if at least 1 character is entered
  let matches: typeof safeLinks = [];
  if (searchTerm.trim().length >= 1) {
    matches = fuse
      .search(searchTerm.trim())
      .slice(0, 10)
      .map((r) => r.item);
  } else if (searchTerm.trim().length === 0) {
    matches = safeLinks.slice(0, 10);
  } else {
    matches = [];
  }

  const messagesRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showMessages &&
        messagesRef.current &&
        !messagesRef.current.contains(event.target as Node)
      ) {
        setShowMessages(false);
      }
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        showProfileMenu &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        showSearchDropdown &&
        searchDropdownRef.current &&
        !(searchDropdownRef.current as HTMLElement).contains(
          event.target as Node,
        ) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
        setHighlightedIdx(0);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchDropdown(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMessages, showNotifications, showProfileMenu, showSearchDropdown]);

  useEffect(() => {
    setHighlightedIdx(0);
    // Do NOT set showSearchDropdown here, so dropdown does not open automatically on refresh/mount.
  }, [searchTerm]);

  useEffect(() => {
    if (!showSearchDropdown) return;
    const button = suggestionRefs.current[highlightedIdx];
    if (button && typeof button.scrollIntoView === 'function') {
      button.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIdx, showSearchDropdown]);

  const handleSearch = useCallback(
    (
      e:
        | React.FormEvent<HTMLFormElement>
        | React.KeyboardEvent<HTMLInputElement>
        | React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      if ('preventDefault' in e && typeof e.preventDefault === 'function')
        e.preventDefault();
      if ('stopPropagation' in e && typeof e.stopPropagation === 'function')
        e.stopPropagation();

      if (!matches || matches.length === 0) return;

      let chosen;
      if (
        e.type === 'submit' ||
        (e as React.KeyboardEvent<HTMLInputElement>).key === 'Enter'
      ) {
        chosen = matches[highlightedIdx] || matches[0];
      } else if (
        'button' === (e.target as HTMLElement)?.tagName?.toLowerCase()
      ) {
        const idx = Number((e.target as HTMLButtonElement).dataset.idx);
        chosen = matches[idx];
      }

      if (chosen) {
        setSearchTerm('');
        setHighlightedIdx(0);
        setShowSearchDropdown(false);

        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
        if (typeof chosen.href === 'string' && chosen.href.length > 0)
          router.push(chosen.href);
      }
    },
    [matches, router, highlightedIdx],
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown || !matches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => {
        const next = prev < matches.length - 1 ? prev + 1 : 0;
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((prev) => {
        const next = prev > 0 ? prev - 1 : matches.length - 1;
        return next;
      });
    } else if (e.key === 'Enter') {
      handleSearch(e);
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleSuggestionHover = (idx: number) => setHighlightedIdx(idx);
  const logout = useAuthStore((state) => state.logout);

  const handleSuggestionClick =
    (idx: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
      setHighlightedIdx(idx);
      setSearchTerm('');
      setHighlightedIdx(0);
      setShowSearchDropdown(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
      handleSearch(e);
    };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    router.refresh?.();
    router.push('/login');
  };

  // Improved message/notification list mock (could be replaced with actual data)
  const mockMessages = [
    // Example message
    {
      from: 'Anna S.',
      text: 'Hey! Your car issue was resolved 👏',
      time: '1h',
      unread: true,
      avatar: '/avatars/anna.jpg',
    },
    {
      from: 'GarageBot',
      text: 'Your invoice was paid successfully.',
      time: '3h',
      unread: false,
      avatar: '/avatars/garagebot.png',
    },
  ];
  const mockNotifications = [
    {
      title: 'Service Reminder',
      desc: 'Oil change is due for your Honda.',
      time: 'Just now',
      type: 'reminder',
      unread: true,
      icon: <BellRinging size={20} className="text-orange-400" />,
    },
    {
      title: 'Insurance Renewed',
      desc: 'Your car insurance has been renewed 🎉',
      time: '3 days ago',
      type: 'info',
      unread: false,
      icon: <BellRinging size={20} className="text-blue-400" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 h-18 flex items-center justify-between px-6 py-4 bg-white text-black w-full border-b border-gray-200">
      <div className="flex items-center min-w-0 flex-1 gap-6">
        {isMobile && <HamburgerMenu />}
        <div className="flex flex-col justify-center truncate">
          <span className="font-semibold text-xl leading-tight truncate">
            Hi, {user?.firstName} {user?.lastName}
          </span>
          <span className="text-sm text-gray-500 truncate mt-0.5">
            Let&apos;s check your Garage today
          </span>
        </div>
      </div>

      <div
        className="flex-1 mx-8 flex items-center relative"
        style={{
          maxWidth: '34rem',
          minWidth: '18rem',
        }}
      >
        <form
          className="relative w-full"
          onSubmit={handleSearch}
          autoComplete="off"
        >
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            <MagnifyingGlass className="text-gray-400" size={20} />
          </span>
          <input
            type="text"
            placeholder="Search anything…"
            className="w-full py-[0.375rem] pl-10 pr-16 rounded-lg bg-gray-100 text-black transition focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-400 text-sm"
            value={searchTerm}
            ref={searchInputRef}
            aria-label="Search"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setShowSearchDropdown(true);
            }}
            onKeyDown={handleInputKeyDown}
            style={{
              minWidth: '18rem',
              maxWidth: '34rem',
            }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[11px] bg-white px-2 rounded border border-gray-100 pointer-events-none select-none hidden md:block">
            ⌘ K
          </span>
          {showSearchDropdown && (
            <div
              ref={searchDropdownRef}
              className="absolute left-0 top-full mt-2 w-full rounded-lg shadow-lg border border-gray-100 z-30 max-h-64 overflow-auto animate-fade-in search-scrollbar"
              style={{
                background: '#fff',
                padding: '0.2rem 0.35rem 0.2rem 0.35rem',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #fff',
                minWidth: '18rem',
                maxWidth: '34rem',
              }}
            >
              <style jsx>{`
                .search-scrollbar::-webkit-scrollbar {
                  width: 4px;
                  background: #fff;
                }
                .search-scrollbar::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 7px;
                  border: none;
                }
                .search-scrollbar::-webkit-scrollbar-track {
                  background: #fff;
                  border-radius: 7px;
                }
              `}</style>
              <div className="flex items-center px-2 pt-1 pb-0">
                <span className="text-[11px] text-blue-400 font-medium">
                  Pages
                </span>
              </div>
              {matches.length > 0 ? (
                <ul
                  className="divide-y divide-gray-100"
                  role="listbox"
                  style={{
                    overflow: 'auto',
                    maxHeight: '11rem',
                  }}
                >
                  {matches.map((match, idx) => (
                    <li key={match.href || idx}>
                      <button
                        type="button"
                        ref={(el) => {
                          suggestionRefs.current[idx] = el;
                        }}
                        data-idx={idx}
                        className={`block w-full text-left px-2 py-1.5 ${
                          idx === highlightedIdx
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-blue-50 text-gray-800'
                        } focus:bg-blue-100 transition flex items-center justify-between text-xs`}
                        aria-selected={idx === highlightedIdx}
                        role="option"
                        tabIndex={-1}
                        onMouseOver={() => handleSuggestionHover(idx)}
                        onClick={handleSuggestionClick(idx)}
                      >
                        <span className="font-medium truncate text-xs">
                          {match.name}
                        </span>
                        <span className="ml-2 flex flex-col items-end min-w-fit">
                          <span className="text-[10px] text-gray-400">
                            {match.href}
                          </span>
                          <span className="text-[10px] text-gray-300 mt-0.5">
                            Page
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-2 py-2 text-gray-400 text-xs">
                  {searchTerm.trim().length > 0 && searchTerm.trim().length < 1
                    ? 'Type at least 1 character to search.'
                    : 'No matches found.'}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="flex items-center gap-6 flex-1 justify-end relative">
        {/* Messages Popup UI */}
        <div className="relative" ref={messagesRef}>
          <button
            aria-label="Open Messages"
            className="relative group p-2 rounded-full hover:bg-blue-50 transition focus:outline-none"
            onClick={() => setShowMessages((prev) => !prev)}
          >
            <ChatTeardropText size={24} className="text-gray-600" />
            {mockMessages.some((m) => m.unread) && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition" />
            )}
          </button>
          {showMessages && (
            <div className="absolute right-0 mt-3 w-80 max-w-xs bg-white text-black shadow-lg border border-gray-200 rounded-xl animate-fade-in z-50 py-3 px-0">
              <div className="px-5 flex items-center justify-between pb-2">
                <p className="text-gray-900 font-semibold text-base">
                  Messages
                </p>
                <button
                  className="text-xs text-blue-500 hover:underline"
                  onClick={() => setShowMessages(false)}
                  tabIndex={-1}
                >
                  Close
                </button>
              </div>
              <div className="flex flex-col gap-1.5 text-base max-h-72 overflow-y-auto px-2 pb-2">
                {mockMessages.length > 0 ? (
                  mockMessages.map((msg, i) => (
                    <button
                      key={i}
                      className={`group rounded-lg flex items-center gap-3 px-3 py-2 transition w-full text-left
                        ${msg.unread ? 'bg-blue-50' : ''}
                        hover:bg-blue-100
                      `}
                      tabIndex={0}
                    >
                      <Image
                        src="/images/avatar.png"
                        alt={msg.from}
                        width={36}
                        height={36}
                        className="rounded-full object-cover h-9 w-9"
                      />
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-black truncate">
                            {msg.from}
                          </span>
                          {msg.unread && (
                            <span className="ml-1 w-2 h-2 bg-blue-400 rounded-full" />
                          )}
                          <span className="ml-auto text-xs text-gray-400">
                            {msg.time}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700 truncate">
                          {msg.text}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm px-4 py-6 block text-center">
                    No new messages.
                  </span>
                )}
              </div>
              <div className="pt-2 px-5 border-t border-gray-100">
                <button
                  className="text-xs text-blue-500 font-medium hover:underline w-full text-left"
                  tabIndex={-1}
                  onClick={() => {
                    setShowMessages(false);
                    router.push('/messages');
                  }}
                >
                  View all messages
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Popup UI */}
        <div className="relative" ref={notificationsRef}>
          <button
            aria-label="Open Notifications"
            className="relative group p-2 rounded-full hover:bg-blue-50 transition focus:outline-none"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <BellRinging size={24} className="text-gray-600" />
            {mockNotifications.some((n) => n.unread) && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition" />
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 max-w-xs bg-white text-black shadow-lg border border-gray-200 rounded-xl animate-fade-in z-50 py-3 px-0">
              <div className="px-5 flex items-center justify-between pb-2">
                <p className="text-gray-900 font-semibold text-base">
                  Notifications
                </p>
                <button
                  className="text-xs text-blue-500 hover:underline"
                  onClick={() => setShowNotifications(false)}
                  tabIndex={-1}
                >
                  Close
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto px-2 pb-2">
                {mockNotifications.length > 0 ? (
                  mockNotifications.map((notif, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-lg px-3 py-2 transition
                        ${notif.unread ? 'bg-blue-50' : ''}
                        hover:bg-blue-100
                      `}
                    >
                      <span className="flex-shrink-0">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span
                            className={`font-semibold text-black text-sm truncate`}
                          >
                            {notif.title}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">
                            {notif.time}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700 truncate">
                          {notif.desc}
                        </div>
                      </div>
                      {notif.unread && (
                        <span className="ml-1 w-2 h-2 bg-blue-400 rounded-full mt-1" />
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm px-4 py-6 block text-center">
                    No new notifications.
                  </span>
                )}
              </div>
              <div className="pt-2 px-5 border-t border-gray-100">
                <button
                  className="text-xs text-blue-500 font-medium hover:underline w-full text-left"
                  tabIndex={-1}
                  onClick={() => {
                    setShowNotifications(false);
                    router.push('/notifications');
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile/Settings Dropdown */}
        <div className="relative flex-shrink-0" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className={`flex items-center gap-2 bg-white px-3 py-2 rounded-full transition duration-150 border border-gray-100 hover:bg-gray-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-100 group ${
              showProfileMenu ? 'ring-1 ring-blue-100 border-blue-200' : ''
            }`}
            aria-haspopup="menu"
            aria-controls="profile-menu-dropdown"
            aria-expanded={showProfileMenu}
            title="Open user menu"
            tabIndex={0}
          >
            <Image
              src="/images/avatar.png"
              alt="User Avatar"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="hidden md:flex flex-col pr-1 items-start text-left">
              <span className="font-medium text-gray-900 text-[13px] leading-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[11px] text-gray-500 capitalize mt-0.5">
                {user?.role}
              </span>
            </div>
            <CaretDown size={20} className="text-gray-500 ml-1" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-100 text-black px-0 py-2 shadow-2xl rounded-xl z-50 animate-fade-in">
              <div className="px-4 pb-3 pt-2 border-b border-gray-100 flex gap-2 items-center">
                <div className="flex flex-col">
                  <span className="font-medium text-[14px] truncate">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-[11px] text-gray-500 capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push('/profile');
                }}
                className="flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-gray-50 transition text-gray-700 text-[14px]"
              >
                <UserCircle size={20} className="text-blue-500" />
                My Profile
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push('/settings');
                }}
                className="flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-gray-50 transition text-gray-700 text-[14px]"
              >
                <Gear size={20} className="text-blue-500" />
                Settings
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-red-50 transition text-red-600 text-[14px]"
              >
                <SignOut size={20} className="text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
