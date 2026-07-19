import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  X
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
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-midnight/60 border border-surface-accent/15 rounded text-center">
            <p className="text-[9px] uppercase tracking-widest text-surface-accent">Current GPA</p>
            <p className="text-lg font-bold text-accent font-mono mt-0.5">9.20</p>
          </div>
          <div className="px-4 py-2 bg-midnight/60 border border-surface-accent/15 rounded text-center">
            <p className="text-[9px] uppercase tracking-widest text-surface-accent">Attendance</p>
            <p className="text-lg font-bold text-accent font-mono mt-0.5">92%</p>
          </div>
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

        {/* RIGHT COLUMN: Events & Clubs */}
        <div className="lg:col-span-4 space-y-8">
          
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
              <Users className="w-4 h-4" /> Clubs & Communities
            </h3>
            <div className="space-y-4">
              {data?.clubs?.map((club: any) => (
                <div key={club.id} className="glass-card p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-warm-white">{club.name}</h4>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface-primary text-accent font-bold font-mono">
                      {club.category}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-surface-accent">{club.description}</p>
                  
                  {club.upcoming_events?.length > 0 && (
                    <div className="bg-midnight/40 p-2.5 rounded border border-surface-accent/5 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-surface-accent font-bold">Upcoming Event</span>
                      <p className="text-[10px] text-warm-white font-semibold">{club.upcoming_events[0].title}</p>
                      <p className="text-[9px] text-surface-accent/70 font-mono">{club.upcoming_events[0].date}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-surface-accent/10 pt-3">
                    <span className="text-[10px] text-surface-accent flex items-center gap-1">
                      👥 {club.members_count} Members
                    </span>
                    <button
                      onClick={() => alert(`Joined ${club.name} successfully!`)}
                      className="text-[10px] font-bold text-accent hover:underline flex items-center gap-0.5"
                    >
                      Join Guild <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative bg-surface-primary border border-surface-accent/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-scale-up">
            {/* Header / Close button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-full bg-midnight/60 hover:bg-midnight border border-surface-accent/15 text-warm-white hover:text-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Poster */}
            {selectedEvent.image_url ? (
              <div className="w-full bg-midnight/40 flex justify-center border-b border-surface-accent/10">
                <img 
                  src={selectedEvent.image_url} 
                  alt={selectedEvent.title} 
                  className="max-h-[50vh] w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-40 bg-accent/5 flex items-center justify-center border-b border-surface-accent/10">
                <Calendar className="w-12 h-12 text-accent/40" />
              </div>
            )}

            {/* Event Details */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-accent tracking-widest font-mono">
                  {selectedEvent.category} • {selectedEvent.type}
                </span>
                <span className="text-xs text-surface-accent font-semibold font-mono">
                  Capacity: {selectedEvent.current_participants} / {selectedEvent.max_participants}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-warm-white">{selectedEvent.title}</h2>
              
              <p className="text-xs leading-relaxed text-surface-accent whitespace-pre-line">{selectedEvent.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-midnight/30 p-4 rounded-lg border border-surface-accent/5 text-xs text-surface-accent font-mono">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-accent font-bold">Schedule</p>
                  <p className="text-warm-white">📅 {selectedEvent.date}</p>
                  <p className="text-warm-white">⏰ {selectedEvent.time}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-accent font-bold">Location</p>
                  <p className="text-warm-white">📍 {selectedEvent.location}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={selectedEvent.registered || regLoading === selectedEvent.id}
                  onClick={() => handleRegister(selectedEvent.id)}
                  className={`w-full py-3 rounded text-xs uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-2 ${
                    selectedEvent.registered
                      ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/30'
                      : 'bg-btn-gradient text-midnight hover:opacity-90'
                  }`}
                >
                  {regLoading === selectedEvent.id ? (
                    <div className="w-4 h-4 border-2 border-midnight border-t-transparent rounded-full animate-spin"></div>
                  ) : selectedEvent.registered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Successfully Registered
                    </>
                  ) : (
                    'Confirm Spot Registration'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
