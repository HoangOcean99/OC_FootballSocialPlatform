import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('footballverse_token') || localStorage.getItem('footballverse_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const fetchLiveMatches = async () => {
  const { data } = await api.get('/matches/live');
  return data;
};

export const fetchUpcomingMatches = async () => {
  const { data } = await api.get('/matches/upcoming');
  return data;
};

export const fetchTrendingPosts = async () => {
  const { data } = await api.get('/posts/trending');
  return data;
};

export const fetchTopCommunities = async () => {
  const { data } = await api.get('/communities/top');
  return data;
};

export const fetchTopPredictors = async () => {
  const { data } = await api.get('/users/top-predictors');
  return data;
};

export const fetchTopCompetitions = async () => {
  const { data } = await api.get('/competitions/top');
  return data;
};

export const fetchUserProfile = async (username: string) => {
  const { data } = await api.get(`/users/profile/${username}`);
  return data;
};

export const fetchAllCommunities = async () => {
  const { data } = await api.get('/communities');
  return data;
};

export const fetchActivePredictions = async () => {
  const { data } = await api.get('/predictions/active');
  return data;
};

export const fetchAllCompetitions = async () => {
  const { data } = await api.get('/competitions');
  return data;
};

export const fetchAllMatches = async (date?: string) => {
  const url = date ? `/matches?date=${date}` : '/matches';
  const { data } = await api.get(url);
  return data;
};

export const sendHeartbeat = async () => {
  const { data } = await api.put('/users/heartbeat');
  return data;
};

export const fetchOnlineFriends = async () => {
  const { data } = await api.get('/users/online');
  return data;
};

export const fetchTodayStats = async () => {
  const { data } = await api.get('/users/stats/today');
  return data;
};

export const fetchMatchDetails = async (id: string, lang?: string) => {
  const url = lang ? `/matches/${id}/details?lang=${lang}` : `/matches/${id}/details`;
  const { data } = await api.get(url);
  return data;
};

export const fetchCompetitionDetails = async (id: string) => {
  const { data } = await api.get(`/competitions/${id}`);
  return data;
};

export const fetchCompetitionStandings = async (id: string, season?: string) => {
  const url = season ? `/competitions/${id}/standings?season=${season}` : `/competitions/${id}/standings`;
  const { data } = await api.get(url);
  return data;
};

export const fetchCompetitionMatches = async (id: string, season?: string) => {
  const url = season ? `/competitions/${id}/matches?season=${season}` : `/competitions/${id}/matches`;
  const { data } = await api.get(url);
  return data;
};
