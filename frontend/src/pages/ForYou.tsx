import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap, 
  User, 
  Mail, 
  MapPin, 
  Award, 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

const ForYou: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState<number | null>(null);

  const fetchForYouData = async () => {
    try {
      const res = await axios.get('/api/student/foryou');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching department data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForYouData();
  }, []);

  const handleRegister = async (eventId: number) => {
    setRegLoading(eventId);
    try {
      await axios.post('/api/student/event-register', { eventId });
      fetchForYouData(); // Refresh flags
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
          <span className="text-xs uppercase tracking-widest text-accent font-semibold animate-pulse">Loading Department Profile...</span>
        </div>
      </div>
    );
  }

  const { department, hod, faculty, events, subjects, metrics } = data;
  const totalAssignments = metrics.pendingAssignments + metrics.completedAssignments;
  const assignmentRate = totalAssignments > 0 ? Math.round((metrics.completedAssignments / totalAssignments) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. EDITORIAL HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
          <GraduationCap className="w-3.5 h-3.5 text-accent" />
          <span className="text-[9px] uppercase tracking-widest text-accent font-black">Personalized Academic Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">MY HUB</h1>
        <p className="text-surface-accent text-xs leading-relaxed max-w-xl">
          Overview of your specific department faculty directory, active course syllabus, performance metrics, and relevant events.
        </p>
      </div>

      {/* 2. TOP SECTION: DEPT PROFILE & PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Department Info Box */}
        <div className="lg:col-span-5 glass-card p-6 bg-surface-primary/10 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
            <GraduationCap className="w-4.5 h-4.5" /> Department Profile
          </h3>
          <div className="space-y-1">
            <p className="text-lg font-bold text-warm-white">{department.name}</p>
            <p className="text-xs text-surface-accent uppercase font-mono">Department Code: {department.code}</p>
          </div>

          {hod && (
            <div className="bg-midnight/40 p-4 rounded border border-surface-accent/10 space-y-3">
              <span className="text-[9px] uppercase tracking-wider text-accent font-bold">Head of Department (HOD)</span>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-warm-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-surface-accent" /> {hod.name}
                </p>
                <p className="text-[11px] text-surface-accent flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-surface-accent" /> {hod.email}
                </p>
                <p className="text-[11px] text-surface-accent flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-surface-accent" /> Office: {hod.office_room}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics Tracker */}
        <div className="lg:col-span-7 glass-card p-6 bg-surface-primary/10 space-y-5">
          <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
            <Award className="w-4.5 h-4.5" /> Academic Metrics Tracker
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CGPA Card */}
            <div className="bg-midnight/30 p-4 rounded border border-surface-accent/5 text-center space-y-1">
              <span className="text-[9px] uppercase text-surface-accent tracking-wider font-mono">GPA Score</span>
              <p className="text-2xl font-extrabold text-accent font-mono">{metrics.cgpa.toFixed(2)}</p>
              <p className="text-[9px] text-surface-accent/70">Dept Avg: 8.40</p>
            </div>
            {/* Attendance Card */}
            <div className="bg-midnight/30 p-4 rounded border border-surface-accent/5 text-center space-y-1">
              <span className="text-[9px] uppercase text-surface-accent tracking-wider font-mono">Attendance</span>
              <p className="text-2xl font-extrabold text-accent font-mono">{metrics.attendancePercentage}%</p>
              <p className="text-[9px] text-surface-accent/70">Classes: {metrics.present} / {metrics.totalClasses}</p>
            </div>
            {/* Task Completion Card */}
            <div className="bg-midnight/30 p-4 rounded border border-surface-accent/5 text-center space-y-1">
              <span className="text-[9px] uppercase text-surface-accent tracking-wider font-mono">Task Completion</span>
              <p className="text-2xl font-extrabold text-accent font-mono">{assignmentRate}%</p>
              <p className="text-[9px] text-surface-accent/70">Completed: {metrics.completedAssignments}</p>
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-surface-accent font-mono">
                <span>ATTENDANCE STATUS</span>
                <span>{metrics.attendancePercentage}%</span>
              </div>
              <div className="w-full bg-midnight rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all duration-500" 
                  style={{ width: `${metrics.attendancePercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-surface-accent font-mono">
                <span>ASSIGNMENTS COMPLETED</span>
                <span>{metrics.completedAssignments} / {totalAssignments} Tasks</span>
              </div>
              <div className="w-full bg-midnight rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all duration-500" 
                  style={{ width: `${assignmentRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM SECTION: ACTIVE SUBJECTS & DEPARTMENT EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Subjects list */}
        <div className="lg:col-span-5 glass-card p-6 bg-surface-primary/10 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
            <BookOpen className="w-4.5 h-4.5" /> Semester Syllabus
          </h3>
          <div className="divide-y divide-surface-accent/10 max-h-[350px] overflow-y-auto pr-1">
            {subjects.length === 0 ? (
              <p className="text-xs text-surface-accent py-4">No subjects found for this semester.</p>
            ) : (
              subjects.map((sub: any) => (
                <div key={sub.id} className="py-3 flex justify-between items-center group hover:bg-surface-primary/5 px-2 rounded transition-colors">
                  <div>
                    <p className="text-xs font-bold text-warm-white group-hover:text-accent transition-colors">{sub.name}</p>
                    <span className="text-[10px] text-surface-accent font-mono">{sub.code}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-accent group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Events */}
        <div className="lg:col-span-7 glass-card p-6 bg-surface-primary/10 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
            <Calendar className="w-4.5 h-4.5" /> Department & Campus Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-xs text-surface-accent py-4 col-span-2 text-center">No active department events listed.</p>
            ) : (
              events.map((evt: any) => (
                <div key={evt.id} className="bg-midnight/30 p-4 rounded border border-surface-accent/10 flex flex-col justify-between h-48 space-y-2">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-accent font-mono">{evt.category}</span>
                      <span className="text-[9px] text-surface-accent font-mono">{evt.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-warm-white mt-1.5 leading-snug line-clamp-1">{evt.title}</h4>
                    <p className="text-[10px] text-surface-accent mt-1 leading-relaxed line-clamp-2">{evt.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-surface-accent/5">
                    <div className="flex justify-between items-center text-[9px] text-surface-accent font-mono">
                      <span>📍 {evt.location}</span>
                      <span>👥 {evt.current_participants}/{evt.max_participants}</span>
                    </div>
                    <button
                      disabled={evt.registered || regLoading === evt.id}
                      onClick={() => handleRegister(evt.id)}
                      className={`w-full py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        evt.registered
                          ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/30'
                          : 'bg-btn-gradient text-midnight hover:opacity-90'
                      }`}
                    >
                      {regLoading === evt.id ? (
                        <div className="w-3 h-3 border-2 border-midnight border-t-transparent rounded-full animate-spin"></div>
                      ) : evt.registered ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Registered
                        </>
                      ) : (
                        'Register Spot'
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForYou;
