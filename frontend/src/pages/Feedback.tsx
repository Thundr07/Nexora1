import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, AlertCircle, Clock, CheckCircle2, Shield } from 'lucide-react';

const Feedback: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState('Academics');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchFeedbackHistory = async () => {
    try {
      const res = await axios.get('/api/student/feedback');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching feedback history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setSubmitting(true);
    setSuccess(null);
    try {
      await axios.post('/api/student/feedback', {
        category,
        title,
        message,
        isAnonymous
      });
      setSuccess('Feedback submitted successfully. Administrators have been notified.');
      setTitle('');
      setMessage('');
      setIsAnonymous(false);
      fetchFeedbackHistory(); // Reload history
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">FEEDBACK PORTAL</h1>
        <p className="text-surface-accent text-xs">
          Submit recommendations or grievances directly to the college administration. Choose to submit anonymously if desired.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Submit Feedback */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 bg-surface-primary/10 space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
              <MessageSquare className="w-4 h-4" /> File a Feedback Ticket
            </h3>

            {success && (
              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-[11px] leading-relaxed">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-xs text-warm-white focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="Academics" className="bg-midnight">Academics & Curriculum</option>
                  <option value="Facilities" className="bg-midnight">Campus Facilities</option>
                  <option value="Hostel" className="bg-midnight">Hostel & Housing</option>
                  <option value="Transport" className="bg-midnight">Bus & Transit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Subject Header</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize the concern..."
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-xs text-warm-white placeholder-surface-accent/40 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-accent font-semibold mb-1">Detailed Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details, dates, or location regarding the issue..."
                  className="w-full bg-midnight/50 border border-surface-accent/20 rounded px-4 py-2 text-xs text-warm-white placeholder-surface-accent/40 focus:outline-none focus:border-accent transition-colors resize-none"
                ></textarea>
              </div>

              {/* Anonymous Flag Toggle */}
              <div className="flex items-center gap-2 bg-midnight/40 p-3 rounded border border-surface-accent/10">
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded border-surface-accent/35 cursor-pointer"
                />
                <label htmlFor="anonymous-toggle" className="text-[11px] text-warm-white font-medium select-none cursor-pointer flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-accent" /> File Anonymously
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !title || !message}
                className="w-full bg-btn-gradient text-midnight font-bold py-2.5 rounded hover:opacity-90 active:scale-[0.99] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-midnight border-t-transparent animate-spin"></div>
                ) : (
                  'File grievance'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Feedback History */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5 border-b border-surface-accent/10 pb-3">
              <Clock className="w-4 h-4" /> Grievance & Feedback History
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-surface-accent text-center py-12">You have not submitted any feedbacks.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div key={item.id} className="p-4 rounded border border-surface-accent/15 bg-surface-primary/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-accent tracking-widest bg-surface-primary px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-warm-white mt-2">{item.title}</h4>
                      </div>
                      
                      {/* Status badge */}
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
                      <span>Posted by: {item.studentName}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Admin Response Box */}
                    {item.adminReply && (
                      <div className="bg-surface-primary/30 border-l-2 border-accent p-3 rounded text-xs mt-3 space-y-1">
                        <p className="text-[9px] uppercase tracking-widest text-accent font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Admin Resolution Response
                        </p>
                        <p className="text-[11px] leading-relaxed text-warm-secondary italic">
                          "{item.adminReply}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
