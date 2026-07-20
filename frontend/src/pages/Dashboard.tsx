import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  User, 
  Megaphone, 
  Bus, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  BookOpen,
  X,
  Code,
  Trophy,
  ExternalLink
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/student/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRegister = async (eventId: number) => {
    setRegLoading(eventId);
    try {
      await axios.post('/api/student/event-register', { eventId });
      fetchDashboardData(); // Refresh flags
      
      // Also update selectedEvent state if it's currently open in the modal
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent({
          ...selectedEvent,
          registered: true,
          current_participants: selectedEvent.current_participants + 1
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold animate-pulse">Syncing Portal...</span>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current weekday dynamically
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = weekdays[new Date().getDay()];
  
  // Weekend preview: if Saturday/Sunday, preview Monday classes
  const isWeekend = currentDay === 'Saturday' || currentDay === 'Sunday';
  const targetDay = isWeekend ? 'Monday' : currentDay;
  const todayClasses = data?.timetable?.filter((t: any) => t.day_of_week === targetDay) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. EDITORIAL GREETING */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-primary/20 p-8 border border-surface-accent/15 rounded-xl backdrop-blur-md">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">Academic Dashboard</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white mt-1">
            {getGreeting()}, {user?.name}
          </h1>
          <p className="text-surface-accent text-xs mt-1">
            Department of {user?.departmentName} • Semester {user?.semester}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="px-4 py-2 bg-midnight/60 border border-surface-accent/15 rounded text-center">
            <p className="text-[9px] uppercase tracking-widest text-surface-accent">Current GPA</p>
            <p className="text-lg font-bold text-accent font-mono mt-0.5">
              {data?.academicMetrics?.cgpa ? Number(data.academicMetrics.cgpa).toFixed(2) : '8.80'}
            </p>
          </div>
          <div className="px-4 py-2 bg-midnight/60 border border-surface-accent/15 rounded text-center">
            <p className="text-[9px] uppercase tracking-widest text-surface-accent">Attendance</p>
            <p className="text-lg font-bold text-accent font-mono mt-0.5">
              {data?.academicMetrics?.attendancePercentage ?? 95}%
            </p>
          </div>
          {data?.leetcodeStats && (
            <div className="px-4 py-2 bg-midnight/60 border border-amber-500/30 rounded text-center">
              <p className="text-[9px] uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-1">
                <Code className="w-3 h-3" /> LeetCode
              </p>
              <p className="text-lg font-bold text-amber-300 font-mono mt-0.5">
                #{data.leetcodeStats.branchRank || 1} <span className="text-xs text-surface-accent font-normal">({data.leetcodeStats.leetcode_solved} solved)</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. GRID SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Classes, Notices & Transport */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* TODAY'S SCHEDULE */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {isWeekend ? `Upcoming Schedule (Monday)` : `Today's Schedule (${currentDay})`}
            </h3>
            
            {todayClasses.length === 0 ? (
              <div className="glass-card p-6 text-center text-xs text-surface-accent">
                No classes scheduled for {isWeekend ? 'Monday' : 'today'}. Take time to complete your assignments!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayClasses.map((item: any) => (
                  <div key={item.id} className="glass-card p-5 relative overflow-hidden flex flex-col justify-between h-36">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-surface-accent/20 text-accent rounded font-bold">
                          {item.subject_code}
                        </span>
                        <span className="text-[10px] text-surface-accent font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.room_number}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-warm-white mt-2 leading-snug">{item.subject_name}</h4>
                    </div>
                    
                    <div className="border-t border-surface-accent/10 pt-3 flex justify-between items-center text-[10px]">
                      <span className="text-surface-accent flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {item.faculty_name}
                      </span>
                      <span className="font-bold text-warm-white font-mono">{item.start_time} - {item.end_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ANNOUNCEMENT NOTICES */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
              <Megaphone className="w-4 h-4" /> Campus Notice Board
            </h3>
            <div className="glass-card divide-y divide-surface-accent/15 overflow-hidden">
              {data?.announcements?.length === 0 ? (
                <div className="p-6 text-center text-xs text-surface-accent">No active announcements.</div>
              ) : (
                data?.announcements?.map((item: any) => (
                  <div key={item.id} className="p-5 flex gap-4 hover:bg-surface-primary/10 transition-colors">
                    <div className="flex flex-col items-center">
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-black text-center ${
                        item.category === 'Urgent' ? 'bg-red-950 text-red-400 border border-red-800/20' :
                        item.category === 'Achievement' ? 'bg-amber-950 text-amber-400 border border-amber-800/20' :
                        item.category === 'Department' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/20' :
                        'bg-surface-accent/20 text-accent'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-[9px] text-surface-accent/60 font-mono mt-2">
                        {new Date(item.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-bold text-warm-white">{item.title}</h4>
                      <p className="text-[11px] leading-relaxed text-surface-accent">{item.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* BUS TRANSIT ROUTE */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
              <Bus className="w-4 h-4" /> Transit & Transport Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.busRoutes?.map((bus: any) => (
                <div key={bus.id} className="glass-card p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-warm-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {bus.bus_number}
                    </span>
                    <span className="text-[10px] text-surface-accent font-mono uppercase tracking-wider">Active</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-surface-accent">Route Path</p>
                    <p className="text-xs text-warm-white leading-relaxed">{bus.route}</p>
                  </div>

                  <div className="border-t border-surface-accent/10 pt-3 flex justify-between items-center text-[10px]">
                    <span className="text-surface-accent">Driver: <strong className="text-warm-white font-semibold">{bus.driver_name}</strong></span>
                    <a 
                      href={`tel:${bus.driver_contact}`} 
                      className="text-accent hover:underline font-mono"
                    >
                      {bus.driver_contact}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: LeetCode Arena, Events & Clubs */}
        <div className="lg:col-span-4 space-y-8">

          {/* LEETCODE COMPUTING ARENA WIDGET */}
          {data?.leetcodeStats && (
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-amber-400" /> LeetCode Arena ({data.leetcodeStats.dept_code})
                </h3>
                <Link
                  to="/leaderboard"
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
                >
                  View Arena <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5 space-y-4">
                {/* Student's LeetCode Profile Header */}
                <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-warm-white">
                        @{data.leetcodeStats.leetcode_handle || 'unlinked'}
                      </span>
                      {data.leetcodeStats.leetcode_handle && (
                        <a
                          href={`https://leetcode.com/u/${data.leetcodeStats.leetcode_handle}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] text-surface-accent font-mono">
                      Rating: <strong className="text-amber-300">{data.leetcodeStats.leetcode_rating}</strong> ({data.leetcodeStats.leetcode_rating >= 1900 ? 'Guardian' : 'Knight'})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-surface-accent tracking-wider block">Branch Rank</span>
                    <span className="text-base font-black text-amber-400 font-mono flex items-center justify-end gap-1">
                      <Trophy className="w-4 h-4 text-amber-400" /> #{data.leetcodeStats.branchRank || 1}
                    </span>
                  </div>
                </div>

                {/* Problem Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block">Easy</span>
                    <span className="text-sm font-bold text-warm-white">{data.leetcodeStats.leetcode_easy}</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2">
                    <span className="text-[9px] uppercase font-bold text-amber-400 block">Medium</span>
                    <span className="text-sm font-bold text-warm-white">{data.leetcodeStats.leetcode_medium}</span>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded p-2">
                    <span className="text-[9px] uppercase font-bold text-rose-400 block">Hard</span>
                    <span className="text-sm font-bold text-warm-white">{data.leetcodeStats.leetcode_hard}</span>
                  </div>
                </div>

                {/* Top Computing Coders Snapshot */}
                {data.leetcodeStats.topCoders?.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-surface-accent block">
                      Branch Top Coders
                    </span>
                    <div className="space-y-1.5">
                      {data.leetcodeStats.topCoders.map((coder: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-mono bg-midnight/40 p-2 rounded border border-surface-accent/10">
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
                              idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                              idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                              'bg-amber-700/20 text-amber-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-warm-white">{coder.student_name}</span>
                          </div>
                          <span className="text-[11px] text-amber-300 font-bold">{coder.leetcode_solved} solved</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
          
          {/* EVENTS BOARD */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Upcoming Events
            </h3>
            <div className="space-y-4">
              {data?.events?.map((evt: any) => (
                <div 
                  key={evt.id} 
                  className="glass-card p-5 space-y-3 bg-surface-primary/10 hover:border-accent/40 cursor-pointer transition-all duration-300 group"
                  onClick={() => setSelectedEvent(evt)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-accent tracking-widest">{evt.category}</span>
                      <h4 className="text-xs font-bold text-warm-white mt-1 leading-normal">{evt.title}</h4>
                    </div>
                  </div>
                  
                  {evt.image_url && (
                    <div className="w-full h-48 overflow-hidden rounded-md border border-surface-accent/15 relative">
                      <img 
                        src={evt.image_url} 
                        alt={evt.title} 
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-midnight/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-warm-white bg-midnight/70 px-2 py-1 rounded border border-surface-accent/20">
                          Click to maximize
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-[11px] leading-relaxed text-surface-accent line-clamp-2">{evt.description}</p>
                  
                  <div className="text-[10px] text-surface-accent flex flex-col gap-1 font-mono">
                    <span className="flex items-center gap-1">📅 {evt.date} • {evt.time}</span>
                    <span className="flex items-center gap-1">📍 {evt.location}</span>
                    <span className="flex items-center gap-1">👥 Capacity: {evt.current_participants} / {evt.max_participants}</span>
                  </div>

                  <button
                    disabled={evt.registered || regLoading === evt.id}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening modal
                      handleRegister(evt.id);
                    }}
                    className={`w-full py-2 rounded text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      evt.registered
                        ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/30'
                        : 'bg-btn-gradient text-midnight hover:opacity-90'
                    }`}
                  >
                    {regLoading === evt.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-midnight border-t-transparent rounded-full animate-spin"></div>
                    ) : evt.registered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                      </>
                    ) : (
                      'Register Spot'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* CLUBS & SOCIETIES */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Clubs & Student Guilds
            </h3>
            <div className="space-y-4">
              {data?.clubs?.map((club: any) => (
                <div key={club.id} className="glass-card p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-surface-accent/20 text-accent rounded font-bold">
                        {club.category}
                      </span>
                      <h4 className="text-sm font-bold text-warm-white mt-2">{club.name}</h4>
                    </div>
                    <span className="text-[10px] text-surface-accent font-mono">{club.members_count} Members</span>
                  </div>
                  
                  <p className="text-[11px] leading-relaxed text-surface-accent">{club.description}</p>
                  
                  {club.upcoming_events && club.upcoming_events.length > 0 && (
                    <div className="border-t border-surface-accent/10 pt-3 space-y-2">
                      <p className="text-[9px] uppercase tracking-wider text-accent font-semibold">Upcoming Club Events</p>
                      {club.upcoming_events.map((e: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] bg-midnight/40 p-2 rounded">
                          <span className="text-warm-white font-medium">{e.title}</span>
                          <span className="text-surface-accent font-mono">{e.date}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-surface-accent/10 pt-3 flex justify-between items-center text-[10px]">
                    <span className="text-surface-accent">Club Lead: <strong className="text-warm-white">{club.leader_name}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* EVENT DETAILS MAXIMIZED MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 relative border border-surface-accent/30 shadow-2xl">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-surface-accent hover:text-warm-white p-1 rounded font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-accent tracking-widest px-2.5 py-1 bg-surface-accent/20 rounded">
                {selectedEvent.category} • {selectedEvent.type}
              </span>
              <h2 className="text-2xl font-extrabold text-warm-white">{selectedEvent.title}</h2>
            </div>

            {selectedEvent.image_url && (
              <div className="w-full h-72 overflow-hidden rounded-lg border border-surface-accent/20">
                <img 
                  src={selectedEvent.image_url} 
                  alt={selectedEvent.title} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold tracking-widest text-accent">About the Event</h3>
              <p className="text-xs text-warm-white leading-relaxed whitespace-pre-line">{selectedEvent.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-midnight/50 p-4 rounded-lg border border-surface-accent/15 text-xs font-mono">
              <div>
                <span className="text-surface-accent text-[10px] uppercase block">Date & Time</span>
                <span className="text-warm-white font-bold">{selectedEvent.date} at {selectedEvent.time}</span>
              </div>
              <div>
                <span className="text-surface-accent text-[10px] uppercase block">Location</span>
                <span className="text-warm-white font-bold">{selectedEvent.location}</span>
              </div>
              <div>
                <span className="text-surface-accent text-[10px] uppercase block">Available Seats</span>
                <span className="text-warm-white font-bold">{selectedEvent.max_participants - selectedEvent.current_participants} spots left</span>
              </div>
              <div>
                <span className="text-surface-accent text-[10px] uppercase block">Registration Status</span>
                <span className={`font-bold ${selectedEvent.registered ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedEvent.registered ? 'Registered ✓' : 'Open'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded text-xs uppercase font-bold bg-surface-primary/30 text-surface-accent hover:text-warm-white cursor-pointer"
              >
                Close
              </button>
              <button
                disabled={selectedEvent.registered || regLoading === selectedEvent.id}
                onClick={() => handleRegister(selectedEvent.id)}
                className={`px-6 py-2 rounded text-xs uppercase font-bold tracking-wider cursor-pointer ${
                  selectedEvent.registered
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 cursor-default'
                    : 'bg-btn-gradient text-midnight hover:opacity-90'
                }`}
              >
                {regLoading === selectedEvent.id ? 'Registering...' : selectedEvent.registered ? 'Registered ✓' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
