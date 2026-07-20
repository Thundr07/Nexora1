import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Code, Award, Target, Flame, Filter, ExternalLink, Cpu, PlusCircle, CheckCircle, RefreshCw, X } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('LeetCode');
  const [selectedDept, setSelectedDept] = useState<string>('');

  // Modal State for updating handle
  const [showModal, setShowModal] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [solvedInput, setSolvedInput] = useState('');
  const [easyInput, setEasyInput] = useState('');
  const [mediumInput, setMediumInput] = useState('');
  const [hardInput, setHardInput] = useState('');
  const [ratingInput, setRatingInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const categories = [
    { name: 'LeetCode', icon: <Code className="w-3.5 h-3.5 text-amber-400" /> },
    { name: 'Coding', icon: <Cpu className="w-3.5 h-3.5" /> },
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

  const handleUpdateHandle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    setSubmitting(true);
    try {
      await axios.put('/api/student/leetcode-handle', {
        handle: handleInput.trim(),
        solved: solvedInput ? parseInt(solvedInput) : undefined,
        easy: easyInput ? parseInt(easyInput) : undefined,
        medium: mediumInput ? parseInt(mediumInput) : undefined,
        hard: hardInput ? parseInt(hardInput) : undefined,
        rating: ratingInput ? parseInt(ratingInput) : undefined
      });
      setSuccessMsg('LeetCode handle updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setShowModal(false);
        fetchLeaderboard();
      }, 1200);
    } catch (err) {
      console.error('Failed to update LeetCode handle:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Computing stats summary
  const totalSolvedAggregate = leaderboard.reduce((acc, curr) => acc + (curr.leetcode_solved || 0), 0);
  const topCoder = leaderboard.length > 0 && selectedCategory === 'LeetCode' ? leaderboard[0] : null;
  const maxRating = leaderboard.length > 0 && selectedCategory === 'LeetCode'
    ? Math.max(...leaderboard.map(item => item.leetcode_rating || 0))
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">LEADERBOARDS</h1>
            {selectedCategory === 'LeetCode' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase flex items-center gap-1">
                <Code className="w-3 h-3" /> Computing Arena
              </span>
            )}
          </div>
          <p className="text-surface-accent text-xs">
            Rankings of students across LeetCode coding sprints, hackathons, innovations, and sports.
          </p>
        </div>

        {selectedCategory === 'LeetCode' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-midnight font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Link My LeetCode Handle
          </button>
        )}
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
                  ? 'bg-btn-gradient text-midnight shadow-md shadow-accent/20'
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
            {selectedCategory === 'LeetCode' ? (
              <>
                <option value="">All Computing Branches (CS, IT, AIDS)</option>
                <option value="CS">Computer Science (CS)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="AIDS">AI & Data Science (AIDS)</option>
              </>
            ) : (
              <>
                <option value="">All Departments</option>
                <option value="CS">Computer Science (CS)</option>
                <option value="EE">Electrical (EE)</option>
                <option value="ME">Mechanical (ME)</option>
                <option value="IT">Information Tech (IT)</option>
                <option value="AIDS">AI & Data Science (AIDS)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* LEETCODE COMPUTING BRANCHES BANNER & WIDGETS */}
      {selectedCategory === 'LeetCode' ? (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-400 uppercase tracking-wider">Computing Branches Arena</span>
                <p className="text-surface-accent text-[11px] mt-0.5">
                  Displaying problem-solving statistics for students in <span className="text-amber-300 font-semibold">Computer Science (CS)</span>, <span className="text-amber-300 font-semibold">Information Technology (IT)</span>, and <span className="text-amber-300 font-semibold">AI & Data Science (AIDS)</span>.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-mono text-[10px] rounded border border-amber-500/30">
              Live Algorithmic Rankings
            </span>
          </div>

          {/* SUMMARY STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 border border-surface-accent/15">
              <span className="text-[10px] font-extrabold uppercase text-surface-accent tracking-wider">Top Coder</span>
              <div className="text-lg font-black text-amber-400 mt-1 truncate">
                {topCoder ? topCoder.student_name : 'N/A'}
              </div>
              <p className="text-[11px] font-mono text-surface-accent mt-0.5 truncate">
                {topCoder ? `@${topCoder.leetcode_handle} (${topCoder.leetcode_solved} Solved)` : 'No entry'}
              </p>
            </div>

            <div className="glass-card p-4 border border-surface-accent/15">
              <span className="text-[10px] font-extrabold uppercase text-surface-accent tracking-wider">Total Branch Solved</span>
              <div className="text-lg font-black text-emerald-400 mt-1 font-mono">
                {totalSolvedAggregate.toLocaleString()}
              </div>
              <p className="text-[11px] text-surface-accent mt-0.5">Problems solved across department</p>
            </div>

            <div className="glass-card p-4 border border-surface-accent/15">
              <span className="text-[10px] font-extrabold uppercase text-surface-accent tracking-wider">Highest Rating</span>
              <div className="text-lg font-black text-cyan-400 mt-1 font-mono">
                {maxRating > 0 ? maxRating : 1500}
              </div>
              <p className="text-[11px] text-surface-accent mt-0.5">Peak LeetCode contest rating</p>
            </div>

            <div className="glass-card p-4 border border-surface-accent/15">
              <span className="text-[10px] font-extrabold uppercase text-surface-accent tracking-wider">Computing Coders</span>
              <div className="text-lg font-black text-purple-400 mt-1 font-mono">
                {leaderboard.length}
              </div>
              <p className="text-[11px] text-surface-accent mt-0.5">Ranked computing students</p>
            </div>
          </div>
        </div>
      ) : (
        /* GENERAL CATEGORY SUMMARY STATS GRID */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 border border-surface-accent/15">
            <span className="text-[10px] font-extrabold uppercase text-surface-accent tracking-wider">{selectedCategory} Leader</span>
            <div className="text-lg font-black text-accent mt-1 truncate">
              {leaderboard.length > 0 && leaderboard[0]?.student_name ? leaderboard[0].student_name : 'N/A'}
            </div>
            <p className="text-[11px] font-mono text-surface-accent mt-0.5 truncate">
              {leaderboard.length > 0 && leaderboard[0]?.points !== undefined
                ? `${Number(leaderboard[0].points || 0).toLocaleString()} pts (${leaderboard[0].department_code || ''})`
                : 'No entry'}
            </p>
          </div>

          <div className="glass-card p-4 border border-surface-accent/15">
            <span className="text-[10px] font-extrabold uppercase text-surface-accent tracking-wider">Total Points</span>
            <div className="text-lg font-black text-emerald-400 mt-1 font-mono">
              {leaderboard.reduce((acc, item) => acc + Number(item?.points || 0), 0).toLocaleString()} pts
            </div>
            <p className="text-[11px] text-surface-accent mt-0.5">Category aggregate score</p>
          </div>

          <div className="glass-card p-4 border border-surface-accent/15">
            <span className="text-[10px] font-extrabold uppercase text-surface-accent tracking-wider">Average Points</span>
            <div className="text-lg font-black text-cyan-400 mt-1 font-mono">
              {leaderboard.length > 0
                ? Math.round(leaderboard.reduce((acc, item) => acc + Number(item?.points || 0), 0) / leaderboard.length).toLocaleString()
                : 0} pts
            </div>
            <p className="text-[11px] text-surface-accent mt-0.5">Mean participant score</p>
          </div>

          <div className="glass-card p-4 border border-surface-accent/15">
            <span className="text-[10px] font-extrabold uppercase text-surface-accent tracking-wider">Ranked Competitors</span>
            <div className="text-lg font-black text-purple-400 mt-1 font-mono">
              {leaderboard.length}
            </div>
            <p className="text-[11px] text-surface-accent mt-0.5">Active participants</p>
          </div>
        </div>
      )}

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
                  <th className="pb-3 font-semibold">Department</th>
                  {selectedCategory === 'LeetCode' ? (
                    <>
                      <th className="pb-3 font-semibold">LeetCode Handle</th>
                      <th className="pb-3 font-semibold text-center">Problems Solved (E / M / H)</th>
                      <th className="pb-3 font-semibold text-center">Contest Rating</th>
                      <th className="pb-3 font-semibold text-right">Global Rank</th>
                    </>
                  ) : (
                    <>
                      <th className="pb-3 font-semibold">Roll Number</th>
                      <th className="pb-3 font-semibold text-right">Points Secured</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-primary/30 text-warm-white">
                {leaderboard.map((item, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={index} className="hover:bg-surface-primary/5 transition-colors">
                      {/* RANK */}
                      <td className="py-3.5">
                        <span className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs ${
                          rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/20' :
                          rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                          rank === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                          'text-surface-accent font-light'
                        }`}>
                          {rank === 1 && <Trophy className="w-3.5 h-3.5 mr-0.5" />}
                          {rank}
                        </span>
                      </td>

                      {/* STUDENT NAME */}
                      <td className="py-3.5 font-bold">
                        <div>
                          <span>{item.student_name}</span>
                          <div className="text-[10px] font-mono text-surface-accent font-normal">{item.roll_number}</div>
                        </div>
                      </td>

                      {/* DEPARTMENT */}
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ['CS', 'IT', 'AIDS'].includes(item.department_code)
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                            : 'bg-accent/10 text-accent border border-accent/20'
                        }`}>
                          {item.department_code}
                        </span>
                      </td>

                      {/* LEETCODE SPECIFIC COLUMNS */}
                      {selectedCategory === 'LeetCode' ? (
                        <>
                          {/* HANDLE LINK */}
                          <td className="py-3.5 font-mono">
                            {item.leetcode_handle ? (
                              <a
                                href={`https://leetcode.com/u/${item.leetcode_handle}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:underline font-semibold"
                              >
                                @{item.leetcode_handle}
                                <ExternalLink className="w-3 h-3 text-amber-400/70" />
                              </a>
                            ) : (
                              <span className="text-surface-accent font-normal italic">Unlinked</span>
                            )}
                          </td>

                          {/* PROBLEMS SOLVED & BREAKDOWN */}
                          <td className="py-3.5 text-center font-mono">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-black text-sm text-warm-white">
                                {Number(item.leetcode_solved || 0).toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded" title="Easy Solved">
                                  {item.leetcode_easy || 0} E
                                </span>
                                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded" title="Medium Solved">
                                  {item.leetcode_medium || 0} M
                                </span>
                                <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded" title="Hard Solved">
                                  {item.leetcode_hard || 0} H
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* CONTEST RATING */}
                          <td className="py-3.5 text-center font-mono font-bold">
                            <div className="flex flex-col items-center">
                              <span className="text-amber-300">{item.leetcode_rating || 1500}</span>
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-surface-accent">
                                {(item.leetcode_rating || 1500) >= 1900 ? 'Guardian' : (item.leetcode_rating || 1500) >= 1700 ? 'Knight' : 'Specialist'}
                              </span>
                            </div>
                          </td>

                          {/* GLOBAL RANK */}
                          <td className="py-3.5 text-right font-mono text-surface-accent font-semibold">
                            {item.leetcode_ranking > 0 ? `#${Number(item.leetcode_ranking).toLocaleString()}` : 'Top 5%'}
                          </td>
                        </>
                      ) : (
                        /* GENERAL LEADERBOARD COLUMNS */
                        <>
                          <td className="py-3.5 font-mono text-surface-accent">{item.roll_number}</td>
                          <td className="py-3.5 text-right font-mono font-black text-warm-white">
                            {Number(item?.points || 0).toLocaleString()} pts
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE LEETCODE HANDLE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-6 max-w-md w-full border border-amber-500/30 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-surface-accent hover:text-warm-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs tracking-wider">
                <Code className="w-4 h-4" /> Link LeetCode Account
              </div>
              <h2 className="text-xl font-black text-warm-white">Update LeetCode Handle</h2>
              <p className="text-surface-accent text-xs">
                Enter your LeetCode username to showcase your problem-solving metrics on the Computing Leaderboard.
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleUpdateHandle} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-surface-accent font-semibold">LeetCode Username / Handle *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alice_vance"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  className="w-full bg-surface-primary/30 border border-surface-accent/20 rounded px-3 py-2 text-warm-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-surface-accent font-semibold">Total Solved</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={solvedInput}
                    onChange={(e) => setSolvedInput(e.target.value)}
                    className="w-full bg-surface-primary/30 border border-surface-accent/20 rounded px-3 py-2 text-warm-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-surface-accent font-semibold">Contest Rating</label>
                  <input
                    type="number"
                    placeholder="e.g. 1750"
                    value={ratingInput}
                    onChange={(e) => setRatingInput(e.target.value)}
                    className="w-full bg-surface-primary/30 border border-surface-accent/20 rounded px-3 py-2 text-warm-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-emerald-400 font-semibold text-[10px]">Easy Count</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={easyInput}
                    onChange={(e) => setEasyInput(e.target.value)}
                    className="w-full bg-surface-primary/30 border border-emerald-500/30 rounded px-2 py-1.5 text-warm-white focus:outline-none focus:border-emerald-400 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-amber-400 font-semibold text-[10px]">Medium Count</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={mediumInput}
                    onChange={(e) => setMediumInput(e.target.value)}
                    className="w-full bg-surface-primary/30 border border-amber-500/30 rounded px-2 py-1.5 text-warm-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-rose-400 font-semibold text-[10px]">Hard Count</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={hardInput}
                    onChange={(e) => setHardInput(e.target.value)}
                    className="w-full bg-surface-primary/30 border border-rose-500/30 rounded px-2 py-1.5 text-warm-white focus:outline-none focus:border-rose-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-surface-primary/30 text-surface-accent hover:text-warm-white cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-midnight font-bold tracking-wider uppercase cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save & Link Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
