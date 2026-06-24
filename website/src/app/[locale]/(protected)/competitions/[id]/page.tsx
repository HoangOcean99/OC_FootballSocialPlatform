'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trophy, Users, BarChart3, CalendarDays, Clock } from 'lucide-react';
import { fetchCompetitionDetails, fetchCompetitionStandings, fetchCompetitionMatches } from '@/lib/api';
import { Competition, StandingEntry, Match } from '@football-fan/shared-types';
import MatchCard from '@/components/MatchCard'; // Assuming we have a MatchCard component, or we can just render matches similar to matches/page.tsx
import { useTranslations, useLocale } from 'next-intl';

export default function CompetitionDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const t = useTranslations('Competitions');
  const locale = useLocale();
  
  const TRANSLATED_ROUNDS: Record<string, string> = {
    'round-of-16': t('round_16'),
    'quarterfinals': t('round_quarter'),
    'semifinals': t('round_semi'),
    '3rd-place-match': t('round_3rd'),
    'final': t('round_final'),
    'knockout-round-play-offs': t('round_playoff'),
    'round-of-32': t('round_32')
  };
  
  const [comp, setComp] = useState<Competition | null>(null);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'standings' | 'matches' | 'knockout'>('standings');
  const [selectedRound, setSelectedRound] = useState<string>('');
  const CURRENT_YEAR = new Date().getFullYear();
  const AVAILABLE_SEASONS = Array.from({length: 27}, (_, i) => (CURRENT_YEAR - i).toString());
  
  const [selectedSeason, setSelectedSeason] = useState<string>(AVAILABLE_SEASONS[0]);
  const [standingsViewMode, setStandingsViewMode] = useState<'full' | 'compact'>('full');

  const [matchFilterType, setMatchFilterType] = useState<'all' | 'round' | 'month' | 'day' | 'week'>('all');
  const [matchFilterValue, setMatchFilterValue] = useState<string>('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const { availableRounds, availableMonths, availableDays, availableWeeks } = useMemo(() => {
    const rounds = Array.from(new Set(matches.map(m => TRANSLATED_ROUNDS[m.round || ''] || m.round || ''))).filter(Boolean) as string[];
    const months = Array.from(new Set(matches.map(m => {
      const d = new Date(m.kickoff);
      return `${t('month')} ${d.getMonth() + 1}/${d.getFullYear()}`;
    }))) as string[];
    const days = Array.from(new Set(matches.map(m => new Date(m.kickoff).toLocaleDateString(locale)))) as string[];
    const weeks = Array.from(new Set(matches.map(m => {
      const d = new Date(m.kickoff);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(d.setDate(diff));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString(locale)} - ${endOfWeek.toLocaleDateString(locale)}`;
    }))) as string[];
    return { availableRounds: rounds, availableMonths: months, availableDays: days, availableWeeks: weeks };
  }, [matches]);

  const currentFilterOptions = useMemo(() => {
    if (matchFilterType === 'round') return availableRounds;
    if (matchFilterType === 'month') return availableMonths;
    if (matchFilterType === 'week') return availableWeeks;
    if (matchFilterType === 'day') return availableDays;
    return [];
  }, [matchFilterType, availableRounds, availableMonths, availableWeeks, availableDays]);

  const changeFilterValue = (step: number) => {
    if (matchFilterType === 'day') {
      const parts = matchFilterValue.split('/');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        d.setDate(d.getDate() + step);
        setMatchFilterValue(d.toLocaleDateString(locale));
        setCalendarDate(new Date(d));
      }
      return;
    }
    if (currentFilterOptions.length === 0) return;
    const currentIndex = currentFilterOptions.indexOf(matchFilterValue);
    let newIndex = currentIndex + step;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= currentFilterOptions.length) newIndex = currentFilterOptions.length - 1;
    setMatchFilterValue(currentFilterOptions[newIndex]);
  };

  useEffect(() => {
    if (matchFilterType === 'round') setMatchFilterValue(availableRounds[0] || '');
    else if (matchFilterType === 'month') setMatchFilterValue(availableMonths[0] || '');
    else if (matchFilterType === 'week') setMatchFilterValue(availableWeeks[0] || '');
    else if (matchFilterType === 'day') {
      const todayStr = new Date().toLocaleDateString(locale);
      setMatchFilterValue(availableDays.includes(todayStr) ? todayStr : availableDays[0] || todayStr);
      setCalendarDate(new Date());
    }
    else setMatchFilterValue('');
  }, [matchFilterType, matches, availableRounds, availableMonths, availableWeeks, availableDays]);

  const filteredMatches = useMemo(() => {
    if (matchFilterType === 'all') return matches;
    return matches.filter(m => {
      if (matchFilterType === 'round') return (TRANSLATED_ROUNDS[m.round || ''] || m.round || '') === matchFilterValue;
      if (matchFilterType === 'month') {
        const d = new Date(m.kickoff);
        return `${t('month')} ${d.getMonth() + 1}/${d.getFullYear()}` === matchFilterValue;
      }
      if (matchFilterType === 'day') {
        return new Date(m.kickoff).toLocaleDateString(locale) === matchFilterValue;
      }
      if (matchFilterType === 'week') {
        const d = new Date(m.kickoff);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString(locale)} - ${endOfWeek.toLocaleDateString(locale)}` === matchFilterValue;
      }
      return true;
    });
  }, [matches, matchFilterType, matchFilterValue]);

  const groupedMatchesArray = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    filteredMatches.forEach(m => {
      const d = new Date(m.kickoff);
      // Create a sortable key like YYYY-MM-DD using local time
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const displayKey = d.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
      const compositeKey = `${sortKey}|${displayKey}`;
      if (!groups[compositeKey]) groups[compositeKey] = [];
      groups[compositeKey].push(m);
    });
    
    return Object.keys(groups).sort().map(key => ({
      displayDate: key.split('|')[1],
      matches: groups[key]
    }));
  }, [filteredMatches]);

  const isTournament = comp?.name === 'Euro' || comp?.name === 'Copa America' || comp?.name === 'Champions League' || comp?.name === 'Cúp C1 Châu Âu' || comp?.name === 'World Cup';
  
  const formattedKnockoutMatches = matches
    .filter(m => m.round && !m.round.toLowerCase().includes('group') && !m.round.toLowerCase().includes('bảng'))
    .map(m => ({
      ...m,
      displayRound: TRANSLATED_ROUNDS[m.round || ''] || m.round || ''
    }));

  const knockoutRounds = Array.from(new Set(formattedKnockoutMatches.map(m => m.displayRound)));

  const getTiesForRound = (roundName: string) => {
    const roundMatches = formattedKnockoutMatches.filter(m => m.displayRound === roundName);
    const ties: any[] = [];
    
    roundMatches.forEach(match => {
      const existingTie = ties.find(t => 
        (t.team1.id === match.homeTeam.id && t.team2.id === match.awayTeam.id) ||
        (t.team1.id === match.awayTeam.id && t.team2.id === match.homeTeam.id)
      );

      const isLeg2 = match.note?.toLowerCase().includes('2nd leg') || match.note?.toLowerCase().includes('aggregate');
      
      if (existingTie) {
        if (isLeg2) existingTie.leg2 = match;
        else existingTie.leg1 = match;
        // ESPN puts aggregate score in Leg 2's note usually
        if (match.note) existingTie.note = match.note;
      } else {
        ties.push({
          id: match.id + '_tie',
          team1: match.homeTeam,
          team2: match.awayTeam,
          leg1: !isLeg2 ? match : null,
          leg2: isLeg2 ? match : null,
          isSingleLeg: roundName === t('round_final') || roundName === 'Final',
          note: match.note
        });
      }
    });
    
    return ties;
  };

  useEffect(() => {
    fetchCompetitionDetails(id).then(compData => {
      setComp(compData);
      setSelectedSeason(new Date().getFullYear().toString());
    }).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!comp || !selectedSeason) return;
    setLoading(true);
    Promise.all([
      fetchCompetitionStandings(id, selectedSeason),
      fetchCompetitionMatches(id, selectedSeason)
    ])
    .then(([standingsData, matchesData]) => {
      setStandings(standingsData);
      setMatches(matchesData);
      
      const knockouts = matchesData
        .filter((m: Match) => m.round && !m.round.toLowerCase().includes('group') && !m.round.toLowerCase().includes('bảng'))
        .map((m: Match) => ({
          ...m,
          displayRound: TRANSLATED_ROUNDS[m.round || ''] || m.round || ''
        }));
      const rounds = Array.from(new Set(knockouts.map(m => m.displayRound)));
      if (rounds.length > 0) {
        setSelectedRound(rounds[0] as string);
      }
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id, selectedSeason, comp]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!comp) {
    return <div className="text-center text-gray-400 py-10">Không tìm thấy giải đấu.</div>;
  }

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden pt-6 pb-8">
        <div className={`absolute inset-0 bg-gradient-to-br ${comp.color || 'from-emerald-900 to-gray-900'} opacity-30`} />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] to-transparent" />
        
        <div className="relative z-10 px-6 flex flex-col max-w-7xl mx-auto w-full">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all backdrop-blur-md self-start w-auto"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">{t('btn_back')}</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 md:w-32 md:h-32 bg-white/90 p-4 rounded-3xl shadow-2xl backdrop-blur-md flex items-center justify-center text-6xl"
            >
              {comp.logo?.startsWith('http') ? (
                <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" />
              ) : (
                comp.logo
              )}
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{comp.name}</h1>
              <div className="flex items-center gap-4 text-sm font-bold text-emerald-400">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <Trophy className="w-4 h-4" />
                  {comp.country}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-gray-300">
                  <Users className="w-4 h-4" />
                  {comp.followers || '1.2M'} Fan
                </span>
                <select 
                  value={selectedSeason} 
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white text-sm rounded-full focus:ring-emerald-500 focus:border-emerald-500 block px-4 py-1 hover:bg-white/20 transition-colors backdrop-blur-md cursor-pointer outline-none font-bold"
                >
                  {AVAILABLE_SEASONS.map(season => (
                    <option key={season} value={season} className="bg-gray-900 text-white font-bold">{t('year', { year: season })}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          <button 
            onClick={() => setActiveTab('standings')}
            className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'standings' 
                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-white/[0.03] text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {t('tab_standings')}
          </button>
          
          {isTournament && (
            <button 
              onClick={() => setActiveTab('knockout')}
              className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'knockout' 
                  ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/[0.03] text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              {t('tab_knockout')}
            </button>
          )}

          <button 
            onClick={() => setActiveTab('matches')}
            className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'matches' 
                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-white/[0.03] text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            {t('tab_matches')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'standings' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {standings.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-white/[0.02] border border-white/10 rounded-3xl">Không có dữ liệu bảng xếp hạng.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-end gap-2 px-2">
                    <button 
                      onClick={() => setStandingsViewMode('full')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${standingsViewMode === 'full' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'}`}
                    >{t('view_full')}</button>
                    <button 
                      onClick={() => setStandingsViewMode('compact')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${standingsViewMode === 'compact' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'}`}
                    >{t('view_compact')}</button>
                  </div>
                  <div className={standingsViewMode === 'compact' ? 'grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6' : 'space-y-8 bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden'}>
                    {standings.map((group: any, gIndex: number) => (
                      <div key={gIndex} className={standingsViewMode === 'compact' ? 'bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden' : ''}>
                        {standings.length > 1 && (
                          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest px-6 py-4 bg-white/[0.02] border-b border-white/5">
                            {group.name}
                          </h3>
                        )}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                              <tr className="bg-white/[0.03] text-gray-400">
                                <th className="py-4 px-4 w-12 text-center">#</th>
                                <th className="py-4 px-4 font-bold">Câu Lạc Bộ</th>
                                <th className="py-4 px-3 text-center">ST</th>
                                {standingsViewMode === 'full' && (
                                  <>
                                    <th className="py-4 px-3 text-center">T</th>
                                    <th className="py-4 px-3 text-center">H</th>
                                    <th className="py-4 px-3 text-center">B</th>
                                    <th className="py-4 px-3 text-center">BT</th>
                                    <th className="py-4 px-3 text-center">BB</th>
                                    <th className="py-4 px-3 text-center">HS</th>
                                  </>
                                )}
                                <th className="py-4 px-4 text-center font-black text-emerald-400">Đ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {group.entries.map((entry: any) => (
                                <tr key={entry.team.id} className="hover:bg-white/[0.02] transition-colors group relative">
                                  <td className="py-4 px-4 text-center font-bold text-gray-400 group-hover:text-white relative">
                                    {entry.color && (
                                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: entry.color }} />
                                    )}
                                    {entry.rank}
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <img src={entry.team.logo} alt={entry.team.name} className="w-6 h-6 object-contain" />
                                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">{entry.team.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-3 text-center text-gray-400">{entry.played}</td>
                                  {standingsViewMode === 'full' && (
                                    <>
                                      <td className="py-4 px-3 text-center text-gray-400">{entry.won}</td>
                                      <td className="py-4 px-3 text-center text-gray-400">{entry.drawn}</td>
                                      <td className="py-4 px-3 text-center text-gray-400">{entry.lost}</td>
                                      <td className="py-4 px-3 text-center text-gray-400">{entry.goalsFor}</td>
                                      <td className="py-4 px-3 text-center text-gray-400">{entry.goalsAgainst}</td>
                                      <td className="py-4 px-3 text-center text-gray-400">{entry.goalDifference}</td>
                                    </>
                                  )}
                                  <td className="py-4 px-4 text-center font-black text-white">{entry.points}</td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                        {(() => {
                          const notes = group.entries
                            .filter((e: any) => e.color && e.description)
                            .reduce((acc: any[], current: any) => {
                              if (!acc.find(item => item.description === current.description)) {
                                acc.push(current);
                              }
                              return acc;
                            }, []);
                            
                          if (notes.length === 0) return null;
                          
                          return (
                            <div className="px-6 py-4 border-t border-white/5 flex flex-wrap gap-6 bg-white/[0.01]">
                              {notes.map((note: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: note.color }}></span>
                                  <span>{note.description}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </motion.div>
          )}

          {activeTab === 'knockout' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {formattedKnockoutMatches.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-white/[0.02] border border-white/10 rounded-3xl">Chưa có thông tin vòng loại trực tiếp.</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Round Selector */}
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {knockoutRounds.map(round => (
                      <button
                        key={round}
                        onClick={() => setSelectedRound(round)}
                        className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold text-sm transition-all border ${
                          selectedRound === round
                            ? 'bg-white/10 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                            : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {round}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {getTiesForRound(selectedRound || knockoutRounds[0]).map(tie => (
                       <div key={tie.id} className="bg-[#0a0f16] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                          {/* Highlight effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          
                          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/[0.03] px-2 py-1 rounded">{t('matchup')}</span>
                             {tie.note && <span className="text-[10px] text-emerald-400 font-bold max-w-[200px] truncate bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20" title={tie.note}>{tie.note}</span>}
                          </div>
                          <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                            <div className="flex flex-col gap-5">
                              <div className="flex items-center gap-3">
                                {tie.team1.logo ? <img src={tie.team1.logo} alt={tie.team1.name} className="w-8 h-8 object-contain drop-shadow-md" /> : <div className="w-8 h-8 rounded-full bg-white/10" />}
                                <span className="text-sm font-bold text-white truncate max-w-[150px]">{tie.team1.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {tie.team2.logo ? <img src={tie.team2.logo} alt={tie.team2.name} className="w-8 h-8 object-contain drop-shadow-md" /> : <div className="w-8 h-8 rounded-full bg-white/10" />}
                                <span className="text-sm font-bold text-white truncate max-w-[150px]">{tie.team2.name}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 text-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                              {/* Lượt 1 */}
                              {!(tie.isSingleLeg || (!tie.leg2 && !tie.leg1?.note?.toLowerCase().includes('leg'))) && (
                                <div className="flex flex-col items-center border-r border-white/5 pr-4 relative">
                                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-3">{t('leg_1')}</span>
                                  <span className={`text-base font-black ${tie.leg1 && tie.leg1.homeScore > tie.leg1.awayScore ? 'text-gray-300' : 'text-gray-500'}`}>{tie.leg1?.status === 'SCHEDULED' ? '-' : (tie.leg1?.homeTeam.id === tie.team1.id ? tie.leg1?.homeScore : tie.leg1?.awayScore) ?? '-'}</span>
                                  <span className={`text-base font-black mt-4 ${tie.leg1 && tie.leg1.awayScore > tie.leg1.homeScore ? 'text-gray-300' : 'text-gray-500'}`}>{tie.leg1?.status === 'SCHEDULED' ? '-' : (tie.leg1?.homeTeam.id === tie.team2.id ? tie.leg1?.homeScore : tie.leg1?.awayScore) ?? '-'}</span>
                                </div>
                              )}
                              {/* Lượt 2 */}
                              {!(tie.isSingleLeg || (!tie.leg2 && !tie.leg1?.note?.toLowerCase().includes('leg'))) && (
                                <div className="flex flex-col items-center border-r border-white/5 pr-4 relative">
                                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-3">{t('leg_2')}</span>
                                  <span className={`text-base font-black ${tie.leg2 && tie.leg2.homeScore > tie.leg2.awayScore ? 'text-gray-300' : 'text-gray-500'}`}>{tie.leg2?.status === 'SCHEDULED' ? '-' : (tie.leg2?.homeTeam.id === tie.team1.id ? tie.leg2?.homeScore : tie.leg2?.awayScore) ?? '-'}</span>
                                  <span className={`text-base font-black mt-4 ${tie.leg2 && tie.leg2.awayScore > tie.leg2.homeScore ? 'text-gray-300' : 'text-gray-500'}`}>{tie.leg2?.status === 'SCHEDULED' ? '-' : (tie.leg2?.homeTeam.id === tie.team2.id ? tie.leg2?.homeScore : tie.leg2?.awayScore) ?? '-'}</span>
                                </div>
                              )}
                              {/* Tổng hoặc Kết quả 1 trận */}
                              <div className="flex flex-col items-center px-2">
                                <span className="text-[9px] text-emerald-500 uppercase font-black tracking-widest mb-3">{t('result')}</span>
                                {(() => {
                                  // Tính tổng
                                  const leg1T1 = tie.leg1 && tie.leg1.status !== 'SCHEDULED' ? (tie.leg1.homeTeam.id === tie.team1.id ? tie.leg1.homeScore : tie.leg1.awayScore) : 0;
                                  const leg1T2 = tie.leg1 && tie.leg1.status !== 'SCHEDULED' ? (tie.leg1.homeTeam.id === tie.team2.id ? tie.leg1.homeScore : tie.leg1.awayScore) : 0;
                                  const leg2T1 = tie.leg2 && tie.leg2.status !== 'SCHEDULED' ? (tie.leg2.homeTeam.id === tie.team1.id ? tie.leg2.homeScore : tie.leg2.awayScore) : 0;
                                  const leg2T2 = tie.leg2 && tie.leg2.status !== 'SCHEDULED' ? (tie.leg2.homeTeam.id === tie.team2.id ? tie.leg2.homeScore : tie.leg2.awayScore) : 0;
                                  
                                  const total1 = leg1T1 + leg2T1;
                                  const total2 = leg1T2 + leg2T2;
                                  
                                  const isReallySingleLeg = tie.isSingleLeg || (!tie.leg2 && !tie.leg1?.note?.toLowerCase().includes('leg'));
                                  const isTotalScheduled = (!tie.leg1 || tie.leg1.status === 'SCHEDULED') && (!tie.leg2 || tie.leg2.status === 'SCHEDULED') && (!isReallySingleLeg || (tie.leg1?.status === 'SCHEDULED' || !tie.leg1));

                                  return (
                                    <>
                                      <span className={`text-xl font-black ${total1 > total2 && !isTotalScheduled ? 'text-emerald-400' : 'text-white'}`}>{isTotalScheduled ? '-' : total1}</span>
                                      <span className={`text-xl font-black mt-2 ${total2 > total1 && !isTotalScheduled ? 'text-emerald-400' : 'text-white'}`}>{isTotalScheduled ? '-' : total2}</span>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'matches' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <span className="text-sm font-bold text-gray-400">{t('filter_by')}</span>
                <select 
                  className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  value={matchFilterType}
                  onChange={(e) => setMatchFilterType(e.target.value as any)}
                >
                  <option value="all">{t('filter_all')}</option>
                  <option value="round">{t('filter_round')}</option>
                  <option value="month">{t('month')}</option>
                  <option value="week">{t('filter_week')}</option>
                  <option value="day">{t('filter_day')}</option>
                </select>
                
                {matchFilterType !== 'all' && (
                  <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-1 relative flex-1 sm:max-w-fit">
                    <button 
                      onClick={() => changeFilterValue(-1)} 
                      disabled={matchFilterType !== 'day' && currentFilterOptions.indexOf(matchFilterValue) <= 0}
                      className="p-2 hover:bg-white/10 disabled:opacity-30 rounded-lg text-gray-400 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div 
                      className="px-4 py-1 flex flex-col items-center min-w-[160px] cursor-pointer group relative"
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    >
                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[200px]">
                        {matchFilterValue || t('select_placeholder')}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                        {matchFilterType === 'round' ? t('filter_round') : matchFilterType === 'month' ? t('month') : matchFilterType === 'week' ? t('filter_week') : t('filter_day')}
                      </span>

                      {/* Dropdown */}
                      {showFilterDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(false); }}></div>
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 ${matchFilterType === 'day' ? 'w-72 p-4' : 'w-64 p-2 max-h-64'} overflow-y-auto bg-[#0a0f16]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 scrollbar-thin`}
                          >
                            {matchFilterType === 'day' ? (
                              <>
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
                                    const dateStr = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toLocaleDateString('vi-VN');
                                    const isSelected = matchFilterValue === dateStr;
                                    const isToday = day === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth() && calendarDate.getFullYear() === new Date().getFullYear();
                                    
                                    return (
                                      <button
                                        key={day}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMatchFilterValue(dateStr);
                                          setShowFilterDropdown(false);
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
                              </>
                            ) : (
                              currentFilterOptions.map(opt => (
                                <button
                                  key={opt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMatchFilterValue(opt);
                                    setShowFilterDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    opt === matchFilterValue 
                                      ? 'bg-emerald-500/20 text-emerald-400' 
                                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))
                            )}
                          </motion.div>
                        </>
                      )}
                    </div>

                    <button 
                      onClick={() => changeFilterValue(1)} 
                      disabled={matchFilterType !== 'day' && currentFilterOptions.indexOf(matchFilterValue) >= currentFilterOptions.length - 1}
                      className="p-2 hover:bg-white/10 disabled:opacity-30 rounded-lg text-gray-400 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {groupedMatchesArray.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">Không có trận đấu nào.</div>
                ) : (
                  groupedMatchesArray.map((group) => (
                    <div key={group.displayDate} className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                        <CalendarDays className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-lg font-bold text-white capitalize">{group.displayDate}</h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {group.matches.map(match => {
                           const kickDate = new Date(match.kickoff);
                           const timeStr = kickDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                           return (
                             <div key={match.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.05] transition cursor-pointer flex flex-col group" onClick={() => router.push(`/matches/${match.id}`)}>
                               {/* Top bar: Time, Round/Group, Status */}
                               <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                                 <div className="flex items-center gap-2">
                                   <div className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1.5">
                                     <Clock className="w-3 h-3 text-emerald-400" /> {timeStr}
                                   </div>
                                   <span className="text-xs text-gray-400 font-medium truncate max-w-[150px]">{match.round || 'Vòng đấu'}</span>
                                   <span className="text-xs text-gray-400 font-medium truncate max-w-[150px]">{match.round || t('round')}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    {match.status === 'LIVE' || match.status === 'HT' ? (
                                      <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-1 rounded font-bold animate-pulse">{t('status_live')} {match.minute ? `${match.minute}'` : ''}</span>
                                    ) : match.status === 'FINISHED' ? (
                                      <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-1 rounded font-bold">{t('status_finished')}</span>
                                    ) : match.status === 'POSTPONED' ? (
                                      <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded font-bold">{t('status_postponed')}</span>
                                    ) : (
                                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">{t('status_scheduled')}</span>
                                    )}
                                 </div>
                               </div>

                               {/* Teams & Score */}
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {match.homeTeam.logo ? <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-10 h-10 object-contain drop-shadow-md" /> : <div className="w-10 h-10 rounded-full bg-white/10" />}
                                    <span className="font-bold text-sm text-white truncate">{match.homeTeam.name}</span>
                                  </div>
                                  
                                  <div className="px-4 flex flex-col items-center justify-center shrink-0">
                                    <div className={`text-2xl font-black tabular-nums tracking-tighter ${match.status === 'LIVE' ? 'text-red-500' : 'text-white'}`}>
                                      {match.status === 'SCHEDULED' || match.status === 'POSTPONED' ? 'vs' : `${match.homeScore ?? '-'} - ${match.awayScore ?? '-'}`}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                                    <span className="font-bold text-sm text-white truncate text-right">{match.awayTeam.name}</span>
                                    {match.awayTeam.logo ? <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-10 h-10 object-contain drop-shadow-md" /> : <div className="w-10 h-10 rounded-full bg-white/10" />}
                                  </div>
                               </div>
                             </div>
                           );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
