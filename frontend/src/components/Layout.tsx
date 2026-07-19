import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Sparkles, 
  Trophy, 
  MessageSquareShare, 
  ShieldAlert, 
  LogOut, 
  Bell, 
  Search, 
  User, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Megaphone,
  UserCheck,
  TrendingUp,
  Users
} from 'lucide-react';
import ChatBot from './ChatBot';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/student/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s for alerts
    return () => clearInterval(interval);
  }, []);

  // Handle Search input
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setSearching(true);
        try {
          const res = await axios.get(`/api/student/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(res.data);
          setShowSearchDropdown(true);
        } catch (err) {
          console.error('Error searching:', err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowSearchDropdown(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await axios.put(`/api/student/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/academics') return 'Academics Performance';
    if (path === '/foryou') return 'For You (AI Sandbox)';
    if (path === '/leaderboard') return 'Leaderboard Ranks';
    if (path === '/feedback') return 'Feedback Hub';
    if (path === '/admin') return 'Administration console';
    return 'Portal';
  };

  const isTabActive = (tabId: string) => {
    const params = new URLSearchParams(location.search);
    return location.pathname === '/admin' && (params.get('tab') || 'analytics') === tabId;
  };

  return (
    <div className="min-h-screen bg-midnight relative flex">
      {/* Background Overlay */}
      <div className="noise-bg"></div>

      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-surface-primary/20 border-r border-surface-accent/15 flex flex-col z-20">
        {/* Brand/Logo */}
        <div className="p-6 border-b border-surface-accent/15 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-btn-gradient flex items-center justify-center text-midnight font-black text-lg shadow-glow">
            N
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wider text-warm-white">NEXORA</h1>
            <p className="text-[10px] text-surface-accent uppercase tracking-widest">SaaS Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {user?.role === 'admin' ? (
            <>
              {/* Admin Portal Links */}
              <NavLink
                to="/admin?tab=analytics"
                className={() =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isTabActive('analytics')
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <TrendingUp className="w-4.5 h-4.5 text-accent" />
                System Overview
              </NavLink>

              <NavLink
                to="/admin?tab=freshers"
                className={() =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isTabActive('freshers')
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <Users className="w-4.5 h-4.5" />
                Freshers Monitor
              </NavLink>

              <NavLink
                to="/admin?tab=schedules"
                className={() =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isTabActive('schedules')
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <Calendar className="w-4.5 h-4.5" />
                Class Schedules
              </NavLink>

              <NavLink
                to="/admin?tab=events"
                className={() =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isTabActive('events')
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <Sparkles className="w-4.5 h-4.5 text-accent" />
                Upcoming Events
              </NavLink>

              <NavLink
                to="/admin?tab=feedback"
                className={() =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isTabActive('feedback')
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <MessageSquareShare className="w-4.5 h-4.5" />
                Feedback Inbox
              </NavLink>

              <NavLink
                to="/admin?tab=announcements"
                className={() =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isTabActive('announcements')
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <Megaphone className="w-4.5 h-4.5" />
                Notice Broadcast
              </NavLink>
            </>
          ) : (
            <>
              {/* Student Portal Links */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                Dashboard
              </NavLink>

              <NavLink
                to="/academics"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <GraduationCap className="w-4.5 h-4.5" />
                Academics
              </NavLink>

              <NavLink
                to="/foryou"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <Sparkles className="w-4.5 h-4.5 text-accent" />
                For You
              </NavLink>

              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <Trophy className="w-4.5 h-4.5" />
                Leaderboard
              </NavLink>

              <NavLink
                to="/feedback"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-surface-primary text-accent border-l-2 border-accent'
                      : 'text-surface-accent hover:text-warm-white hover:bg-surface-primary/30'
                  }`
                }
              >
                <MessageSquareShare className="w-4.5 h-4.5" />
                Feedback Hub
              </NavLink>
            </>
          )}
        </nav>

        {/* User Block & Logout */}
        <div className="p-4 border-t border-surface-accent/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-surface-primary border border-surface-accent/20 flex items-center justify-center text-warm-white text-xs font-semibold">
              {user?.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-warm-white truncate">{user?.name}</p>
              <p className="text-[10px] text-surface-accent truncate font-mono">{user?.rollNumber}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 justify-center py-2 border border-surface-accent/10 hover:border-red-800/30 rounded text-xs tracking-wider uppercase font-semibold text-surface-accent hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN SECTION */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-surface-accent/15 bg-midnight/30 backdrop-blur-md px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold tracking-tight text-warm-white font-sans uppercase">
              {getPageTitle()}
            </h2>

            {/* Global Search Bar */}
            <div ref={searchRef} className="relative w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-surface-accent" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms, faculty, events..."
                className="w-full bg-surface-primary/30 border border-surface-accent/20 rounded pl-9 pr-4 py-1.5 text-xs text-warm-white placeholder-surface-accent/50 focus:outline-none focus:border-accent transition-colors"
              />

              {/* Search Dropdown Overlay */}
              {showSearchDropdown && searchResults && (
                <div className="absolute top-10 left-0 w-[420px] max-h-96 overflow-y-auto bg-midnight-light border border-surface-accent/20 rounded-lg shadow-xl p-4 z-50">
                  <div className="space-y-4">
                    {/* Faculty Results */}
                    {searchResults.faculty?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold mb-1 flex items-center gap-1">
                          <User className="w-3 h-3" /> Faculty Directory
                        </h4>
                        <div className="divide-y divide-surface-primary/30">
                          {searchResults.faculty.map((f: any, idx: number) => (
                            <div key={idx} className="py-1.5 text-xs">
                              <p className="font-semibold text-warm-white">{f.name}</p>
                              <p className="text-[10px] text-surface-accent">{f.designation} • Office: {f.office_room} • {f.email}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Events Results */}
                    {searchResults.events?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Events
                        </h4>
                        <div className="divide-y divide-surface-primary/30">
                          {searchResults.events.map((e: any, idx: number) => (
                            <div key={idx} className="py-1.5 text-xs">
                              <p className="font-semibold text-warm-white">{e.title}</p>
                              <p className="text-[10px] text-surface-accent">{e.date} • {e.location}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Announcements */}
                    {searchResults.announcements?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold mb-1 flex items-center gap-1">
                          <Megaphone className="w-3 h-3" /> Notices
                        </h4>
                        <div className="divide-y divide-surface-primary/30">
                          {searchResults.announcements.map((a: any, idx: number) => (
                            <div key={idx} className="py-1.5 text-xs">
                              <p className="font-semibold text-warm-white">{a.title}</p>
                              <p className="text-[10px] text-surface-accent truncate">{a.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subjects */}
                    {searchResults.subjects?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Subjects
                        </h4>
                        <div className="divide-y divide-surface-primary/30">
                          {searchResults.subjects.map((s: any, idx: number) => (
                            <div key={idx} className="py-1.5 text-xs">
                              <p className="font-semibold text-warm-white">{s.name} ({s.code})</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rooms */}
                    {searchResults.rooms?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Rooms & Locations
                        </h4>
                        <div className="divide-y divide-surface-primary/30">
                          {searchResults.rooms.map((r: any, idx: number) => (
                            <div key={idx} className="py-1.5 text-xs flex justify-between">
                              <span className="font-semibold text-warm-white">{r.room_number}</span>
                              <span className="text-[10px] text-surface-accent px-1.5 py-0.5 rounded bg-surface-primary">{r.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Students (Admin Only) */}
                    {searchResults.students?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Students (Admin Access)
                        </h4>
                        <div className="divide-y divide-surface-primary/30">
                          {searchResults.students.map((s: any, idx: number) => (
                            <div key={idx} className="py-1.5 text-xs">
                              <p className="font-semibold text-warm-white">{s.name} ({s.roll_number})</p>
                              <p className="text-[10px] text-surface-accent">Dept: {s.dept_code} • Year: {s.year}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {(!searchResults.faculty?.length && 
                      !searchResults.events?.length && 
                      !searchResults.announcements?.length && 
                      !searchResults.subjects?.length && 
                      !searchResults.rooms?.length && 
                      !searchResults.clubs?.length && 
                      !searchResults.students?.length) && (
                      <p className="text-xs text-surface-accent text-center py-4">No results match your query.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Nav Utilities */}
          <div className="flex items-center gap-4">
            {/* Department Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-surface-primary/40 border border-surface-accent/15 text-xs">
              <span className="text-surface-accent uppercase">Dept:</span>
              <span className="font-bold text-accent font-mono">{user?.departmentCode}</span>
              <span className="text-surface-accent">Sem:</span>
              <span className="font-bold text-accent font-mono">{user?.semester}</span>
            </div>

            {/* Notification Bell Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded hover:bg-surface-primary/40 relative text-surface-accent hover:text-warm-white transition-colors"
                aria-label="Toggle notifications center"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-midnight text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay List */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-midnight-light border border-surface-accent/20 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-surface-accent/15 flex justify-between items-center bg-surface-primary/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-warm-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-accent font-semibold">{unreadCount} unread</span>
                    )}
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto divide-y divide-surface-primary/40">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-surface-accent text-center py-8">No notifications</p>
                    ) : (
                      notifications.map((notif: any) => (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                          className={`p-3 text-xs cursor-pointer transition-colors ${
                            notif.is_read ? 'hover:bg-surface-primary/10 opacity-70' : 'bg-surface-primary/20 hover:bg-surface-primary/30 border-l-2 border-accent'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <h5 className="font-bold text-warm-white">{notif.title}</h5>
                            {!notif.is_read && (
                              <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                            )}
                          </div>
                          <p className="text-surface-accent text-[11px] leading-relaxed">{notif.message}</p>
                          <span className="text-[9px] text-surface-accent/60 block mt-1">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-2 border-l border-surface-accent/20 pl-4">
              <span className="text-xs font-semibold text-warm-white">{user?.name}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface-accent/20 text-accent font-bold">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
      </div>

      {/* 3. FLOATING AI ASSISTANT CHATBOT */}
      <ChatBot />
    </div>
  );
};

export default Layout;
