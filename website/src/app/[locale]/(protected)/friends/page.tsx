'use client';
import { useEffect, useState } from 'react';
import { Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFollowers, fetchFollowing, fetchSuggestedUsers, followUser, unfollowUser, searchUsers } from '@/lib/api';
import { UserProfile } from '@football-fan/shared-types';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import UserPopover from '@/components/chat/UserPopover';
import { useTranslations } from 'next-intl';

export default function FriendsPage() {
  const t = useTranslations('Friends');
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'following' | 'followers'>('suggestions');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [followersData, followingData, suggestionsData] = await Promise.all([
        fetchFollowers(),
        fetchFollowing(),
        fetchSuggestedUsers()
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error loading friends data:', error);
      toast.error('Không thể tải dữ liệu bạn bè');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFollow = async (targetId: string) => {
    try {
      await followUser(targetId);
      toast.success('Đã theo dõi!');
      // Optimistic update
      const targetUser = suggestions.find(u => u.id === targetId) || followers.find(u => u.id === targetId);
      if (targetUser) {
        setFollowing(prev => [...prev, targetUser]);
        setSuggestions(prev => prev.filter(u => u.id !== targetId));
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi theo dõi');
    }
  };

  const handleUnfollow = async (targetId: string) => {
    try {
      await unfollowUser(targetId);
      toast.success('Đã bỏ theo dõi!');
      // Optimistic update
      const targetUser = following.find(u => u.id === targetId);
      setFollowing(prev => prev.filter(u => u.id !== targetId));
      if (targetUser && !suggestions.find(u => u.id === targetId)) {
        setSuggestions(prev => [...prev, targetUser]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi bỏ theo dõi');
    }
  };

  const renderUserCard = (u: UserProfile, type: 'following' | 'follower' | 'suggestion') => {
    return (
      <motion.div
        key={u.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[#0f1923] border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500/50 transition-colors group cursor-pointer"
        onClick={() => {}}
      >
        <UserPopover user={u}>
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 shrink-0">
              <img 
                src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                alt="Avatar" 
                className={`w-full h-full rounded-full object-cover border border-white/10 ${
                  u.purchasedItems?.includes('frame_dragon') ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : ''
                }`} 
              />
              {u.purchasedItems?.includes('frame_dragon') && (
                <div className="absolute -inset-1 border-2 border-amber-500/50 rounded-full animate-pulse pointer-events-none" />
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className={`font-bold ${
                  u.purchasedItems?.includes('name_vip_red') 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' 
                    : 'text-white'
                }`}>
                  {u.displayName || u.username}
                </span>
                {u.purchasedItems?.includes('badge_wizard') && (
                  <span className="text-xs drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] animate-pulse" title="Huy Hiệu Phù Thuỷ Dự Đoán">🌟</span>
                )}
              </div>
              <div className="text-sm text-gray-400">Lv. {u.level} • {u.levelTitle}</div>
            </div>
          </div>
        </UserPopover>

        <div onClick={(e) => e.stopPropagation()}>
          {type === 'following' ? (
            <button
              onClick={() => handleUnfollow(u.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-white hover:text-red-400 rounded-xl transition-colors border border-white/10 hover:border-red-500/30 text-sm font-semibold"
            >
              <UserMinus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('btn_unfollow')}</span>
            </button>
          ) : type === 'suggestion' || (type === 'follower' && !following.find(f => f.id === u.id)) ? (
            <button
              onClick={() => handleFollow(u.id)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] text-sm font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{type === 'follower' ? t('btn_follow_back') : t('btn_follow')}</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 text-sm font-semibold cursor-default"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t('btn_friends')}</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  };
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            {t('title')}
          </h1>
        </div>
        {/* Search Bar */}
        <div className="mb-8 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1923] border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors shadow-lg"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 min-w-[120px] py-4 font-bold transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'suggestions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('tab_suggestions')}
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 min-w-[120px] py-4 font-bold transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'following' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('tab_following')}
            <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-xs">{following.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 min-w-[120px] py-4 font-bold transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'followers' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('tab_followers')}
            <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-xs">{followers.length}</span>
          </button>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-[#0f1923] border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : searchQuery.trim() ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {isSearching ? (
                <div className="col-span-1 md:col-span-2 text-center py-12 text-emerald-400">
                  {t('searching')}
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(u => renderUserCard(u, 'suggestion'))
              ) : (
                <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500">
                  {t('no_accounts_found')}
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {activeTab === 'suggestions' && suggestions.map(u => renderUserCard(u, 'suggestion'))}
              {activeTab === 'following' && following.map(u => renderUserCard(u, 'following'))}
              {activeTab === 'followers' && followers.map(u => renderUserCard(u, 'follower'))}
            </AnimatePresence>

            {activeTab === 'suggestions' && suggestions.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500">
                {t('no_suggestions')}
              </div>
            )}
            {activeTab === 'following' && following.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500">
                {t('no_following')}
              </div>
            )}
            {activeTab === 'followers' && followers.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500">
                {t('no_followers')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
