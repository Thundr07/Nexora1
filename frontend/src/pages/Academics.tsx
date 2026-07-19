import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Award, 
  CheckSquare, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  AlertCircle
} from 'lucide-react';

const Academics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);

  const fetchAcademicsData = async () => {
    try {
      const res = await axios.get('/api/student/academics');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching academic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicsData();
  }, []);

  const handleToggleAssignment = async (assignmentId: number, currentStatus: string) => {
    setToggleLoading(assignmentId);
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      await axios.post('/api/student/toggle-assignment', { assignmentId, status: newStatus });
      fetchAcademicsData(); // Reload status
    } catch (err) {
      console.error('Error toggling assignment:', err);
    } finally {
      setToggleLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold animate-pulse">Syncing Grades...</span>
        </div>
      </div>
    );
  }

  const pendingAssignments = data?.assignments?.filter((a: any) => a.status === 'Pending') || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CGPA */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-surface-accent font-bold">Cumulative GPA</span>
            <h3 className="text-4xl font-extrabold text-warm-white tracking-tight mt-1">{data?.cgpa.toFixed(2)}</h3>
            <p className="text-[11px] text-accent mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Top 5% of Department
            </p>
          </div>
          <div className="w-12 h-12 rounded bg-surface-primary flex items-center justify-center border border-surface-accent/15">
            <Award className="w-6 h-6 text-accent" />
          </div>
        </div>

        {/* Attendance */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-surface-accent font-bold">Attendance Rate</span>
            <h3 className="text-4xl font-extrabold text-warm-white tracking-tight mt-1">{data?.attendance?.percentage}%</h3>
            <p className="text-[11px] text-surface-accent mt-1">
              Present: {data?.attendance?.present} • Absent: {data?.attendance?.absent} • Late: {data?.attendance?.late}
            </p>
          </div>
          <div className="w-12 h-12 rounded bg-surface-primary flex items-center justify-center border border-surface-accent/15">
            <CheckSquare className="w-6 h-6 text-accent" />
          </div>
        </div>

        {/* Assignments Pending */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-surface-accent font-bold">Tasks & Assignments</span>
            <h3 className="text-4xl font-extrabold text-warm-white tracking-tight mt-1">{pendingAssignments.length}</h3>
            <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Action required
            </p>
          </div>
          <div className="w-12 h-12 rounded bg-surface-primary flex items-center justify-center border border-surface-accent/15">
            <BookOpen className="w-6 h-6 text-accent" />
          </div>
        </div>
      </div>

      {/* 2. PLOTS & BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Marks details & chart */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SEMESTER PERFORMANCE CHART */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5" /> Performance Trends (GPA)
            </h3>
            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#748CAB" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#748CAB" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="semester" 
                    stroke="#748CAB" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false} 
                  />
                  <YAxis 
                    domain={[6.0, 10.0]} 
                    stroke="#748CAB" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1D2D44', 
                      borderColor: 'rgba(116,140,171,0.2)',
                      borderRadius: '6px',
                      color: '#F0EBD8',
                      fontSize: '11px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="GPA" 
                    stroke="#748CAB" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorGpa)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* INTERNAL MARKS TABLE */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5" /> Subject Internal Evaluations
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-surface-accent/15 text-surface-accent uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Subject</th>
                    <th className="pb-3 font-semibold">Evaluation Type</th>
                    <th className="pb-3 font-semibold text-right">Marks Secured</th>
                    <th className="pb-3 font-semibold text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-primary/30 text-warm-white">
                  {data?.marks?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-surface-accent">No evaluation marks recorded.</td>
                    </tr>
                  ) : (
                    data?.marks?.map((mark: any) => {
                      const percentage = Math.round((mark.score / mark.max_score) * 100);
                      return (
                        <tr key={mark.id} className="hover:bg-surface-primary/5">
                          <td className="py-3.5">
                            <span className="font-bold block">{mark.subject_name}</span>
                            <span className="text-[10px] text-surface-accent font-mono">{mark.subject_code}</span>
                          </td>
                          <td className="py-3.5 font-medium">{mark.type}</td>
                          <td className="py-3.5 text-right font-mono font-bold">
                            {mark.score} <span className="text-surface-accent">/ {mark.max_score}</span>
                          </td>
                          <td className="py-3.5 pl-6">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-24 bg-midnight rounded-full h-1.5 overflow-hidden border border-surface-accent/10">
                                <div 
                                  className="bg-btn-gradient h-full rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold font-mono w-8 text-right">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Assignments Tasks */}
        <div className="lg:col-span-4">
          
          {/* ASSIGNMENTS DEADLINE LIST */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 mb-2">
              <Calendar className="w-4.5 h-4.5" /> Assignment Checklists
            </h3>
            
            <div className="space-y-4">
              {data?.assignments?.length === 0 ? (
                <p className="text-xs text-surface-accent text-center py-4">No assignments issued.</p>
              ) : (
                data?.assignments?.map((task: any) => (
                  <div 
                    key={task.id} 
                    className={`p-4 rounded border transition-all flex items-start gap-3 ${
                      task.status === 'Completed'
                        ? 'bg-surface-primary/10 border-surface-accent/5 opacity-60'
                        : 'bg-surface-primary/20 border-surface-accent/15'
                    }`}
                  >
                    <button
                      disabled={toggleLoading === task.id}
                      onClick={() => handleToggleAssignment(task.id, task.status)}
                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors cursor-pointer mt-0.5 ${
                        task.status === 'Completed' 
                          ? 'bg-accent border-accent text-midnight' 
                          : 'border-surface-accent/40 hover:border-accent'
                      }`}
                      aria-label={task.status === 'Completed' ? 'Mark task as pending' : 'Mark task as completed'}
                    >
                      {task.status === 'Completed' && (
                        <svg className="w-3 h-3 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <h4 className={`text-xs font-bold ${task.status === 'Completed' ? 'line-through text-surface-accent' : 'text-warm-white'}`}>
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-surface-accent leading-relaxed">{task.description}</p>
                      
                      <div className="flex items-center justify-between pt-1.5 border-t border-surface-accent/5 mt-1.5 text-[9px] font-mono">
                        <span className="text-surface-accent font-semibold">{task.subject_name}</span>
                        <span className={task.status === 'Completed' ? 'text-surface-accent' : 'text-red-400 font-bold'}>
                          Due: {task.due_date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Academics;
