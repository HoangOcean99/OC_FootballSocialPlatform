'use client';

import { useState } from 'react';
import {
  PRED_MATCHES,
  MY_PREDICTIONS,
  LEADERBOARD,
  PredMatch,
  MyPred,
  LeaderboardEntry,
  formatNumber,
} from '@/lib/mockData';
import { useTranslations } from 'next-intl';

type MainTab = 'predict' | 'mine' | 'leaderboard';

const USER_XP = 4720;
const USER_ACCURACY = 68.4;
const USER_RANK = 8;

// ────────────────────────────────────────────────────────────
// Prediction state per match
// ────────────────────────────────────────────────────────────
type PredState = {
  outcome: 'home' | 'draw' | 'away' | null;
  scoreHome: number;
  scoreAway: number;
  confirmed: boolean;
};

const rankMedal: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function PredictionsPage() {
  const t = useTranslations('Predictions');
  const [activeTab, setActiveTab] = useState<MainTab>('predict');
  const [predStates, setPredStates] = useState<Record<string, PredState>>(
    Object.fromEntries(
      PRED_MATCHES.map((m) => [
        m.id,
        { outcome: null, scoreHome: 0, scoreAway: 0, confirmed: false },
      ])
    )
  );
  const [toast, setToast] = useState<string | null>(null);

  const setOutcome = (matchId: string, outcome: 'home' | 'draw' | 'away') => {
    setPredStates((prev) => ({ ...prev, [matchId]: { ...prev[matchId], outcome } }));
  };

  const setScore = (matchId: string, side: 'home' | 'away', val: number) => {
    if (val < 0 || val > 9) return;
    setPredStates((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side === 'home' ? 'scoreHome' : 'scoreAway']: val,
      },
    }));
  };

  const confirm = (match: PredMatch) => {
    const state = predStates[match.id];
    if (!state.outcome) return;
    setPredStates((prev) => ({ ...prev, [match.id]: { ...prev[match.id], confirmed: true } }));
    showToast(`✅ ${t('toast_confirmed')} +${match.xpReward} XP`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-emerald-500 text-white rounded-xl shadow-2xl shadow-emerald-500/40 text-sm font-semibold animate-bounce">
          {toast}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                🎯 <span>{t('title').replace('🎯 ', '')}</span>
              </h1>
              <p className="text-gray-400 mt-1 text-sm">{t('subtitle')}</p>
            </div>

            {/* User quick stats */}
            <div className="flex gap-3">
              {[
                { label: t('stat_current_xp'), value: USER_XP.toLocaleString(), icon: '⚡', color: 'text-amber-400' },
                { label: t('stat_accuracy'), value: `${USER_ACCURACY}%`, icon: '🎯', color: 'text-emerald-400' },
                { label: t('stat_rank'), value: `#${USER_RANK}`, icon: '🏆', color: 'text-blue-400' },
              ].map((s) => (
                <div key={s.label} className="text-center px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl min-w-[80px]">
                  <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit max-w-full overflow-x-auto scrollbar-hide">
          {(
            [
              { id: 'predict', label: t('tab_predict') },
              { id: 'mine', label: t('tab_mine') },
              { id: 'leaderboard', label: t('tab_leaderboard') },
            ] as { id: MainTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* TAB: Dự đoán ngay                         */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === 'predict' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {PRED_MATCHES.map((match) => {
              const state = predStates[match.id];
              return (
                <PredictCard
                  key={match.id}
                  match={match}
                  state={state}
                  onOutcome={setOutcome}
                  onScore={setScore}
                  onConfirm={confirm}
                />
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB: My Predictions                       */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === 'mine' && (
          <div className="flex flex-col gap-4">
            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              {[
                { label: t('stat_correct'), value: MY_PREDICTIONS.filter((p) => p.result === 'win').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: t('stat_wrong'), value: MY_PREDICTIONS.filter((p) => p.result === 'loss').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                { label: t('stat_pending'), value: MY_PREDICTIONS.filter((p) => p.result === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              ].map((s) => (
                <div key={s.label} className={`text-center p-3 rounded-xl border ${s.bg}`}>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {MY_PREDICTIONS.map((pred) => (
              <MyPredCard key={pred.id} pred={pred} />
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB: Leaderboard                          */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Predict Card
// ────────────────────────────────────────────────────────────
function PredictCard({
  match,
  state,
  onOutcome,
  onScore,
  onConfirm,
}: {
  match: PredMatch;
  state: PredState;
  onOutcome: (id: string, o: 'home' | 'draw' | 'away') => void;
  onScore: (id: string, side: 'home' | 'away', v: number) => void;
  onConfirm: (m: PredMatch) => void;
}) {
  const t = useTranslations('Predictions');
  const isUCL = match.competition.includes('Champions');

  return (
    <div className={`relative bg-white/[0.04] border rounded-2xl overflow-hidden transition-all duration-300 ${
      state.confirmed
        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/15'
        : 'border-white/[0.08] hover:border-white/[0.15]'
    }`}>
      {/* Confirmed overlay */}
      {state.confirmed && (
        <div className="absolute inset-0 bg-emerald-500/5 z-10 flex items-center justify-center">
          <div className="bg-emerald-500/90 backdrop-blur-sm px-6 py-3 rounded-xl text-white font-bold text-lg shadow-2xl">
            ✅ {t('btn_confirmed')} · +{match.xpReward} XP
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.06] ${isUCL ? 'bg-gradient-to-r from-blue-950/50 to-indigo-950/50' : ''}`}>
        <span className="text-xs text-gray-400 font-medium">{match.competition}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">⏰ {match.kickoff}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isUCL
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
          }`}>
            +{match.xpReward} XP
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Teams */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-4xl">{match.homeEmoji}</span>
            <span className="text-sm font-bold text-white text-center leading-tight">{match.homeTeam}</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-2xl font-black text-gray-600">VS</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-4xl">{match.awayEmoji}</span>
            <span className="text-sm font-bold text-white text-center leading-tight">{match.awayTeam}</span>
          </div>
        </div>

        {/* Outcome buttons */}
        <div className="flex gap-2 mb-4">
          {(
            [
              { key: 'home', label: t('outcome_win', { team: match.homeTeam }) },
              { key: 'draw', label: t('outcome_draw') },
              { key: 'away', label: t('outcome_win', { team: match.awayTeam }) },
            ] as { key: 'home' | 'draw' | 'away'; label: string }[]
          ).map((o) => (
            <button
              key={o.key}
              disabled={state.confirmed}
              onClick={() => onOutcome(match.id, o.key)}
              className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                state.outcome === o.key
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.03]'
                  : 'bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:border-emerald-500/30 hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Score prediction */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-xs text-gray-500">{t('score_predict_label')}</span>
          <div className="flex items-center gap-2">
            <ScoreInput
              value={state.scoreHome}
              onChange={(v) => onScore(match.id, 'home', v)}
              disabled={state.confirmed}
            />
            <span className="text-gray-500 font-bold">—</span>
            <ScoreInput
              value={state.scoreAway}
              onChange={(v) => onScore(match.id, 'away', v)}
              disabled={state.confirmed}
            />
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={() => onConfirm(match)}
          disabled={!state.outcome || state.confirmed}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            state.confirmed
              ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30'
              : state.outcome
              ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-md shadow-emerald-500/25'
              : 'bg-white/[0.04] text-gray-600 cursor-not-allowed border border-white/[0.05]'
          }`}
        >
          {state.confirmed ? `✅ ${t('btn_confirmed')}` : `⚡ ${t('btn_confirm')}`}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Score Input Spinner
// ────────────────────────────────────────────────────────────
function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        disabled={disabled || value <= 0}
        onClick={() => onChange(value - 1)}
        className="w-6 h-6 rounded-md bg-white/[0.06] text-gray-400 hover:bg-white/[0.12] hover:text-white transition text-xs disabled:opacity-30"
      >
        −
      </button>
      <span className="w-7 text-center font-bold text-white text-sm">{value}</span>
      <button
        disabled={disabled || value >= 9}
        onClick={() => onChange(value + 1)}
        className="w-6 h-6 rounded-md bg-white/[0.06] text-gray-400 hover:bg-white/[0.12] hover:text-white transition text-xs disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// My Prediction Card
// ────────────────────────────────────────────────────────────
function MyPredCard({ pred }: { pred: MyPred }) {
  const t = useTranslations('Predictions');
  const resultStyles = {
    win: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: `✅ ${t('badge_correct')}`, dot: 'bg-emerald-400' },
    loss: { badge: 'bg-red-500/20 text-red-300 border-red-500/30', label: `❌ ${t('badge_wrong')}`, dot: 'bg-red-400' },
    pending: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: `⏳ ${t('badge_pending')}`, dot: 'bg-amber-400' },
  };
  const rs = resultStyles[pred.result ?? 'pending'];

  const outcomeLabel = {
    home: t('outcome_win', { team: pred.homeTeam }),
    draw: t('outcome_draw'),
    away: t('outcome_win', { team: pred.awayTeam }),
  }[pred.prediction];

  return (
    <div className={`bg-white/[0.04] border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-white/[0.15] transition-all ${
      pred.result === 'win' ? 'border-emerald-500/20' : pred.result === 'loss' ? 'border-red-500/15' : 'border-white/[0.08]'
    }`}>
      {/* Teams */}
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">{pred.homeEmoji}</span>
        <div>
          <p className="text-sm font-semibold text-white">{pred.homeTeam} vs {pred.awayTeam}</p>
          <p className="text-xs text-gray-500">{pred.competition} · {pred.date}</p>
        </div>
        <span className="text-2xl">{pred.awayEmoji}</span>
      </div>

      {/* Prediction */}
      <div className="flex flex-col items-start sm:items-center gap-1">
        <span className="text-xs text-gray-500">{t('my_pred_label')}</span>
        <span className="text-sm font-semibold text-white">{outcomeLabel}</span>
        <span className="text-xs text-emerald-500">{pred.scoreHome} — {pred.scoreAway}</span>
      </div>

      {/* Actual */}
      {pred.actualScore && (
        <div className="flex flex-col items-start sm:items-center gap-1">
          <span className="text-xs text-gray-500">{t('my_result_label')}</span>
          <span className="text-sm font-bold text-white">{pred.actualScore}</span>
        </div>
      )}

      {/* Result badge */}
      <div className="flex flex-col items-end gap-1">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${rs.badge}`}>{rs.label}</span>
        {pred.xpEarned !== undefined && pred.result !== 'pending' && (
          <span className={`text-xs font-bold ${pred.xpEarned > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
            {pred.xpEarned > 0 ? `+${pred.xpEarned} XP` : '0 XP'}
          </span>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Leaderboard Tab
// ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
function LeaderboardTab() {
  const t = useTranslations('Predictions');
  const topThree = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-4 mb-10">
        {/* 2nd */}
        <PodiumCard entry={topThree[1]} height="h-32" />
        {/* 1st */}
        <PodiumCard entry={topThree[0]} height="h-40" crown />
        {/* 3rd */}
        <PodiumCard entry={topThree[2]} height="h-24" />
      </div>

      {/* Table container with horizontal scroll for mobile */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-[600px]">
          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_80px_80px_80px_80px] gap-2 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
            <span>#</span>
            <span>{t('lb_player')}</span>
            <span className="text-center">{t('lb_correct')}</span>
            <span className="text-center">{t('lb_total')}</span>
            <span className="text-center">{t('lb_accuracy')}</span>
            <span className="text-right">XP</span>
          </div>

          {/* Rows (rank 4-10) */}
          <div className="flex flex-col gap-2">
            {rest.map((entry) => (
              <LeaderboardRow key={entry.rank} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  height,
  crown,
}: {
  entry: LeaderboardEntry;
  height: string;
  crown?: boolean;
}) {
  const t = useTranslations('Predictions');
  const medal = rankMedal[entry.rank];
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 max-w-[160px] ${crown ? 'scale-105' : ''}`}>
      {crown && <span className="text-2xl animate-bounce">👑</span>}
      <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center shadow-xl`}>
        <span className="text-xl font-black text-white">{entry.initials}</span>
        <span className="absolute -bottom-1 -right-1 text-lg">{medal}</span>
      </div>
      <p className="text-xs font-bold text-white text-center leading-tight">{entry.displayName}</p>
      <p className="text-[10px] text-gray-400 text-center">{entry.levelName}</p>
      <div className={`w-full ${height} rounded-t-xl flex flex-col items-center justify-end pb-3 gap-1
        ${entry.rank === 1 ? 'bg-gradient-to-t from-amber-900/60 to-amber-700/30 border border-amber-500/30' :
          entry.rank === 2 ? 'bg-gradient-to-t from-slate-700/60 to-slate-600/30 border border-slate-500/30' :
          'bg-gradient-to-t from-orange-900/60 to-orange-700/30 border border-orange-500/30'
        } rounded-t-xl`}
      >
        <p className="text-emerald-400 font-black text-sm">{formatNumber(entry.xp)} XP</p>
        <p className="text-gray-400 text-[10px]">{entry.accuracy}% {t('stat_accuracy')}</p>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const t = useTranslations('Predictions');
  return (
    <div className={`grid grid-cols-[40px_1fr_80px_80px_80px_80px] gap-2 items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
      entry.isCurrentUser
        ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12]'
    }`}>
      {/* Rank */}
      <span className={`text-sm font-bold text-center ${entry.isCurrentUser ? 'text-emerald-400' : 'text-gray-500'}`}>
        #{entry.rank}
      </span>

      {/* Player */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center text-xs font-bold text-white shadow-md`}>
          {entry.initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm font-semibold truncate ${entry.isCurrentUser ? 'text-emerald-300' : 'text-white'}`}>
              {entry.displayName}
            </p>
            {entry.isCurrentUser && (
              <span className="text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-1.5 py-px rounded-full whitespace-nowrap">{t('lb_you')}</span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 truncate">{entry.levelName} · Lv.{entry.level}</p>
        </div>
      </div>

      {/* Correct */}
      <span className="text-center text-sm font-semibold text-emerald-400">{entry.correct}</span>

      {/* Total */}
      <span className="text-center text-sm text-gray-400">{entry.total}</span>

      {/* Accuracy */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-bold text-white">{entry.accuracy}%</span>
        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
            style={{ width: `${entry.accuracy}%` }}
          />
        </div>
      </div>

      {/* XP */}
      <span className="text-right text-sm font-bold text-amber-400">{formatNumber(entry.xp)}</span>
    </div>
  );
}
