'use client';
import { useEffect, useState, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAllMatches } from '@/lib/api';
import { Match } from '@football-fan/shared-types';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sync calendar with current date when opened
  useEffect(() => {
    if (showDatePicker) {
      setCalendarDate(new Date(currentDate));
    }
  }, [showDatePicker, currentDate]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    setLoading(true);

    const loadData = () => {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${year}${month}${day}`;
      
      fetchAllMatches(dateString)
        .then(data => {
          setMatches(data);
          setLoading(false);
          
          const hasLiveMatch = data.some((m: Match) => m.status === 'LIVE' || m.status === 'HT');
          const isToday = new Date().toISOString().slice(0, 10) === currentDate.toISOString().slice(0, 10);
          
          if (hasLiveMatch || isToday) {
            if (!intervalId) {
              intervalId = setInterval(loadData, 60000);
            }
          } else {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        })
        .catch(console.error);
    };

    loadData();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const getDayLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((compareDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    if (diffDays === -1) return 'Hôm qua';
    
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  const formatDisplayDate = (date: Date) => {
    return `${date.getDate()} THG ${date.getMonth() + 1}`;
  };

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Trực tiếp') return match.status === 'LIVE' || match.status === 'HT';
    if (activeTab === 'Đã xong') return match.status === 'FT' || match.status === 'FINISHED';
    if (activeTab === 'Sắp tới') return match.status === 'SCHEDULED';
    return true;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-emerald-400" />
            Lịch Thi Đấu & Kết Quả
          </h1>
          <p className="text-gray-400 text-sm">Cập nhật tỉ số trực tiếp và lịch thi đấu các giải</p>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-1 relative">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div 
            className="px-4 py-1 flex flex-col items-center min-w-[100px] cursor-pointer group"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{getDayLabel(currentDate)}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">{formatDisplayDate(currentDate)}</span>
          </div>

          <button onClick={() => changeDate(1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Custom Date Picker Popup */}
          {showDatePicker && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
              
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-4 bg-[#0a0f16]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 w-72"
              >
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)); }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white font-bold text-sm">
                    {calendarDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)); }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-gray-500">{day}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`blank-${i}`} className="w-8 h-8" />
                  ))}
                  {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = day === currentDate.getDate() && calendarDate.getMonth() === currentDate.getMonth() && calendarDate.getFullYear() === currentDate.getFullYear();
                    const isToday = day === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth() && calendarDate.getFullYear() === new Date().getFullYear();
                    
                    return (
                      <button
                        key={day}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day));
                          setShowDatePicker(false);
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isSelected 
                            ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                            : isToday 
                              ? 'bg-white/10 text-emerald-400' 
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentDate(new Date());
                      setShowDatePicker(false);
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Trở về hôm nay
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-px overflow-x-auto scrollbar-none">
        {['Tất cả', 'Trực tiếp', 'Đã xong', 'Sắp tới'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 border-b-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 py-10">Đang tải trận đấu...</div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Không có trận đấu nào.</div>
        ) : filteredMatches.map((match, i) => {
          const kickDate = new Date(match.kickoff);
          const matchTime = kickDate.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
          
          let cardClass = "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] opacity-70 hover:opacity-100"; // FINISHED default
          if (match.status === 'LIVE') {
            cardClass = "bg-red-500/5 border-red-500/20 hover:bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.05)]";
          } else if (match.status === 'HT') {
            cardClass = "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10";
          } else if (match.status === 'SCHEDULED') {
            cardClass = "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10";
          }

          return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={match.id} 
                onClick={() => window.location.href = `/matches/${match.id}`}
                className={`group flex flex-col md:flex-row items-center gap-4 border rounded-2xl p-4 transition-all duration-300 cursor-pointer ${cardClass}`}
              >
                {/* Status / Time */}
                <div className="w-full md:w-36 flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4">
                  {match.status === 'LIVE' ? (
                    <>
                      <span className="flex items-center gap-1.5 text-xs font-black text-red-500 uppercase tracking-widest animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Đang diễn ra
                      </span>
                      {match.round && <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 text-center">{match.round}</span>}
                      <span className="text-sm font-bold text-red-400 mt-1">{match.minute}'</span>
                    </>
                  ) : match.status === 'HT' ? (
                    <>
                      <span className="flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-widest">
                        Nghỉ giữa hiệp
                      </span>
                      {match.round && <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 text-center">{match.round}</span>}
                    </>
                  ) : match.status === 'SCHEDULED' ? (
                    <>
                      <span className="text-xs font-black text-blue-400 text-center uppercase tracking-widest">Sắp diễn ra</span>
                      {match.round && <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 text-center">{match.round}</span>}
                      <span className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-500" /> {matchTime}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-black text-gray-500 text-center uppercase tracking-widest">Kết thúc</span>
                      {match.round && <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 text-center">{match.round}</span>}
                      <span className="text-sm font-bold text-gray-400 mt-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-600" /> {matchTime}</span>
                    </>
                  )}
                </div>

                {/* Teams */}
                <div className="flex-1 w-full flex items-center justify-between px-2 md:px-8">
                  {/* Home */}
                  <div className="flex flex-1 items-center gap-3 justify-end">
                    <span className="text-sm md:text-base font-bold text-white text-right">{match.homeTeam.name}</span>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {match.homeTeam.logo?.startsWith('http') ? (
                        <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-8 h-8 object-contain" />
                      ) : (
                        match.homeTeam.logo
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="w-20 shrink-0 flex items-center justify-center px-4">
                    {match.status === 'SCHEDULED' ? (
                      <span className="text-gray-600 font-black text-xl">vs</span>
                    ) : (
                      <div className="bg-[#080d14] border border-white/10 rounded-lg px-4 py-1.5 flex items-center gap-2">
                        <span className="text-xl font-black text-white">{match.homeScore}</span>
                        <span className="text-gray-600">-</span>
                        <span className="text-xl font-black text-white">{match.awayScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex flex-1 items-center gap-3 justify-start">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {match.awayTeam.logo?.startsWith('http') ? (
                        <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-8 h-8 object-contain" />
                      ) : (
                        match.awayTeam.logo
                      )}
                    </div>
                    <span className="text-sm md:text-base font-bold text-white text-left">{match.awayTeam.name}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex justify-center mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/10 md:pl-4">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-emerald-500 hover:text-[#03060a] text-gray-300 text-sm font-bold transition-colors whitespace-nowrap">
                    Chi tiết
                  </button>
                </div>
              </motion.div>
          );
        })}
      </div>
    </div>
  );
}
