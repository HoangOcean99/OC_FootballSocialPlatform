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

export const fetchPostById = async (id: string) => {
  const { data } = await api.get(`/posts/${id}`);
  return data;
};

export const fetchPostReactions = async (id: string) => {
  const { data } = await api.get(`/posts/${id}/reactions`);
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

export const fetchShopItems = async () => {
  const { data } = await api.get('/shop/items');
  return data;
};

export const buyShopItem = async (itemId: string) => {
  const { data } = await api.post(`/shop/buy/${itemId}`);
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

export const fetchPredictionsByDate = async (dateStr: string) => {
  const { data } = await api.get(`/predictions/date/${dateStr}`);
  return data;
};

export const fetchMyBets = async () => {
  const { data } = await api.get('/predictions/my-bets');
  return data;
};

export const fetchBetById = async (id: string) => {
  const { data } = await api.get(`/predictions/my-bets/${id}`);
  return data;
};

export const placeBet = async (matchId: string, type: string, wager: number) => {
  const { data } = await api.post(`/predictions/${matchId}/bet`, { type, wager });
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

// Follow System
export const followUser = async (userId: string) => {
  const { data } = await api.post(`/users/${userId}/follow`);
  return data;
};

export const unfollowUser = async (userId: string) => {
  const { data } = await api.delete(`/users/${userId}/follow`);
  return data;
};

export const fetchFollowers = async () => {
  const { data } = await api.get('/users/me/followers');
  return data;
};

export const fetchFollowing = async () => {
  const { data } = await api.get('/users/me/following');
  return data;
};

export const fetchSuggestedUsers = async () => {
  const { data } = await api.get('/users/me/suggestions');
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

export const createCommunity = async (communityData: any) => {
  const { data } = await api.post('/communities', communityData);
  return data;
};

export const fetchCommunityDetails = async (id: string) => {
  const { data } = await api.get(`/communities/${id}`);
  return data;
};

export const joinCommunity = async (id: string) => {
  const { data } = await api.post(`/communities/${id}/join`);
  return data;
};

export const leaveCommunity = async (id: string) => {
  const { data } = await api.post(`/communities/${id}/leave`);
  return data;
};

export const checkCommunityName = async (name: string) => {
  const { data } = await api.get(`/communities/check-name?name=${encodeURIComponent(name)}`);
  return data;
};

export const updateCommunity = async (id: string, communityData: any) => {
  const { data } = await api.put(`/communities/${id}`, communityData);
  return data;
};

export const deleteCommunity = async (id: string) => {
  const { data } = await api.delete(`/communities/${id}`);
  return data;
};

export const batchDeleteCommunities = async (ids: string[]) => {
  const { data } = await api.post(`/communities/batch-delete`, { ids });
  return data;
};

// Upload Image to Backend (Cloudinary)
export const uploadImage = async (file: File, folder?: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  if (folder) {
    formData.append('folder', folder);
  }
  
  const { data } = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.url;
};

export const fetchCommunityRequests = async (id: string) => {
  const { data } = await api.get(`/communities/${id}/requests`);
  return data;
};

export const approveCommunityRequest = async (id: string, userId: string) => {
  const { data } = await api.post(`/communities/${id}/requests/${userId}/approve`);
  return data;
};

export const rejectCommunityRequest = async (id: string, userId: string) => {
  const { data } = await api.post(`/communities/${id}/requests/${userId}/reject`);
  return data;
};

export const fetchCommunityMembers = async (id: string) => {
  const { data } = await api.get(`/communities/${id}/members`);
  return data;
};

export const kickCommunityMember = async (id: string, userId: string) => {
  const { data } = await api.post(`/communities/${id}/members/${userId}/kick`);
  return data;
};

export const inviteCommunityMember = async (id: string, username: string) => {
  const { data } = await api.post(`/communities/${id}/members/invite`, { username });
  return data;
};

export const searchUsers = async (query: string) => {
  const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return data;
};

export const fetchMyInvites = async () => {
  const { data } = await api.get('/communities/me/invites');
  return data;
};

export const acceptCommunityInvite = async (id: string) => {
  const { data } = await api.post(`/communities/${id}/invites/accept`);
  return data;
};

export const rejectCommunityInvite = async (id: string) => {
  const { data } = await api.post(`/communities/${id}/invites/reject`);
  return data;
};

export const promoteCommunityAdmin = async (id: string, userId: string) => {
  const { data } = await api.post(`/communities/${id}/admins/promote`, { userId });
  return data;
};

export const fetchMyAdminInvites = async () => {
  const { data } = await api.get('/communities/me/admin-invites');
  return data;
};

export const acceptCommunityAdminInvite = async (id: string) => {
  const { data } = await api.post(`/communities/${id}/admins/accept`);
  return data;
};

export const rejectCommunityAdminInvite = async (id: string) => {
  const { data } = await api.post(`/communities/${id}/admins/reject`);
  return data;
};

export const resignCommunityAdmin = async (id: string) => {
  const { data } = await api.post(`/communities/${id}/admins/resign`);
  return data;
};

// Posts & Comments
export const createPost = async (communityId: string, content: string, image?: string) => {
  const { data } = await api.post(`/posts/community/${communityId}`, { content, image });
  return data;
};

export const reactPost = async (postId: string, reaction: string | null) => {
  const { data } = await api.post(`/posts/${postId}/react`, { reaction });
  return data;
};

export const fetchCommunityPosts = async (communityId: string) => {
  const { data } = await api.get(`/posts/community/${communityId}`);
  return data;
};

export const fetchPendingPosts = async (communityId: string) => {
  const { data } = await api.get(`/posts/community/${communityId}/pending`);
  return data;
};

export const approvePost = async (id: string) => {
  const { data } = await api.put(`/posts/${id}/approve`);
  return data;
};

export const rejectPost = async (id: string) => {
  const { data } = await api.put(`/posts/${id}/reject`);
  return data;
};

export const deletePost = async (id: string) => {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
};

export const createComment = async (postId: string, content: string, parentId?: string, image?: string) => {
  const { data } = await api.post(`/posts/${postId}/comments`, { content, parentId, image });
  return data;
};

export const fetchPostComments = async (postId: string) => {
  const { data } = await api.get(`/posts/${postId}/comments`);
  return data;
};

export const deleteComment = async (commentId: string) => {
  const { data } = await api.delete(`/posts/comments/${commentId}`);
  return data;
};

// Chat
export const fetchCommunityMessages = async (communityId: string, limit?: number) => {
  const url = limit ? `/communities/${communityId}/messages?limit=${limit}` : `/communities/${communityId}/messages`;
  const { data } = await api.get(url);
  return data;
};

export const sendCommunityMessage = async (communityId: string, content: string, imageUrl?: string) => {
  const { data } = await api.post(`/communities/${communityId}/messages`, { content, imageUrl });
  return data;
};

// Private Messaging (Inbox)
export const fetchConversations = async () => {
  const { data } = await api.get('/messages/conversations');
  return data;
};

export const fetchPrivateMessages = async (targetUserId: string) => {
  const { data } = await api.get(`/messages/conversations/${targetUserId}`);
  return data;
};

export const sendPrivateMessage = async (targetUserId: string, content: string, imageUrl?: string) => {
  const { data } = await api.post(`/messages/conversations/${targetUserId}`, { content, imageUrl });
  return data;
};

export const markConversationAsRead = async (conversationId: string) => {
  const { data } = await api.put(`/messages/conversations/${conversationId}/read`);
  return data;
};
