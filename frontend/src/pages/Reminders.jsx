import { useState } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useHealth } from "../context/HealthContext.jsx";

export default function Reminders() {
  const { reminders, editReminder, deleteReminder, markReminderCompleted } = useHealth();
  
  // Modal states for editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ text: "", days: 30 });
  const [showAddModal, setShowAddModal] = useState(false);

  // Calendar setup
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleDateString(undefined, { month: "long" });
  
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  const daysArray = [];
  for (let i = 0; i < firstDay; i++) daysArray.push(null);
  for (let i = 1; i <= totalDays; i++) daysArray.push(i);

  const getRemindersForDay = (day) => {
    if (!day) return [];
    return reminders.filter((r) => {
      const targetDate = new Date(new Date(r.date).getTime() + r.days * 24 * 60 * 60 * 1000);
      return (
        targetDate.getDate() === day &&
        targetDate.getMonth() === month &&
        targetDate.getFullYear() === year
      );
    });
  };

  const openEdit = (rem) => {
    setEditingId(rem.id);
    setEditForm({ text: rem.text, days: rem.days });
  };

  const saveEdit = (e) => {
    e.preventDefault();
    editReminder(editingId, editForm.text, editForm.days);
    setEditingId(null);
  };

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>Follow-Up Reminders</h1>
          <p>AI-extracted follow-ups scheduled onto clinical calendars, countdowns, and completion logging.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns: Reminder List */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-zinc-200 mb-1">Active Reminder Schedule</h3>

          {reminders.length === 0 ? (
            <div className="glass empty p-12 text-center border border-dashed border-purple-500/15">
              <Icon d={P.clock} className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3>No reminders set</h3>
              <p className="text-xs text-zinc-400 mt-1">Upload reports with implied follow-up statements to populate reminder lists.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reminders.map((rem) => {
                const targetDate = new Date(new Date(rem.date).getTime() + rem.days * 24 * 60 * 60 * 1000);
                const diffTime = targetDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const daysLeft = diffDays < 0 ? 0 : diffDays;
                
                const isCompleted = rem.status === "completed";
                const isMissed = !isCompleted && diffDays < 0;

                return (
                  <div 
                    key={rem.id} 
                    className={`glass p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-3 transition-all ${
                      isCompleted ? "border-emerald-500/10 bg-emerald-500/5 opacity-70" :
                      isMissed ? "border-red-500/10 bg-red-500/5" :
                      "border-purple-500/10 hover:border-purple-500/20"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          isCompleted ? "bg-emerald-400" :
                          isMissed ? "bg-red-400" : "bg-cyan-400"
                        }`} />
                        <h4 className={`text-xs font-bold truncate ${isCompleted ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                          {rem.text}
                        </h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">{rem.reason || "AI Extraction"}</p>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">
                        Due Date: {targetDate.toLocaleDateString()} · Status: <span className="uppercase font-bold">{rem.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Countdown badge */}
                      {!isCompleted && !isMissed && (
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 px-2.5 py-1 rounded-full font-mono font-bold">
                          {daysLeft} days left
                        </span>
                      )}
                      {isMissed && (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/15 px-2.5 py-1 rounded-full font-mono font-bold">
                          Overdue
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2.5 py-1 rounded-full font-mono font-bold">
                          Completed
                        </span>
                      )}

                      {/* Operations */}
                      <div className="flex items-center gap-1.5 border-l border-purple-500/10 pl-3">
                        <button 
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isCompleted ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                          }`}
                          title={isCompleted ? "Mark Pending" : "Mark Completed"}
                          onClick={() => markReminderCompleted(rem.id, rem.status)}
                        >
                          <Icon d={P.check} className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center"
                          title="Edit"
                          onClick={() => openEdit(rem)}
                        >
                          <Icon d={P.user} className="w-3.5 h-3.5" /> {/* fallback edit icon */}
                        </button>
                        <button 
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-red-400 flex items-center justify-center"
                          title="Delete"
                          onClick={() => deleteReminder(rem.id)}
                        >
                          <Icon d={P.trash} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Calendar View & History breakout */}
        <div className="flex flex-col gap-6">
          
          {/* Monthly Grid Calendar */}
          <div className="glass p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-zinc-200">{monthName} {year}</h3>
              <span className="text-[10px] text-zinc-400 font-semibold font-mono">CALENDAR</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold text-zinc-500">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysArray.map((day, idx) => {
                const dayRems = getRemindersForDay(day);
                const hasRem = dayRems.length > 0;
                const isToday = day === today.getDate() && month === today.getMonth();
                
                return (
                  <div 
                    key={idx} 
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative ${
                      !day ? "pointer-events-none opacity-0" :
                      isToday ? "bg-purple-600 text-white font-bold" :
                      hasRem ? "bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold" :
                      "bg-zinc-900/40 hover:bg-zinc-800/60"
                    }`}
                  >
                    <span>{day}</span>
                    {hasRem && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400 animate-ping"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Edit Form Modal (simple absolute overlay for sandbox validation) */}
      {editingId && (
        <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-6 rounded-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-sm text-zinc-100 mb-4">Edit Follow-Up Reminder</h3>
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="field">
                <label>Reminder Statement</label>
                <input 
                  className="w-full"
                  value={editForm.text} 
                  onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} 
                  required
                />
              </div>
              <div className="field">
                <label>Schedule Duration (days)</label>
                <input 
                  type="number"
                  className="w-full"
                  value={editForm.days} 
                  onChange={(e) => setEditForm({ ...editForm, days: e.target.value })} 
                  required
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" className="btn btn-glass btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
