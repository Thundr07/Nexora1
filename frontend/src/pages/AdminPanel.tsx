import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, 
  Megaphone, 
  Calendar, 
  Bus, 
  MessageSquare, 
  CheckCircle,
  HelpCircle,
  PlusCircle,
  Sparkles,
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  Mail,
  UserCheck
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';

  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const [analytics, setAnalytics] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab: Freshers filters
  const [fresherDeptFilter, setFresherDeptFilter] = useState('');
  const [fresherSearch, setFresherSearch] = useState('');

  // Tab: Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('College');
  const [annDept, setAnnDept] = useState('');
  const [annSuccess, setAnnSuccess] = useState<string | null>(null);

  // Tab: Event Form
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtCat, setEvtCat] = useState('Technical');
  const [evtType, setEvtType] = useState('Workshop');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('');
  const [evtLoc, setEvtLoc] = useState('');
  const [evtDept, setEvtDept] = useState('');
  const [evtCap, setEvtCap] = useState('100');
  const [evtSuccess, setEvtSuccess] = useState<string | null>(null);

  // Tab: Timetable Schedule Form
  const [schSubCode, setSchSubCode] = useState('');
  const [schFacEmail, setSchFacEmail] = useState('');
  const [schDay, setSchDay] = useState('Monday');
  const [schStart, setSchStart] = useState('');
  const [schEnd, setSchEnd] = useState('');
  const [schRoom, setSchRoom] = useState('');
  const [schSuccess, setSchSuccess] = useState<string | null>(null);

  // Tab: Transport Form
  const [busNum, setBusNum] = useState('');
  const [busRoute, setBusRoute] = useState('');
  const [busDriver, setBusDriver] = useState('');
  const [busContact, setBusContact] = useState('');
  const [busSuccess, setBusSuccess] = useState<string | null>(null);

  // Tab: Feedback Reply Form
  const [replyText, setReplyText] = useState<{ [id: number]: string }>({});
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const analyticRes = await axios.get('/api/admin/analytics');
      setAnalytics(analyticRes.data);
      
      const feedbackRes = await axios.get('/api/admin/feedback');
      setFeedbacks(feedbackRes.data);

      const studentsRes = await axios.get('/api/admin/students');
      setStudents(studentsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnSuccess(null);
    try {
      await axios.post('/api/admin/announcement', {
        title: annTitle,
        content: annContent,
        category: annCategory,
        departmentCode: annDept || null
      });
      setAnnSuccess('Announcement broadcasted and notifications pushed!');
      setAnnTitle('');
      setAnnContent('');
      setAnnDept('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Broadcast failed');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvtSuccess(null);
    try {
      await axios.post('/api/admin/event', {
        title: evtTitle,
        description: evtDesc,
        category: evtCat,
        type: evtType,
        date: evtDate,
        time: evtTime,
        location: evtLoc,
        departmentCode: evtDept || null,
        maxParticipants: parseInt(evtCap)
      });
      setEvtSuccess('Event added successfully!');
      setEvtTitle('');
      setEvtDesc('');
      setEvtDate('');
      setEvtTime('');
      setEvtLoc('');
      setEvtDept('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Event creation failed');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchSuccess(null);
    try {
      await axios.post('/api/admin/timetable', {
        subjectCode: schSubCode.toUpperCase(),
        facultyEmail: schFacEmail,
        dayOfWeek: schDay,
        startTime: schStart,
        endTime: schEnd,
        roomNumber: schRoom
      });
      setSchSuccess('Class timetable schedule updated successfully!');
      setSchSubCode('');
      setSchFacEmail('');
      setSchStart('');
      setSchEnd('');
      setSchRoom('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Schedule update failed');
    }
  };

  const handleManageTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusSuccess(null);
    try {
      await axios.post('/api/admin/transport', {
        busNumber: busNum,
        route: busRoute,
        driverName: busDriver,
        driverContact: busContact
      });
      setBusSuccess('Transport line updated successfully!');
      setBusNum('');
      setBusRoute('');
      setBusDriver('');
      setBusContact('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Transport update failed');
    }
  };

  const handleReplyFeedback = async (id: number) => {
    const reply = replyText[id];
    if (!reply) return;
    
    setReplySuccess(null);
    try {
      await axios.post('/api/admin/feedback/reply', {
        feedbackId: id,
        reply,
        status: 'Resolved'
      });
      setReplySuccess('Resolution reply posted and student notified!');
      setReplyText(prev => ({ ...prev, [id]: '' }));
      fetchAdminData();
    } catch (err) {
      console.error('Error replying feedback:', err);
    }
  };

  // Filter freshers (Year 1 students)
  const freshersList = students.filter(s => {
    const isFresher = s.year === 1;
    const matchesDept = fresherDeptFilter ? s.departmentCode === fresherDeptFilter : true;
    const matchesSearch = fresherSearch 
      ? s.name.toLowerCase().includes(fresherSearch.toLowerCase()) || s.rollNumber.toLowerCase().includes(fresherSearch.toLowerCase())
      : true;
    return isFresher && matchesDept && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold animate-pulse">Syncing Admin Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">ADMINISTRATION DESK</h1>
        <p className="text-surface-accent text-xs">
          Perform systems checks, broadcast announcements, coordinate transport schedules, plan courses, and inspect freshman adaptation indices.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-surface-accent/15 gap-6 overflow-x-auto">
        {[
          { id: 'analytics', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'freshers', label: 'Freshers Monitor', icon: <Users className="w-4 h-4" /> },
          { id: 'announcements', label: 'News Broadcast', icon: <Megaphone className="w-4 h-4" /> },
          { id: 'events', label: 'Events Scheduler', icon: <Calendar className="w-4 h-4" /> },
          { id: 'schedules', label: 'Timetable & Transit', icon: <Bus className="w-4 h-4" /> },
          { id: 'feedback', label: 'Grievance Resolutions', icon: <MessageSquare className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-surface-accent hover:text-warm-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      <div className="mt-6">
        
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Students', value: analytics?.metrics?.totalStudents, desc: 'Registered Profiles' },
                { label: 'Active Events', value: analytics?.metrics?.totalEvents, desc: 'Upcoming Seminars/Hackathons' },
                { label: 'Feedback Filed', value: analytics?.metrics?.totalFeedback, desc: 'Student Grievances' },
                { label: 'Registrations', value: analytics?.metrics?.totalRegistrations, desc: 'Event Bookings' }
              ].map((card, idx) => (
                <div key={idx} className="glass-card p-6 border border-surface-accent/10">
                  <span className="text-[10px] uppercase tracking-widest text-surface-accent font-bold">{card.label}</span>
                  <h3 className="text-4xl font-extrabold text-warm-white tracking-tight mt-1">{card.value}</h3>
                  <p className="text-[10px] text-accent font-medium mt-1">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Popular Events */}
              <div className="glass-card p-6 space-y-4 border border-surface-accent/10">
                <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/5 pb-2">
                  <Sparkles className="w-4 h-4" /> Most Popular Events
                </h3>
                <div className="divide-y divide-surface-primary/30 text-xs">
                  {analytics?.eventPopularity?.map((evt: any, idx: number) => (
                    <div key={idx} className="py-3 flex justify-between items-center">
                      <span className="font-bold text-warm-white">{evt.title}</span>
                      <span className="font-mono text-accent bg-surface-primary/40 px-2 py-0.5 rounded font-black">
                        {evt.registrations} Booked
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback status */}
              <div className="glass-card p-6 space-y-4 border border-surface-accent/10">
                <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/5 pb-2">
                  <HelpCircle className="w-4 h-4" /> Grievance Resolution Metrics
                </h3>
                <div className="divide-y divide-surface-primary/30 text-xs">
                  {analytics?.feedbackStatus?.map((status: any, idx: number) => (
                    <div key={idx} className="py-3 flex justify-between items-center">
                      <span className="font-bold text-warm-white uppercase tracking-wider">{status.status}</span>
                      <span className={`font-mono px-2 py-0.5 rounded font-bold border ${
                        status.status === 'Resolved' 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30' 
                          : 'bg-amber-950/40 text-amber-400 border-amber-800/30'
                      }`}>
                        {status.count} Files
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FRESHERS DIRECTORY TRACKER */}
        {activeTab === 'freshers' && (
          <div className="glass-card p-6 space-y-6 border border-surface-accent/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-surface-accent/10 pb-4">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-accent font-extrabold flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Freshers Registry & Adaptation Monitor
                </h3>
                <p className="text-[10px] text-surface-accent mt-0.5">Track Year 1 student attendances, averages, and flag warnings when attendance falls below 75%.</p>
              </div>

              {/* Filter Row */}
              <div className="flex gap-3 text-xs w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search by name or roll..."
                  value={fresherSearch}
                  onChange={(e) => setFresherSearch(e.target.value)}
                  className="bg-midnight/50 border border-surface-accent/20 rounded px-3 py-1.5 text-xs text-warm-white placeholder-surface-accent/40 focus:outline-none focus:border-accent w-full md:w-48"
                />
                <select
                  value={fresherDeptFilter}
                  onChange={(e) => setFresherDeptFilter(e.target.value)}
                  className="bg-midnight/50 border border-surface-accent/20 rounded px-3 py-1.5 text-xs text-warm-white focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">All Depts</option>
                  <option value="CS">CSE (Computer Science)</option>
                  <option value="EE">EEE (Electrical)</option>
                  <option value="ME">ME (Mechanical)</option>
                </select>
              </div>
            </div>

            {/* Freshers Grid/Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-surface-accent/10 text-surface-accent font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Department & Class</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4">Academic CGPA</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-primary/25">
                  {freshersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-surface-accent">
                        No freshman students found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    freshersList.map((student) => {
                      const criticalAttendance = student.attendanceRate < 75;
                      const lowCgpa = student.cgpa < 7.0;

                      return (
                        <tr key={student.id} className="hover:bg-surface-primary/10 transition-colors">
                          <td className="py-4 px-4 font-bold text-warm-white">
                            <div>{student.name}</div>
                            <div className="text-[10px] font-normal text-surface-accent flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {student.email}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-accent">{student.rollNumber}</td>
                          <td className="py-4 px-4">
                            <div>Year {student.year}, Sem {student.semester}</div>
                            <div className="text-[10px] text-surface-accent">{student.departmentName} ({student.departmentCode})</div>
                          </td>
                          <td className="py-4 px-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${
                                criticalAttendance ? 'text-rose-400' : 'text-emerald-400'
                              }`}>
                                {student.attendanceRate}%
                              </span>
                              <div className="w-16 bg-midnight/60 h-1.5 rounded overflow-hidden">
                                <div 
                                  className={`h-full rounded ${criticalAttendance ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${student.attendanceRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono">
                            <span className={`font-bold ${lowCgpa ? 'text-amber-400' : 'text-warm-white'}`}>
                              {student.cgpa.toFixed(2)} / 10.00
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {criticalAttendance ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-950/40 border border-rose-800/30 text-rose-300 font-extrabold uppercase text-[8px] tracking-wider animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5" /> Short Attendance
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 font-extrabold uppercase text-[8px] tracking-wider">
                                <UserCheck className="w-2.5 h-2.5" /> Stable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BROADCAST ANNOUNCEMENT */}
        {activeTab === 'announcements' && (
          <div className="max-w-xl glass-card p-6 bg-surface-primary/10 border border-surface-accent/10">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 mb-6 border-b border-surface-accent/10 pb-3">
              <Megaphone className="w-4 h-4" /> Broadcast News Notice
            </h3>

            {annSuccess && (
              <div className="p-3 mb-4 rounded bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-xs">
                {annSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Extended library study hours during exams..."
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Announcement Type</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value)}
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="Urgent">Urgent Warning</option>
                  <option value="College">College Wide News</option>
                  <option value="Department">Department Specific Notice</option>
                  <option value="Achievement">Student Achievement Spotlight</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Department Scope (Optional)</label>
                <input
                  type="text"
                  value={annDept}
                  onChange={(e) => setAnnDept(e.target.value)}
                  placeholder="CS or EE (leave blank for college-wide)"
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Detailed Content</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Detail the notice content here..."
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-btn-gradient text-midnight font-bold py-2.5 rounded hover:opacity-90 active:scale-[0.99] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Publish notice
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SCHEDULE EVENT */}
        {activeTab === 'events' && (
          <div className="max-w-xl glass-card p-6 bg-surface-primary/10 border border-surface-accent/10">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 mb-6 border-b border-surface-accent/10 pb-3">
              <Calendar className="w-4 h-4" /> Schedule New Event
            </h3>

            {evtSuccess && (
              <div className="p-3 mb-4 rounded bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-xs">
                {evtSuccess}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={evtTitle}
                    onChange={(e) => setEvtTitle(e.target.value)}
                    placeholder="GameDev Hack Sprint..."
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Category</label>
                  <select
                    value={evtCat}
                    onChange={(e) => setEvtCat(e.target.value)}
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Innovation">Innovation & Hackathons</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Type</label>
                  <select
                    value={evtType}
                    onChange={(e) => setEvtType(e.target.value)}
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Event">General Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Department Specific</label>
                  <input
                    type="text"
                    value={evtDept}
                    onChange={(e) => setEvtDept(e.target.value)}
                    placeholder="CS or EE (optional)"
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Date</label>
                  <input
                    type="text"
                    required
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    placeholder="2026-07-28"
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={evtTime}
                    onChange={(e) => setEvtTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Max Bookings</label>
                  <input
                    type="number"
                    required
                    value={evtCap}
                    onChange={(e) => setEvtCap(e.target.value)}
                    placeholder="100"
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Venue Location</label>
                <input
                  type="text"
                  required
                  value={evtLoc}
                  onChange={(e) => setEvtLoc(e.target.value)}
                  placeholder="Main Seminar Hall..."
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Short Description</label>
                <textarea
                  required
                  rows={3}
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  placeholder="Outline the event program agenda..."
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-btn-gradient text-midnight font-bold py-2.5 rounded hover:opacity-90 active:scale-[0.99] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Create Event Listing
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: TIMETABLE & TRANSIT */}
        {activeTab === 'schedules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Class Timetable Scheduler */}
            <div className="glass-card p-6 bg-surface-primary/10 border border-surface-accent/10 space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-accent font-extrabold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
                  <Clock className="w-4 h-4" /> Plan Class Timetable Schedule
                </h3>
                <p className="text-[10px] text-surface-accent mt-1">Schedule lectures and allocate classroom spaces for academic subjects.</p>
              </div>

              {schSuccess && (
                <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-xs">
                  {schSuccess}
                </div>
              )}

              <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Subject Code</label>
                    <input
                      type="text"
                      required
                      value={schSubCode}
                      onChange={(e) => setSchSubCode(e.target.value)}
                      placeholder="e.g., CS301"
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Faculty Email</label>
                    <input
                      type="email"
                      required
                      value={schFacEmail}
                      onChange={(e) => setSchFacEmail(e.target.value)}
                      placeholder="e.g., aris@nexora.edu"
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Day of Week</label>
                    <select
                      value={schDay}
                      onChange={(e) => setSchDay(e.target.value)}
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-3 py-2 text-warm-white focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Start Time</label>
                    <input
                      type="text"
                      required
                      value={schStart}
                      onChange={(e) => setSchStart(e.target.value)}
                      placeholder="09:00"
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-3 py-2 text-warm-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">End Time</label>
                    <input
                      type="text"
                      required
                      value={schEnd}
                      onChange={(e) => setSchEnd(e.target.value)}
                      placeholder="10:30"
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-3 py-2 text-warm-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Room Allocation</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-surface-accent" />
                    <input
                      type="text"
                      required
                      value={schRoom}
                      onChange={(e) => setSchRoom(e.target.value)}
                      placeholder="Room 102"
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded pl-9 pr-4 py-2 text-warm-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-btn-gradient text-midnight font-bold py-2.5 rounded hover:opacity-90 active:scale-[0.99] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Save Schedule Slot
                </button>
              </form>
            </div>

            {/* Transit Lines Coordinator */}
            <div className="glass-card p-6 bg-surface-primary/10 border border-surface-accent/10 space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-accent font-extrabold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
                  <Bus className="w-4 h-4" /> Transit Lines & Bus Routes
                </h3>
                <p className="text-[10px] text-surface-accent mt-1">Manage institutional transport routes, driver details, and contact logs.</p>
              </div>

              {busSuccess && (
                <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-xs">
                  {busSuccess}
                </div>
              )}

              <form onSubmit={handleManageTransport} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Bus Number Code</label>
                    <input
                      type="text"
                      required
                      value={busNum}
                      onChange={(e) => setBusNum(e.target.value)}
                      placeholder="Route-15C..."
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Driver Full Name</label>
                    <input
                      type="text"
                      required
                      value={busDriver}
                      onChange={(e) => setBusDriver(e.target.value)}
                      placeholder="Gary Miller"
                      className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Driver Contact Number</label>
                  <input
                    type="text"
                    required
                    value={busContact}
                    onChange={(e) => setBusContact(e.target.value)}
                    placeholder="+1 (555) 012-9842"
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Full Travel Route Path</label>
                  <input
                    type="text"
                    required
                    value={busRoute}
                    onChange={(e) => setBusRoute(e.target.value)}
                    placeholder="West Suburbs -> Highway exit -> Central Mall -> Main Campus Gate"
                    className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-warm-white focus:outline-none focus:border-accent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-btn-gradient text-midnight font-bold py-2.5 rounded hover:opacity-90 active:scale-[0.99] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Save bus route
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: RESOLVE GRIEVANCES */}
        {activeTab === 'feedback' && (
          <div className="glass-card p-6 space-y-6 border border-surface-accent/10">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
              <MessageSquare className="w-4 h-4" /> Grievance Resolution Inbox
            </h3>

            {replySuccess && (
              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-xs">
                {replySuccess}
              </div>
            )}

            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 text-xs">
              {feedbacks.length === 0 ? (
                <p className="text-xs text-surface-accent text-center py-12">No feedbacks registered.</p>
              ) : (
                feedbacks.map((item) => (
                  <div key={item.id} className="p-4 rounded border border-surface-accent/15 bg-surface-primary/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-accent tracking-widest bg-surface-primary px-2 py-0.5 rounded mr-2">
                          {item.category}
                        </span>
                        {item.isAnonymous && (
                          <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-widest bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-900/30">
                            Anonymous
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-warm-white mt-2">{item.title}</h4>
                      </div>
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-black font-mono border ${
                        item.status === 'Resolved' 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30' 
                          : 'bg-amber-950/40 text-amber-400 border-amber-800/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-surface-accent">{item.message}</p>

                    <div className="flex justify-between items-center text-[9px] text-surface-accent/70 border-t border-surface-accent/5 pt-2 mt-2">
                      <span>Submitted by: {item.studentName} (Roll: {item.rollNumber}, Dept: {item.departmentCode})</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Reply section */}
                    {item.status === 'Pending' ? (
                      <div className="mt-4 pt-3 border-t border-surface-accent/10 space-y-2">
                        <textarea
                          rows={2}
                          value={replyText[item.id] || ''}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Type grievance resolution reply..."
                          className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-3 py-1.5 text-xs text-warm-white placeholder-surface-accent/40 focus:outline-none focus:border-accent resize-none"
                        ></textarea>
                        <button
                          onClick={() => handleReplyFeedback(item.id)}
                          disabled={!replyText[item.id]}
                          className="bg-btn-gradient text-midnight font-bold px-4 py-1.5 rounded hover:opacity-90 text-[10px] uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Submit Resolution Reply
                        </button>
                      </div>
                    ) : (
                      <div className="bg-surface-primary/30 border-l-2 border-accent p-3 rounded text-[11px] mt-3 space-y-1">
                        <p className="text-[9px] uppercase tracking-widest text-accent font-bold">Admin reply logged:</p>
                        <p className="text-warm-secondary italic">"{item.adminReply}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
