import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Code, Award, Target, Flame, Filter } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('Coding');
  const [selectedDept, setSelectedDept] = useState<string>('');

  const categories = [
    { name: 'Coding', icon: <Code className="w-3.5 h-3.5" /> },
    { name: 'Hackathons', icon: <Award className="w-3.5 h-3.5" /> },
    { name: 'Innovation', icon: <Target className="w-3.5 h-3.5" /> },
    { name: 'Sports', icon: <Flame className="w-3.5 h-3.5" /> }
  ];

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let url = `/api/student/leaderboard?category=${selectedCategory}`;
      if (selectedDept) {
        url += `&department=${selectedDept}`;
      }
      const res = await axios.get(url);
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory, selectedDept]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">LEADERBOARDS</h1>
        <p className="text-surface-accent text-xs">
          Rankings of students across technical sprints, hackathons, innovations, and sports tournaments.
        </p>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-primary/10 p-4 border border-surface-accent/10 rounded-lg">
        {/* Category Toggles */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-btn-gradient text-midnight'
                  : 'bg-surface-primary/30 text-surface-accent border border-surface-accent/15 hover:text-warm-white'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-accent" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-surface-primary/30 border border-surface-accent/20 rounded px-3 py-1.5 text-xs text-warm-white focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="">All Departments</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="EE">Electrical (EE)</option>
            <option value="ME">Mechanical (ME)</option>
          </select>
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="glass-card p-6 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center text-xs text-surface-accent">
            No rankings found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-accent/15 text-surface-accent uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold w-16">Rank</th>
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Roll Number</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold text-right">Points Secured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-primary/30 text-warm-white">
                {leaderboard.map((item, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={index} className="hover:bg-surface-primary/5">
                      <td className="py-3.5">
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs ${
                          rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                          rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/20' :
                          rank === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/20' :
                          'text-surface-accent font-light'
                        }`}>
                          {rank === 1 && <Trophy className="w-3.5 h-3.5 mr-0.5" />}
                          {rank}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold flex items-center gap-2">
                        {item.student_name}
                      </td>
                      <td className="py-3.5 font-mono text-surface-accent">{item.roll_number}</td>
                      <td className="py-3.5 font-semibold text-accent font-mono">{item.department_code}</td>
                      <td className="py-3.5 text-right font-mono font-black text-warm-white">
                        {item.points.toLocaleString()} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
