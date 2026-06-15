'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchMatchDetails } from '@/lib/api';
import { ArrowLeft, Clock, MapPin, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MatchDetailsPage() {
  const { id, locale } = useParams();
  const router = useRouter();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events'); // events, lineups, stats

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const loadData = () => {
      fetchMatchDetails(id as string, locale as string)
        .then(data => {
          setDetails(data);
          setLoading(false);
          
          // Check if match is live (state === 'in')
          const matchState = data?.header?.competitions?.[0]?.status?.type?.state;
          if (matchState === 'in') {
            if (!intervalId) {
              intervalId = setInterval(loadData, 60000); // 60 seconds
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
  }, [id, locale]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!details || !details.header) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <Info className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{locale === 'vi' ? 'Không tìm thấy trận đấu' : 'Match not found'}</h2>
        <p className="text-gray-400 mb-6">{locale === 'vi' ? 'Trận đấu này không tồn tại hoặc đã bị xóa.' : 'This match does not exist or has been removed.'}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold transition">
          {locale === 'vi' ? 'Quay lại' : 'Go back'}
        </button>
      </div>
    );
  }

  const competition = details.header.competitions?.[0];
  const competitors = competition?.competitors || [];
  const homeTeam = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
  const awayTeam = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];
  
  const matchState = competition?.status?.type?.state;
  let status = competition?.status?.type?.shortDetail || '';
  if (matchState === 'pre') {
    status = locale === 'vi' ? 'Sắp diễn ra' : 'Upcoming';
  } else if (matchState === 'post') {
    status = locale === 'vi' ? 'Kết thúc' : 'Full Time';
  }

  const venue = details.gameInfo?.venue?.fullName || 'Unknown Stadium';
  const matchTime = new Date(details.header.competitions?.[0]?.date).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const compName = details.header?.season?.name || details.header?.competitions?.[0]?.name || 'Unknown Competition';
  const rawRound = details.header?.competitions?.[0]?.notes?.[0]?.headline || details.header?.season?.slug || '';
  const compRound = rawRound.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  const displayLeague = compRound ? `${compName} - ${compRound}` : compName;

  const getEmptyMessage = (type: string) => {
    const isUpcoming = details.header?.competitions?.[0]?.status?.type?.state === 'pre';
    if (isUpcoming) return locale === 'vi' ? 'Trận đấu chưa diễn ra.' : 'Match has not started yet.';
    return locale === 'vi' ? `Chưa có thông tin ${type}.` : `${type} not available yet.`;
  };

  const renderEvents = () => {
    if (!details.keyEvents || details.keyEvents.length === 0) {
      return <div className="text-center text-gray-500 py-10">{getEmptyMessage('diễn biến')}</div>;
    }

    return (
      <div className="relative space-y-6">
        {/* The central vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent z-0"></div>
        {details.keyEvents.map((event: any, i: number) => {
          const isHome = event.team?.id === homeTeam.team.id;
          
          // Original or translated type text
          const typeTextLower = event.type?.text?.toLowerCase() || '';
          
          // Since it might be translated to Vietnamese, we use scoringPlay and type IDs when possible
          const isGoal = event.scoringPlay || typeTextLower.includes('goal') || typeTextLower.includes('bàn thắng') || typeTextLower.includes('phản lưới') || typeTextLower.includes('phạt đền');
          const isRedCard = event.type?.id === '93' || event.type?.id === '95' || typeTextLower.includes('red card') || typeTextLower.includes('thẻ đỏ');
          const isYellowCard = event.type?.id === '94' || typeTextLower.includes('yellow card') || typeTextLower.includes('thẻ vàng');
          const isSub = event.type?.id === '76' || typeTextLower.includes('substitution') || typeTextLower.includes('thay người');

          // Determine Card Colors and explicit labels (to fix bad AI translations like 'Mục tiêu')
          let cardBg = 'bg-white/[0.02] border-white/5';
          let textColor = 'text-gray-400';
          let iconContent = <span className="w-2 h-2 bg-gray-500 rounded-full"></span>;
          let displayTypeLabel = event.type?.text;
          
          if (isGoal) {
            cardBg = 'bg-emerald-500/10 border-emerald-500/30';
            textColor = 'text-emerald-400';
            iconContent = <span className="text-emerald-400 text-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">⚽</span>;
            displayTypeLabel = 'BÀN THẮNG';
          } else if (isRedCard) {
            cardBg = 'bg-red-500/10 border-red-500/30';
            textColor = 'text-red-400';
            iconContent = <span className="w-3 h-4 bg-red-500 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.6)] border border-white/20"></span>;
            displayTypeLabel = 'THẺ ĐỎ';
          } else if (isYellowCard) {
            cardBg = 'bg-yellow-500/10 border-yellow-500/30';
            textColor = 'text-yellow-400';
            iconContent = <span className="w-3 h-4 bg-yellow-500 rounded-sm shadow-[0_0_8px_rgba(234,179,8,0.6)] border border-white/20"></span>;
            displayTypeLabel = 'THẺ VÀNG';
          } else if (isSub) {
            cardBg = 'bg-blue-500/10 border-blue-500/30';
            textColor = 'text-blue-400';
            iconContent = <span className="text-blue-400 text-lg">🔃</span>;
            displayTypeLabel = 'THAY NGƯỜI';
          }

          const participantName = event.participants?.[0]?.athlete?.displayName;
          const fullText = event.text || participantName || '';

          // Function to safely highlight the participant's name and score strings in the text
          const renderHighlightedText = (text: string) => {
            if (!text) return null;
            
            let elements: React.ReactNode[] = [];
            
            // Fix bad AI translations in the text
            let remainingText = text.replace(/Mục tiêu!/gi, 'Bàn thắng! ').replace(/Goal!/gi, 'Bàn thắng! ');

            // Fix missing space/dot before common new sentences (like "Được hỗ trợ") due to translation bugs
            remainingText = remainingText.replace(/(\p{Ll})(Được hỗ trợ|Thực hiện|Phạm lỗi|Trúng|Sút|Bởi)/gu, '$1. $2');
            
            // Fix missing space after dot and comma
            remainingText = remainingText.replace(/\.([^\s.])/g, '. $1');
            remainingText = remainingText.replace(/,([^\s,])/g, ', $1');

            // 1. Extract prefix like "Bàn thắng!" to its own line
            const prefixRegex = /^(Bàn thắng!|Goal!|Phạt đền!|Phản lưới nhà!)\s*/i;
            const prefixMatch = remainingText.match(prefixRegex);
            if (prefixMatch) {
              elements.push(<span key="prefix" className="block text-emerald-400 font-bold mb-1 text-sm uppercase tracking-wide">{prefixMatch[1]}</span>);
              remainingText = remainingText.substring(prefixMatch[0].length).trim();
            }

            // 2. Try to match ESPN's score pattern at the beginning: "TeamA 1, TeamB 2."
            // Regex explanation: Start of string, captures TeamA, space+digits, comma, space, TeamB, space+digits, followed by dot or space.
            const scoreRegex = /^(.+?)\s+(\d+),\s+(.+?)\s+(\d+)(?:\.|\s)/;
            const scoreMatch = remainingText.match(scoreRegex);
            
            if (scoreMatch) {
              const fullMatch = scoreMatch[0]; // e.g. "Germany 7, Curaçao 1."
              const team1 = scoreMatch[1].trim();
              const score1 = scoreMatch[2];
              const team2 = scoreMatch[3].trim();
              const score2 = scoreMatch[4];

              elements.push(
                <div key="score" className="flex items-center justify-center gap-3 bg-black/40 border border-white/10 px-4 py-2 rounded-xl my-2 w-fit shadow-inner mx-auto md:mx-0">
                  <span className="font-bold text-white text-sm">{team1}</span>
                  <span className="font-black text-emerald-400 text-xl bg-white/10 px-3 py-0.5 rounded tracking-widest shadow-sm">{score1} - {score2}</span>
                  <span className="font-bold text-white text-sm">{team2}</span>
                </div>
              );
              
              // Remove the matched score part from the remaining text
              remainingText = remainingText.substring(fullMatch.length).trim();
            }

            // 2. Highlight the participant name in the remaining text
            if (participantName && remainingText.includes(participantName)) {
              const splitArr = remainingText.split(participantName);
              elements.push(
                <span key="text" className="block mt-1">
                  {splitArr.map((part, idx) => (
                    <span key={idx}>
                      {part}
                      {idx < splitArr.length - 1 && <span className="text-white font-black text-base underline decoration-emerald-500/50 underline-offset-2">{participantName}</span>}
                    </span>
                  ))}
                </span>
              );
            } else {
              elements.push(<span key="text" className="block mt-1">{remainingText}</span>);
            }

            return <>{elements}</>;
          };

          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}
            >
              {/* Event Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/20 shadow-lg shrink-0 z-10 mx-auto absolute left-1/2 -translate-x-1/2 ${isGoal ? 'bg-emerald-950' : 'bg-[#0a0f16]'}`}>
                {iconContent}
              </div>

              {/* Event Content */}
              <div className={`w-[calc(50%-2.5rem)] p-4 rounded-xl border ${cardBg} ${isHome ? 'ml-auto text-left' : 'mr-auto text-right md:text-left'} md:text-left shadow-lg backdrop-blur-sm transition hover:scale-[1.02]`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`font-black text-lg ${textColor}`}>{event.clock?.displayValue}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isGoal ? 'bg-emerald-500/20' : 'bg-white/5'} ${textColor}`}>
                    {displayTypeLabel}
                  </span>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed flex flex-col">
                  {renderHighlightedText(fullText)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderLineups = () => {
    if (!details.rosters || details.rosters.length === 0) {
      return <div className="text-center text-gray-500 py-10">{getEmptyMessage('đội hình')}</div>;
    }

    const homeData = details.rosters.find((r: any) => r.team.id === homeTeam.team.id);
    const awayData = details.rosters.find((r: any) => r.team.id === awayTeam.team.id);

    const homeRoster = homeData?.roster || [];
    const awayRoster = awayData?.roster || [];
    const homeFormation = homeData?.formation;
    const awayFormation = awayData?.formation;

    const parseFormationRows = (roster: any[], formationStr?: string) => {
      const starters = roster.filter((r: any) => r.starter);
      if (starters.length === 0) return []; // Guard against empty starters

      if (!formationStr || starters.length < 11) {
        // Fallback: Group by position or just return 1 row of GK and 1 row of others
        return [[starters[0]], starters.slice(1)];
      }
      const rowsCount = formationStr.split('-').map(Number);
      const gk = starters[0];
      const outfield = starters.slice(1);
      const rows = [[gk]];
      let currentIdx = 0;
      for (const count of rowsCount) {
        rows.push(outfield.slice(currentIdx, currentIdx + count));
        currentIdx += count;
      }
      return rows;
    };

    const renderPlayerOnPitch = (p: any, i: number) => {
      if (!p) return null; // Guard against undefined player

      // Find if player has a yellow/red card or sub out event in keyEvents
      let hasYellow = false;
      let hasRed = false;
      let isSubbedOut = false;
      if (details.keyEvents) {
        details.keyEvents.forEach((e: any) => {
          if (e.participants?.some((part: any) => part.athlete?.id === p.athlete?.id)) {
            const text = e.type?.text?.toLowerCase() || '';
            if (text.includes('yellow')) hasYellow = true;
            if (text.includes('red')) hasRed = true;
            if (text.includes('substitution') && e.text?.toLowerCase().includes(p.athlete?.displayName?.toLowerCase())) {
              // Usually the text says "Substitution, Team. Player X replaces Player Y"
              // A more robust check might be needed, but we'll use a simple approach here.
            }
          }
        });
      }

      // Calculate simulated rating from stats if match is finished
      let rating = null;
      let isMotm = false;
      const isFinished = details.header?.competitions?.[0]?.status?.type?.state === 'post';
      if (isFinished && p.stats) {
        const statsMap: any = {};
        p.stats.forEach((s: any) => { statsMap[s.abbreviation] = s.value || 0; });
        
        let r = 6.0;
        r += (statsMap['G'] || 0) * 1.5;
        r += (statsMap['A'] || 0) * 1.0;
        r += (statsMap['SV'] || 0) * 0.5; // Goalkeeper saves
        r -= (statsMap['YC'] || 0) * 0.5;
        r -= (statsMap['RC'] || 0) * 1.5;
        r -= (statsMap['OG'] || 0) * 1.0; // Own goals
        
        // Add some random variance based on player ID to simulate passing/tackling stats we don't have
        const idSeed = parseInt(p.athlete?.id || '0') % 10;
        r += (idSeed / 10) * 0.8; 

        if (r > 10.0) r = 10.0;
        if (r < 3.0) r = 3.0;
        rating = r.toFixed(1);
        if (r >= 8.5) isMotm = true;
      }

      // We extract first initial and last name for compact display
      const names = p.athlete?.displayName?.split(' ') || [];
      const shortName = names.length > 1 ? `${names[0][0]}. ${names[names.length - 1]}` : (p.athlete?.displayName || 'Unknown');

      return (
        <div key={i} className="flex flex-col items-center justify-center relative">
          {/* Card Badges */}
          <div className="absolute -top-1 -right-1 flex gap-0.5 z-10">
            {hasRed && <div className="w-2.5 h-3.5 bg-red-500 rounded-sm shadow border border-white/20"></div>}
            {hasYellow && !hasRed && <div className="w-2.5 h-3.5 bg-yellow-500 rounded-sm shadow border border-white/20"></div>}
          </div>

          {/* Player Rating Badge */}
          {rating && (
            <div className={`absolute -bottom-1 -left-2 z-20 px-1.5 py-0.5 rounded shadow-lg border border-white/20 text-[9px] font-black tracking-tighter ${
              isMotm ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white' : 
              parseFloat(rating) >= 7.0 ? 'bg-emerald-500 text-white' : 
              parseFloat(rating) >= 6.0 ? 'bg-gray-600 text-white' : 'bg-red-500 text-white'
            }`}>
              {rating}
            </div>
          )}
          
          <div className={`w-10 h-10 md:w-12 md:h-12 bg-gray-800 border-2 ${isMotm ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'border-white/20'} rounded-full flex items-center justify-center shadow-lg mb-1 overflow-hidden relative`}>
            {p.athlete?.headshot?.href ? (
              <img src={p.athlete.headshot.href} alt={shortName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{p.jersey}</span>
            )}
          </div>
          <span className="text-[10px] md:text-xs font-bold text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap">
            {shortName}
          </span>
        </div>
      );
    };

    const awayRows = parseFormationRows(awayRoster, awayFormation);
    const homeRows = parseFormationRows(homeRoster, homeFormation);

    return (
      <div className="space-y-8">
        {/* Graphical Pitch */}
        <div className="relative w-full max-w-3xl mx-auto bg-[#4a7c59] rounded-xl overflow-hidden border-4 border-white/10 shadow-2xl aspect-[3/4] md:aspect-[2/3] flex flex-col">
          {/* Pitch Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Center line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2"></div>
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-24 h-24 md:w-32 md:h-32 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Away Penalty Area (Top) */}
            <div className="absolute top-0 left-1/2 w-48 h-24 md:w-64 md:h-32 border-2 border-t-0 border-white/30 -translate-x-1/2"></div>
            <div className="absolute top-0 left-1/2 w-24 h-12 md:w-32 md:h-16 border-2 border-t-0 border-white/30 -translate-x-1/2"></div>
            <div className="absolute top-[80px] md:top-[110px] left-1/2 w-16 h-8 border-2 border-t-0 border-white/30 rounded-b-full -translate-x-1/2"></div>
            
            {/* Home Penalty Area (Bottom) */}
            <div className="absolute bottom-0 left-1/2 w-48 h-24 md:w-64 md:h-32 border-2 border-b-0 border-white/30 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-24 h-12 md:w-32 md:h-16 border-2 border-b-0 border-white/30 -translate-x-1/2"></div>
            <div className="absolute bottom-[80px] md:bottom-[110px] left-1/2 w-16 h-8 border-2 border-b-0 border-white/30 rounded-t-full -translate-x-1/2"></div>
          </div>

          {/* Away Team (Top Half - Attacks Down) */}
          <div className="flex-1 flex flex-col justify-between py-4 md:py-8 z-10 relative">
            <div className="absolute top-2 left-2 text-white/50 font-bold text-xs">{awayTeam.team.displayName} {awayFormation && `(${awayFormation})`}</div>
            {awayRows.map((row, i) => (
              <div key={i} className="flex justify-center items-center w-full">
                <div className="flex justify-evenly w-full px-4">
                  {row.map((p: any, j: number) => renderPlayerOnPitch(p, j))}
                </div>
              </div>
            ))}
          </div>

          {/* Home Team (Bottom Half - Attacks Up) */}
          <div className="flex-1 flex flex-col-reverse justify-between py-4 md:py-8 z-10 relative bg-black/5">
            <div className="absolute bottom-2 left-2 text-white/50 font-bold text-xs">{homeTeam.team.displayName} {homeFormation && `(${homeFormation})`}</div>
            {homeRows.map((row, i) => (
              <div key={i} className="flex justify-center items-center w-full">
                <div className="flex justify-evenly w-full px-4">
                  {row.map((p: any, j: number) => renderPlayerOnPitch(p, j))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bench / Substitutes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <img src={homeTeam.team.logos?.[0]?.href || homeTeam.team.logo} alt={homeTeam.team.displayName} className="w-6 h-6 object-contain" />
              <h3 className="font-bold text-white">Dự bị {homeTeam.team.displayName}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2">
              {homeRoster.filter((r: any) => !r.starter).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                    {p.athlete?.headshot?.href ? (
                      <img src={p.athlete.headshot.href} alt={p.athlete?.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">{p.jersey}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-gray-300 truncate font-medium">{p.athlete?.displayName}</span>
                    <span className="text-xs text-gray-500">{p.position?.abbreviation || 'Dự bị'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <img src={awayTeam.team.logos?.[0]?.href || awayTeam.team.logo} alt={awayTeam.team.displayName} className="w-6 h-6 object-contain" />
              <h3 className="font-bold text-white">Dự bị {awayTeam.team.displayName}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2">
              {awayRoster.filter((r: any) => !r.starter).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                    {p.athlete?.headshot?.href ? (
                      <img src={p.athlete.headshot.href} alt={p.athlete?.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">{p.jersey}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-gray-300 truncate font-medium">{p.athlete?.displayName}</span>
                    <span className="text-xs text-gray-500">{p.position?.abbreviation || 'Dự bị'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!details.boxscore || !details.boxscore.teams) {
      return <div className="text-center text-gray-500 py-10">{getEmptyMessage('thống kê')}</div>;
    }

    const homeStats = details.boxscore.teams.find((t: any) => t.team.id === homeTeam.team.id)?.statistics || [];
    const awayStats = details.boxscore.teams.find((t: any) => t.team.id === awayTeam.team.id)?.statistics || [];

    const statsMap: any = {};
    homeStats.forEach((s: any) => { statsMap[s.name] = { label: s.label || s.name, home: s.displayValue }; });
    awayStats.forEach((s: any) => { if(statsMap[s.name]) statsMap[s.name].away = s.displayValue; });

    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
        {Object.values(statsMap).map((stat: any, i: number) => {
          const homeVal = parseFloat(stat.home) || 0;
          const awayVal = parseFloat(stat.away) || 0;
          const total = homeVal + awayVal || 1;
          const homePct = (homeVal / total) * 100;
          const awayPct = (awayVal / total) * 100;

          return (
            <div key={i}>
              <div className="flex justify-between items-center text-sm font-bold text-white mb-2">
                <span>{stat.home}</span>
                <span className="text-gray-400 capitalize">{stat.label}</span>
                <span>{stat.away}</span>
              </div>
              <div className="flex h-2 bg-white/5 rounded-full overflow-hidden gap-1">
                <div className="bg-emerald-500 h-full rounded-r-full" style={{ width: `${homePct}%` }} />
                <div className="bg-blue-500 h-full rounded-l-full" style={{ width: `${awayPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative pt-8 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-[#03060a]" />
        
        <div className="relative max-w-5xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-5 h-5" /> Trở về
          </button>

          <div className="text-center mb-6">
            <h1 className="text-white text-base md:text-lg font-black tracking-wide uppercase mb-3 opacity-90 text-center drop-shadow-md">
              {displayLeague}
            </h1>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
              {status}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-12">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-full flex items-center justify-center p-4 mb-4 border border-white/10 shadow-2xl overflow-hidden">
                <img src={homeTeam.team.logos?.[0]?.href || homeTeam.team.logo} alt={homeTeam.team.displayName} className="w-full h-full object-contain drop-shadow-xl" />
              </div>
              <h2 className="text-xl md:text-3xl font-black text-white text-center">{homeTeam.team.displayName}</h2>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2">
                {homeTeam.score || '0'} - {awayTeam.score || '0'}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-full flex items-center justify-center p-4 mb-4 border border-white/10 shadow-2xl overflow-hidden">
                <img src={awayTeam.team.logos?.[0]?.href || awayTeam.team.logo} alt={awayTeam.team.displayName} className="w-full h-full object-contain drop-shadow-xl" />
              </div>
              <h2 className="text-xl md:text-3xl font-black text-white text-center">{awayTeam.team.displayName}</h2>
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-6 text-sm text-gray-400 font-medium">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {matchTime}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {venue}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-px mb-8 overflow-x-auto scrollbar-none">
          {[{ id: 'events', label: 'Diễn biến' }, { id: 'lineups', label: 'Đội hình' }, { id: 'stats', label: 'Thống kê' }].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'lineups' && renderLineups()}
          {activeTab === 'stats' && renderStats()}
        </motion.div>
      </div>
    </div>
  );
}
