'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Shield, MessageSquare, TrendingUp, ArrowLeft, MoreHorizontal, Image as ImageIcon, Send, Plus, Edit2, Trash2, X, MapPin, Globe, MessageCircle, FileText, Link, Settings, LogOut, Share } from 'lucide-react';
import { fetchCommunityDetails, joinCommunity, leaveCommunity, deleteCommunity, updateCommunity, checkCommunityName, uploadImage, fetchCommunityRequests, approveCommunityRequest, rejectCommunityRequest, fetchCommunityMembers, kickCommunityMember, fetchUserProfile, inviteCommunityMember, searchUsers, promoteCommunityAdmin, acceptCommunityAdminInvite, rejectCommunityAdminInvite, resignCommunityAdmin, createPost, fetchCommunityPosts, fetchPendingPosts, approvePost, rejectPost, createComment, fetchPostComments, deletePost, deleteComment } from '@/lib/api';
import { Community, UserProfile, Post, Comment } from '@football-fan/shared-types';
import ReactionButton from '@/components/ReactionButton';

export function formatTimeAgo(dateStr: string | Date): string {
  if (!dateStr) return 'Vừa xong';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useSocket } from '@/components/providers/SocketProvider';

const MySwal = withReactContent(Swal);

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, updateUser } = useAuthStore();
  const { socket } = useSocket();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');

  // Admin and Join States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'members' | 'requests' | 'invite'>('members');
  const [membersList, setMembersList] = useState<UserProfile[]>([]);
  const [requestsList, setRequestsList] = useState<UserProfile[]>([]);
  const [isPendingJoin, setIsPendingJoin] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  
  const [inviteSearch, setInviteSearch] = useState('');
  const [inviteSearchResults, setInviteSearchResults] = useState<UserProfile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Posts & Moderation states
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentImageInputs, setCommentImageInputs] = useState<Record<string, File | null>>({});
  const [commentImagePreviews, setCommentImagePreviews] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; username: string } | null>(null);
  const [isCommenting, setIsCommenting] = useState<Record<string, boolean>>({});

  // Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameError, setNameError] = useState('');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    category: 'General',
    logo: '⚽',
    cover: '',
    coverColor: 'from-emerald-500 to-teal-700',
    slogan: '',
    rules: '',
    tags: '',
    location: '',
    website: '',
    isPrivate: false,
    requireApproval: false,
    requirePostApproval: false,
    themeColor: '#10b981',
    socialLinks: { facebook: '', discord: '', instagram: '', youtube: '' }
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'logo') setIsUploadingLogo(true);
    else setIsUploadingCover(true);

    try {
      const folder = field === 'logo' ? 'communities/logos' : 'communities/covers';
      const url = await uploadImage(file, folder);
      setEditData(prev => ({ ...prev, [field]: url }));
      toast.success('Tải ảnh lên thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      if (field === 'logo') setIsUploadingLogo(false);
      else setIsUploadingCover(false);
    }
  };

  const loadPosts = async (communityId: string) => {
    try {
      setIsLoadingPosts(true);
      const data = await fetchCommunityPosts(communityId);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadPendingPosts = async (communityId: string) => {
    try {
      const data = await fetchPendingPosts(communityId);
      setPendingPosts(data);
    } catch (err) {
      console.error('Failed to load pending posts', err);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const data = await fetchPostComments(postId);
      setCommentsMap(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCommunityDetails(id)
        .then(data => {
          setCommunity(data);
          // Load posts immediately
          loadPosts(id);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }

    if (user?.username) {
      fetchUserProfile(user.username).then((data) => {
        if (data && data.joinedCommunities) {
          updateUser({ joinedCommunities: data.joinedCommunities });
        }
      }).catch(console.error);
    }
  }, [id, user?.username]);

  // Load pending posts if admin
  useEffect(() => {
    if (community && user?.id) {
      const isAdminUser = community.creatorId === user.id || community.adminIds?.includes(user.id);
      if (isAdminUser && community.requirePostApproval) {
        loadPendingPosts(community.id || id);
      }
    }
  }, [community?.id, user?.id, community?.requirePostApproval]);

  // WebSocket Listeners
  useEffect(() => {
    if (!socket || !community) return;

    const handleKicked = (data: { communityId: string }) => {
      if (data.communityId === community.id) {
        toast.error('Bạn đã bị quản trị viên kick khỏi cộng đồng này!', { icon: '🚪' });
        router.push('/communities');
      }
    };

    const handleJoinRequested = (data: { communityId: string, userId: string, username: string, avatarUrl: string }) => {
      if (data.communityId === community.id && isAdminModalOpen) {
        setRequestsList(prev => {
          if (prev.some(u => u.id === data.userId)) return prev;
          return [...prev, { id: data.userId, username: data.username, avatarUrl: data.avatarUrl } as UserProfile];
        });
      }
    };

    const handleRequestApproved = (data: { communityId: string }) => {
      if (data.communityId === community.id && user) {
        updateUser({ joinedCommunities: [...(user.joinedCommunities || []), community.id] });
        setCommunity(prev => prev ? { 
          ...prev, 
          joinRequests: prev.joinRequests?.filter(id => id !== user.id),
          memberCount: (prev.memberCount || 0) + 1 
        } : null);
      }
    };

    const handleInviteAccepted = (data: { communityId: string, userId: string, username: string, avatarUrl: string }) => {
      if (data.communityId === community.id) {
        setCommunity(prev => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : null);
        if (isAdminModalOpen) {
          setMembersList(prev => {
            if (prev.some(u => u.id === data.userId)) return prev;
            return [...prev, { id: data.userId, username: data.username, avatarUrl: data.avatarUrl } as UserProfile];
          });
        }
      }
    };

    const handleAdminInviteAccepted = (data: any) => {
      if (data.communityId === community?.id) {
        setCommunity(prev => prev ? { ...prev, adminIds: [...(prev.adminIds || []), data.userId] } : null);
      }
    };

    const handleMemberJoined = (data: any) => {
      if (data.communityId === community?.id) {
        setCommunity(prev => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : null);
        if (isAdminModalOpen) {
          setMembersList(prev => [...prev, { id: data.userId, username: data.username, avatarUrl: data.avatarUrl } as UserProfile]);
        }
      }
    };

    const handleMemberLeft = (data: any) => {
      if (data.communityId === community?.id) {
        setCommunity(prev => prev ? { ...prev, memberCount: Math.max(0, (prev.memberCount || 0) - 1) } : null);
        if (isAdminModalOpen) {
          setMembersList(prev => prev.filter(m => m.id !== data.userId));
        }
      }
    };

    const handlePostCreated = (data: any) => {
      console.log("WS received COMMUNITY_POST_CREATED", data);
      if (data.communityId === community?.id) {
        setPosts(prev => {
          if (prev.some(p => p.id === data.post.id)) return prev;
          return [data.post, ...prev];
        });
      }
    };

    const handleCommentCreated = (data: any) => {
      console.log("WS received COMMUNITY_COMMENT_CREATED", data);
      if (data.communityId === community?.id) {
        setPosts(prev => prev.map(p => p.id === data.postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
        setCommentsMap(prev => {
          const postComments = prev[data.postId];
          if (!postComments) return prev;
          
          if (!data.comment.parentId) {
            if (postComments.some((c: any) => c.id === data.comment.id)) return prev;
            return { ...prev, [data.postId]: [...postComments, data.comment] };
          } else {
            const clone = JSON.parse(JSON.stringify(postComments));
            const insertReply = (commentsList: any[]) => {
              for (const c of commentsList) {
                if (c.id === data.comment.parentId || c._id === data.comment.parentId) {
                  if (!c.replies) c.replies = [];
                  if (!c.replies.some((r: any) => r.id === data.comment.id)) {
                    c.replies.push(data.comment);
                  }
                  return true;
                }
                if (c.replies && c.replies.length > 0) {
                  if (insertReply(c.replies)) return true;
                }
              }
              return false;
            };
            insertReply(clone);
            return { ...prev, [data.postId]: clone };
          }
        });
      }
    };

    socket.on('COMMUNITY_KICKED', handleKicked);
    socket.on('COMMUNITY_JOIN_REQUESTED', handleJoinRequested);
    socket.on('COMMUNITY_REQUEST_APPROVED', handleRequestApproved);
    socket.on('COMMUNITY_INVITE_ACCEPTED', handleInviteAccepted);
    socket.on('COMMUNITY_ADMIN_INVITE_ACCEPTED', handleAdminInviteAccepted);
    socket.on('COMMUNITY_MEMBER_JOINED', handleMemberJoined);
    socket.on('COMMUNITY_MEMBER_LEFT', handleMemberLeft);
    socket.on('COMMUNITY_POST_CREATED', handlePostCreated);
    socket.on('COMMUNITY_COMMENT_CREATED', handleCommentCreated);

    return () => {
      socket.off('COMMUNITY_KICKED', handleKicked);
      socket.off('COMMUNITY_JOIN_REQUESTED', handleJoinRequested);
      socket.off('COMMUNITY_REQUEST_APPROVED', handleRequestApproved);
      socket.off('COMMUNITY_INVITE_ACCEPTED', handleInviteAccepted);
      socket.off('COMMUNITY_ADMIN_INVITE_ACCEPTED', handleAdminInviteAccepted);
      socket.off('COMMUNITY_MEMBER_JOINED', handleMemberJoined);
      socket.off('COMMUNITY_MEMBER_LEFT', handleMemberLeft);
      socket.off('COMMUNITY_POST_CREATED', handlePostCreated);
      socket.off('COMMUNITY_COMMENT_CREATED', handleCommentCreated);
    };
  }, [socket, community, router, isAdminModalOpen, user, updateUser]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postImage) return;
    if (!id) return;
    try {
      setIsPosting(true);
      let imageUrl = '';
      if (postImage) {
        imageUrl = await uploadImage(postImage, `communities/${id}/posts`);
      }
      const newPost = await createPost(id, postContent, imageUrl);
      
      if (newPost.status === 'PENDING') {
        toast.success('Bài viết của bạn đã được gửi và đang chờ phê duyệt.');
      } else {
        setPosts(prev => {
          if (prev.some(p => p.id === newPost.id)) return prev;
          return [newPost, ...prev];
        });
        toast.success('Đăng bài thành công!');
      }
      setPostContent('');
      setPostImage(null);
      setPostImagePreview('');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi đăng bài');
    } finally {
      setIsPosting(false);
    }
  };
  const handleDeletePost = async (postId: string) => {
    MySwal.fire({
      title: 'Gỡ bài đăng?',
      text: 'Bài đăng này sẽ bị xóa vĩnh viễn cùng với các bình luận bên trong.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Gỡ bài',
      cancelButtonText: 'Hủy',
      background: '#0f1923',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePost(postId);
          setPosts(prev => prev.filter(p => p.id !== postId));
          toast.success('Đã gỡ bài đăng');
        } catch (err) {
          console.error(err);
          toast.error('Lỗi khi gỡ bài đăng');
        }
      }
    });
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    MySwal.fire({
      title: 'Gỡ bình luận?',
      text: 'Bình luận này và các phản hồi con sẽ bị xóa vĩnh viễn.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Gỡ',
      cancelButtonText: 'Hủy',
      background: '#0f1923',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteComment(commentId);
          loadComments(postId); // Reload comments for the post
          toast.success('Đã gỡ bình luận');
        } catch (err) {
          console.error(err);
          toast.error('Lỗi khi gỡ bình luận');
        }
      }
    });
  };


  const handleApprovePost = async (postId: string) => {
    try {
      await approvePost(postId);
      setPendingPosts(prev => prev.filter(p => p.id !== postId));
      // Refresh approved posts
      loadPosts(id || '');
      toast.success('Đã duyệt bài viết');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi duyệt bài');
    }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      await rejectPost(postId);
      setPendingPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Đã từ chối bài viết');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi từ chối bài');
    }
  };

  const handleCreateComment = async (postId: string, parentId?: string) => {
    const idKey = parentId || postId;
    const content = commentInputs[idKey];
    const image = commentImageInputs[idKey];
    
    if (!content?.trim() && !image) return;

    try {
      setIsCommenting(prev => ({ ...prev, [idKey]: true }));
      let imageUrl;
      if (image && community) {
        imageUrl = await uploadImage(image, `communities/${community.id}/comments`);
      }
      
      const newComment = await createComment(postId, content, parentId, imageUrl);
      
      // Update local state without full reload for better UX
      setCommentsMap(prev => {
        const postComments = prev[postId] ? [...prev[postId]] : [];
        if (!parentId) {
          if (!postComments.some(c => c.id === newComment.id)) {
            postComments.push(newComment);
          }
        } else {
          // Find parent and add to replies
          const findAndAddReply = (commentsList: Comment[]): boolean => {
            for (let i = 0; i < commentsList.length; i++) {
              if (commentsList[i].id === parentId) {
                if (!commentsList[i].replies) commentsList[i].replies = [];
                if (!commentsList[i].replies!.some(r => r.id === newComment.id)) {
                  commentsList[i].replies!.push(newComment);
                }
                return true;
              }
              if (commentsList[i].replies && findAndAddReply(commentsList[i].replies!)) {
                return true;
              }
            }
            return false;
          };
          findAndAddReply(postComments);
        }
        return { ...prev, [postId]: postComments };
      });

      setCommentInputs(prev => ({ ...prev, [idKey]: '' }));
      setCommentImageInputs(prev => ({ ...prev, [idKey]: null }));
      setCommentImagePreviews(prev => ({ ...prev, [idKey]: '' }));
      setIsCommenting(prev => ({ ...prev, [idKey]: false }));
      if (parentId) {
        setReplyingTo(null);
      }
      toast.success('Đã gửi bình luận');
    } catch (err) {
      console.error(err);
      const idKey = parentId || postId;
      setIsCommenting(prev => ({ ...prev, [idKey]: false }));
      toast.error('Lỗi khi gửi bình luận');
    }
  };

  const renderCommentsTree = (commentsList: Comment[], postId: string) => {
    return commentsList.map(comment => (
      <div key={comment.id} className="mt-3 first:mt-0">
        <div className="flex gap-3">
          <img src={comment.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.username}`} alt="Avatar" className="w-8 h-8 rounded-full shrink-0 border border-white/10" />
          <div className="flex-1">
            <div className="bg-white/5 rounded-2xl p-3 inline-block min-w-[120px]">
              <span className="font-bold text-white text-sm">{comment.author.displayName}</span>
              {comment.content && <p className="text-gray-200 text-sm mt-0.5 whitespace-pre-wrap">{comment.content}</p>}
              {comment.image && (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-[250px]">
                  <img src={comment.image} alt="Comment attachment" className="w-full h-auto object-contain bg-black/20" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 ml-2 text-[11px] font-semibold text-gray-500">
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
              {(user?.joinedCommunities?.includes(community?.id || '')) && (
                <button 
                  onClick={() => setReplyingTo({ postId, commentId: comment.id, username: comment.author.displayName })}
                  className="hover:text-gray-300 transition-colors"
                >
                  Phản hồi
                </button>
              )}
              {((community?.creatorId === user?.id || community?.adminIds?.includes(user?.id || '')) || comment.author.username === user?.username) && (
                <button 
                  onClick={() => handleDeleteComment(comment.id, postId)}
                  className="hover:text-red-400 transition-colors ml-2"
                  title="Gỡ bình luận"
                >
                  Gỡ
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-11 mt-2 border-l-2 border-white/10 pl-3">
            {renderCommentsTree(comment.replies, postId)}
          </div>
        )}
        
        {/* Reply Input */}
        {replyingTo?.commentId === comment.id && (
          <div className="ml-11 mt-2 flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Avatar" className="w-6 h-6 rounded-full shrink-0 border border-white/10" />
              <div className="flex-1 flex gap-1 items-center">
                <label className="cursor-pointer p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCommentImageChange(e, comment.id)} />
                </label>
                <input 
                  type="text" 
                  placeholder={`Trả lời ${replyingTo.username}...`}
                  value={commentInputs[comment.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [comment.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateComment(postId, comment.id);
                  }}
                  autoFocus
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={() => handleCreateComment(postId, comment.id)}
                  disabled={(!commentInputs[comment.id]?.trim() && !commentImageInputs[comment.id]) || isCommenting[comment.id]}
                  className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-full disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center"
                >
                  {isCommenting[comment.id] ? <span className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span> : <Send className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setReplyingTo(null)} className="p-1.5 text-gray-500 hover:text-white rounded-full">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {commentImagePreviews[comment.id] && (
              <div className="ml-8 relative inline-block w-24 h-24">
                <img src={commentImagePreviews[comment.id]} alt="Preview" className="w-full h-full object-cover rounded-lg border border-white/10" />
                <button onClick={() => removeCommentImage(comment.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };

  useEffect(() => {
    if (isAdminModalOpen && id) {
      fetchCommunityMembers(id).then(setMembersList).catch(console.error);
      fetchCommunityRequests(id).then(setRequestsList).catch(console.error);
    }
  }, [isAdminModalOpen, id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inviteSearch.trim().length > 0) {
        setIsSearchingUsers(true);
        try {
          const res = await searchUsers(inviteSearch.trim());
          setInviteSearchResults(res);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingUsers(false);
        }
      } else {
        setInviteSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inviteSearch]);

  useEffect(() => {
    if (community) {
      setEditData({
        name: community.name,
        description: community.description,
        category: community.category || 'General',
        logo: community.logo || '⚽',
        cover: community.cover || '',
        coverColor: community.coverColor || 'from-emerald-500 to-teal-700',
        slogan: community.slogan || '',
        rules: community.rules || '',
        tags: community.tags ? community.tags.join(', ') : '',
        location: community.location || '',
        website: community.website || '',
        isPrivate: community.isPrivate || false,
        requireApproval: community.requireApproval || false,
        themeColor: community.themeColor || '#10b981',
        socialLinks: {
          facebook: community.socialLinks?.facebook || '',
          discord: community.socialLinks?.discord || '',
          instagram: community.socialLinks?.instagram || '',
          youtube: community.socialLinks?.youtube || ''
        }
      });
    }
  }, [community]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (editData.name.trim().length > 2 && editData.name !== community?.name) {
        setIsCheckingName(true);
        try {
          const res = await checkCommunityName(editData.name.trim());
          if (!res.isAvailable) {
            setNameError('Tên cộng đồng đã tồn tại hoặc không hợp lệ');
          } else {
            setNameError('');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsCheckingName(false);
        }
      } else {
        setNameError('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [editData.name, community?.name]);

  const handleJoinLeave = async () => {
    if (!user || !community) return;
    
    const isJoined = user.joinedCommunities?.includes(community.id || '');
    const isAdmin = community.creatorId === user.id || community.adminIds?.includes(user.id);
    const allAdminIds = Array.from(new Set([community.creatorId, ...(community.adminIds || [])]));

    try {
      if (isJoined || isAdmin) {
        if (isAdmin && allAdminIds.length <= 1) {
          if ((community.memberCount || 0) > 1) {
            MySwal.fire({
              title: 'Không thể rời cộng đồng',
              text: 'Bạn đang là Quản trị viên duy nhất. Hãy nhường lại quyền Quản trị cho thành viên khác trước khi rời đi.',
              icon: 'error',
              confirmButtonColor: '#3b82f6',
              background: '#0f1923',
              color: '#fff'
            });
            return;
          } else {
            const result = await MySwal.fire({
              title: 'Xóa cộng đồng?',
              text: 'Bạn là thành viên duy nhất. Rời đi lúc này đồng nghĩa với việc giải tán cộng đồng. Bạn có chắc chắn?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#ef4444',
              cancelButtonColor: '#3b82f6',
              confirmButtonText: 'Giải tán',
              cancelButtonText: 'Hủy',
              background: '#0f1923',
              color: '#fff'
            });
            if (!result.isConfirmed) return;
          }
        } else {
          const result = await MySwal.fire({
            title: 'Rời cộng đồng?',
            text: 'Bạn có chắc chắn muốn rời khỏi cộng đồng này không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Rời đi',
            cancelButtonText: 'Hủy',
            background: '#0f1923',
            color: '#fff'
          });
          if (!result.isConfirmed) return;
        }

        const res = await leaveCommunity(community.id || '');
        if (res.deleted) {
          toast.success('Đã giải tán cộng đồng');
          router.push('/communities');
          return;
        }
        if (res.success) {
          updateUser({ joinedCommunities: res.joinedCommunities });
          toast.success('Đã rời khỏi cộng đồng');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        const res = await joinCommunity(community.id || '');
        if (res.success) {
          if (res.pending) {
            setIsPendingJoin(true);
            toast.success('Đã gửi yêu cầu tham gia, vui lòng chờ admin duyệt!');
          } else {
            updateUser({ joinedCommunities: res.joinedCommunities });
            setCommunity({ ...community, memberCount: (community.memberCount || 0) + 1 });
            toast.success('Đã tham gia cộng đồng!');
          }
        }
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await approveCommunityRequest(community?.id || '', userId);
      setRequestsList(prev => prev.filter(r => r.id !== userId));
      fetchCommunityMembers(community?.id || '').then(setMembersList);
      setCommunity(prev => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : null);
      toast.success('Đã duyệt yêu cầu!');
    } catch (err) { toast.error('Lỗi khi duyệt'); }
  };

  const handleReject = async (userId: string) => {
    try {
      await rejectCommunityRequest(community?.id || '', userId);
      setRequestsList(prev => prev.filter(r => r.id !== userId));
      toast.success('Đã từ chối yêu cầu!');
    } catch (err) { toast.error('Lỗi khi từ chối'); }
  };

  const handleKick = async (userId: string) => {
    MySwal.fire({
      title: 'Xác nhận Kick',
      text: 'Bạn có chắc chắn muốn kick thành viên này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Có, kick!',
      cancelButtonText: 'Hủy',
      background: '#0f1923',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await kickCommunityMember(community?.id || '', userId);
          setMembersList(prev => prev.filter(m => m.id !== userId));
          setCommunity(prev => prev ? { ...prev, memberCount: Math.max(0, (prev.memberCount || 0) - 1) } : null);
          toast.success('Đã kick thành viên!');
        } catch (err) { toast.error('Lỗi khi kick'); }
      }
    });
  };

  const handleInvite = async (username: string) => {
    setIsInviting(true);
    try {
      await inviteCommunityMember(community?.id || '', username);
      toast.success('Đã gửi lời mời!');
      // Do not fetch members list or increment member count since they are just invited, not joined
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi lời mời (người dùng không tồn tại hoặc đã được mời)');
    } finally {
      setIsInviting(false);
    }
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    alert('Tính năng đăng bài đang được phát triển!');
    setNewPost('');
  };

  const handleDelete = async () => {
    MySwal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa cộng đồng này không? Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Hủy',
      background: '#0f1923',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCommunity(id);
          toast.success('Xóa cộng đồng thành công!');
          router.push('/communities');
        } catch (error) {
          console.error('Error deleting community:', error);
          toast.error('Có lỗi xảy ra khi xóa cộng đồng!');
        }
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) return;
    setIsUpdating(true);
    try {
      const payload = {
        ...editData,
        tags: typeof editData.tags === 'string' ? editData.tags.split(',').map(t => t.trim()).filter(Boolean) : editData.tags
      };
      const updated = await updateCommunity(id, payload);
      setCommunity(updated);
      setIsEditModalOpen(false);
      toast.success('Cập nhật cộng đồng thành công!');
    } catch (error) {
      console.error('Error updating community:', error);
      toast.error('Có lỗi xảy ra khi cập nhật!');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-400 py-20">Đang tải...</div>;
  }

  if (!community) {
    return <div className="p-6 text-center text-gray-400 py-20">Không tìm thấy cộng đồng</div>;
  }

  const isJoined = user?.joinedCommunities?.includes(community.id || '');
  const isAdmin = user?.id && community.creatorId && (community.creatorId === user.id || community.adminIds?.includes(user.id));
  
  const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>, idKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentImageInputs(prev => ({ ...prev, [idKey]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImagePreviews(prev => ({ ...prev, [idKey]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCommentImage = (idKey: string) => {
    setCommentImageInputs(prev => ({ ...prev, [idKey]: null }));
    setCommentImagePreviews(prev => ({ ...prev, [idKey]: '' }));
  };

  if (!isJoined && community?.visibility === 'PRIVATE' && !isAdmin) {
    return (
      <div className="p-6 text-center text-gray-400 py-20 flex flex-col items-center gap-4">
        <Shield className="w-16 h-16 text-gray-600" />
        <h2 className="text-2xl font-bold text-white">Cộng đồng riêng tư</h2>
        <p>Bạn không có quyền xem nội dung của cộng đồng này do bạn đã bị kích hoặc chưa tham gia.</p>
        <button 
          onClick={() => router.push('/communities')}
          className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-colors"
        >
          Quay lại Khám phá
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Cover Header */}
      <div className="h-64 relative group">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#03060a] via-[#03060a]/60 to-transparent z-10" />
          {community.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={community.cover} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${community.coverColor}`} />
          )}
        </div>
        
        {/* Header Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-blue-500/50 hover:text-blue-200 transition-colors"
                    title="Chỉnh sửa cộng đồng"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500/50 hover:text-red-200 transition-colors"
                    title="Xóa cộng đồng"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-end gap-6 translate-y-12">
            <div className="w-32 h-32 bg-[#080d14] rounded-3xl flex items-center justify-center text-6xl border-4 border-[#03060a] shadow-2xl shrink-0 overflow-hidden">
              {community.logo && community.logo.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={community.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                community.logo
              )}
            </div>
            <div className="pb-2 flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-white mb-1">{community.name}</h1>
                {community.slogan && (
                  <p className="text-emerald-400 font-semibold mb-2 italic">"{community.slogan}"</p>
                )}
                <p className="text-gray-300 max-w-2xl text-lg">{community.description}</p>
                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {community.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-6 py-2.5 rounded-xl font-bold">
                      <Settings className="w-5 h-5" /> Quản trị viên
                    </span>
                    <button 
                      onClick={() => setIsAdminModalOpen(true)}
                      className="flex items-center gap-2 bg-blue-500/10 backdrop-blur-md hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    >
                      <Users className="w-5 h-5" /> Quản lý
                    </button>
                    <button 
                      onClick={handleJoinLeave}
                      className="bg-black/50 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-4 py-2.5 rounded-xl transition-colors"
                      title="Rời cộng đồng"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : isJoined ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-2.5 rounded-xl font-bold">
                      <Shield className="w-5 h-5" /> Đã tham gia
                    </span>
                    <button 
                      onClick={handleJoinLeave}
                      className="bg-black/50 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-4 py-2.5 rounded-xl transition-colors"
                      title="Rời cộng đồng"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : isPendingJoin ? (
                  <button 
                    disabled
                    className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-6 py-3 rounded-xl font-bold"
                  >
                    Đang chờ duyệt...
                  </button>
                ) : (
                  <button 
                    onClick={handleJoinLeave}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#03060a] px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                  >
                    <Plus className="w-5 h-5" /> Tham gia
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Lời mời Admin */}
      {user?.adminInvites?.includes(id) && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-900/20 border border-blue-500/30 rounded-2xl p-5 mb-2 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-blue-50 font-bold text-lg">Lời mời Quản trị viên</h3>
                <p className="text-blue-200/80 text-sm mt-0.5">Bạn được mời làm Quản trị viên của cộng đồng này.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  try {
                    await acceptCommunityAdminInvite(id);
                    toast.success('Đã chấp nhận lời mời làm quản trị viên');
                    updateUser({ adminInvites: user.adminInvites?.filter(i => i !== id) });
                    setCommunity(prev => prev ? { ...prev, adminIds: [...(prev.adminIds || []), user.id] } : null);
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
                  }
                }}
                className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                Chấp nhận
              </button>
              <button 
                onClick={async () => {
                  try {
                    await rejectCommunityAdminInvite(id);
                    updateUser({ adminInvites: user.adminInvites?.filter(i => i !== id) });
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
                  }
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Post Composer */}
          <div className="bg-[#0f1923] border border-white/[0.05] rounded-3xl p-4 shadow-xl">
            <form onSubmit={handleCreatePost}>
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Avatar" className="w-12 h-12 rounded-full shrink-0 border border-white/10" />
                <div className="flex-1">
                  <textarea 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={isJoined ? "Bạn đang nghĩ gì?" : "Tham gia cộng đồng để đăng bài viết..."}
                    disabled={!isJoined || isPosting}
                    className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg min-h-[60px]"
                  />
                  {postImagePreview && (
                    <div className="relative mt-2 rounded-xl overflow-hidden">
                      <img src={postImagePreview} alt="Preview" className="max-h-[300px] w-auto object-contain" />
                      <button type="button" onClick={() => { setPostImage(null); setPostImagePreview(''); }} className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/80 text-white rounded-full">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div>
                      <input 
                        type="file" 
                        id="post-image" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPostImage(file);
                            setPostImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        disabled={!isJoined || isPosting}
                      />
                      <label htmlFor="post-image" className={`p-2 inline-flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer ${(!isJoined || isPosting) ? 'opacity-50 pointer-events-none' : ''}`}>
                        <ImageIcon className="w-5 h-5" />
                      </label>
                    </div>
                    <button 
                      type="submit"
                      disabled={!isJoined || (!postContent.trim() && !postImage) || isPosting}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-[#03060a] px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                      {isPosting ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                      Đăng
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          {isLoadingPosts ? (
            <div className="text-center py-10 text-gray-400">Đang tải bài viết...</div>
          ) : posts.length === 0 ? (
            <div className="bg-[#0f1923] border border-white/[0.05] rounded-3xl p-10 text-center shadow-xl">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-400">Hãy là người đầu tiên bắt đầu cuộc trò chuyện trong cộng đồng này!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post.id} className="bg-[#0f1923] border border-white/[0.05] rounded-3xl p-5 shadow-xl">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={post.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10" />
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {post.author.displayName}
                          <span className="bg-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">{post.author.levelTitle}</span>
                        </div>
                        <div className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</div>
                      </div>
                    </div>
                    {(isAdmin || post.author.username === user?.username) && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-gray-500 hover:text-red-400 p-2 transition-colors rounded-lg hover:bg-red-400/10"
                        title="Gỡ bài đăng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Post Content */}
                  <div className="cursor-pointer group" onClick={() => router.push(`/post/${post.id}`)}>
                    <p className="text-gray-200 mb-4 whitespace-pre-wrap group-hover:text-white transition-colors">{post.content}</p>
                    
                    {/* Post Image */}
                    {post.image && (
                      <div className="mb-4 rounded-2xl overflow-hidden border border-white/5">
                        <img src={post.image} alt="Post" className="w-full h-auto object-cover max-h-[500px]" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 py-3 border-y border-white/5 text-gray-400">
                    <ReactionButton
                      postId={post.id}
                      initialCount={post.likes}
                      initialReaction={post.isLiked ? 'like' : null}
                    />
                    <button 
                      onClick={() => {
                        if (activeCommentsPostId === post.id) {
                          setActiveCommentsPostId(null);
                        } else {
                          setActiveCommentsPostId(post.id);
                          if (!commentsMap[post.id]) loadComments(post.id);
                        }
                      }}
                      className={`flex items-center gap-2 hover:text-blue-400 transition-colors ${activeCommentsPostId === post.id ? 'text-blue-400' : ''}`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{post.comments}</span>
                    </button>
                    <button 
                      onClick={() => {
                        const url = `${window.location.origin}/post/${post.id}`;
                        navigator.clipboard.writeText(url).then(() => {
                          toast.success('Đã copy link bài viết');
                        }).catch(() => {
                          toast.error('Lỗi copy link');
                        });
                      }}
                      className="flex items-center gap-2 hover:text-white transition-colors ml-auto"
                    >
                      <Share className="w-5 h-5" />
                      <span className="font-medium hidden sm:inline">Chia sẻ</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {activeCommentsPostId === post.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          {/* Main Comment Input */}
                          {isJoined && (
                            <div className="flex flex-col gap-2 mb-6">
                              <div className="flex gap-3">
                                <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
                                <div className="flex-1 flex gap-2 items-center">
                                  <label className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5" />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCommentImageChange(e, post.id)} />
                                  </label>
                                  <input 
                                    type="text" 
                                    placeholder="Viết bình luận..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCreateComment(post.id);
                                    }}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                  />
                                  <button 
                                    onClick={() => handleCreateComment(post.id)}
                                    disabled={(!commentInputs[post.id]?.trim() && !commentImageInputs[post.id]) || isCommenting[post.id]}
                                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center"
                                  >
                                    {isCommenting[post.id] ? <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span> : <Send className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              {commentImagePreviews[post.id] && (
                                <div className="ml-11 relative inline-block w-32 h-32">
                                  <img src={commentImagePreviews[post.id]} alt="Preview" className="w-full h-full object-cover rounded-lg border border-white/10" />
                                  <button onClick={() => removeCommentImage(post.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Render Comments */}
                          <div className="space-y-4">
                            {commentsMap[post.id]?.length > 0 ? (
                              renderCommentsTree(commentsMap[post.id], post.id)
                            ) : (
                              <div className="text-center text-sm text-gray-500 py-4">Chưa có bình luận nào</div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[#0f1923] border border-white/[0.05] rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Giới thiệu</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-white">{community.memberCount || 0}</div>
                  <div className="text-xs text-gray-500">Thành viên</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-white">{community.postsToday || 0}</div>
                  <div className="text-xs text-gray-500">Bài viết hôm nay</div>
                </div>
              </div>
              {community.location && (
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{community.location}</div>
                    <div className="text-xs text-gray-500">Khu vực</div>
                  </div>
                </div>
              )}
              {community.website && (
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <a href={community.website} target="_blank" rel="noreferrer" className="font-bold text-purple-400 hover:underline">{community.website.replace(/^https?:\/\//, '')}</a>
                    <div className="text-xs text-gray-500">Website chính thức</div>
                  </div>
                </div>
              )}
            </div>

            {community.rules && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-emerald-500" /> Nội quy cộng đồng
                </h3>
                <div className="bg-[#1a242d] p-4 rounded-xl text-sm text-gray-300 whitespace-pre-line border border-emerald-500/10">
                  {community.rules}
                </div>
              </div>
            )}

            {community.socialLinks && Object.values(community.socialLinks).some(val => val) && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Liên kết mạng xã hội</h3>
                <div className="flex items-center gap-3">
                  {community.socialLinks.facebook && (
                    <a href={community.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 flex items-center justify-center text-white transition-colors" title="Facebook">
                      <Link className="w-5 h-5" />
                    </a>
                  )}
                  {community.socialLinks.instagram && (
                    <a href={community.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-pink-600 flex items-center justify-center text-white transition-colors" title="Instagram">
                      <Link className="w-5 h-5" />
                    </a>
                  )}
                  {community.socialLinks.youtube && (
                    <a href={community.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-600 flex items-center justify-center text-white transition-colors" title="Youtube">
                      <Link className="w-5 h-5" />
                    </a>
                  )}
                  {community.socialLinks.discord && (
                    <a href={community.socialLinks.discord} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-indigo-500 flex items-center justify-center text-white transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f1923] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">Chỉnh sửa Cộng Đồng</h2>
              
              <form onSubmit={handleUpdate} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tên cộng đồng</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={editData.name}
                      onChange={e => setEditData({...editData, name: e.target.value})}
                      className={`w-full bg-[#1a242d] border ${nameError ? 'border-red-500 focus:border-red-500' : 'border-white/5 focus:border-emerald-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                    />
                    {isCheckingName && (
                      <div className="absolute right-3 top-3">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {nameError && (
                     <p className="text-red-400 text-xs mt-1 font-medium">{nameError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Khẩu hiệu (Slogan)</label>
                  <input 
                    type="text" 
                    value={editData.slogan}
                    onChange={e => setEditData({...editData, slogan: e.target.value})}
                    className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả</label>
                  <textarea 
                    required
                    value={editData.description}
                    onChange={e => setEditData({...editData, description: e.target.value})}
                    className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Khu vực (Location)</label>
                  <input 
                    type="text" 
                    value={editData.location}
                    onChange={e => setEditData({...editData, location: e.target.value})}
                    className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="VD: Hà Nội, Hồ Chí Minh"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Danh mục</label>
                    <select 
                      value={editData.category}
                      onChange={e => setEditData({...editData, category: e.target.value})}
                      className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="Club">Câu lạc bộ</option>
                      <option value="National">Đội tuyển</option>
                      <option value="General">Chung</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Màu chủ đạo</label>
                    <input 
                      type="color" 
                      value={editData.themeColor}
                      onChange={e => setEditData({...editData, themeColor: e.target.value})}
                      className="w-full h-[50px] bg-[#1a242d] border border-white/5 rounded-xl px-2 py-1 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Ảnh Logo</label>
                    <div className="relative w-full bg-[#1a242d] border border-white/5 rounded-xl flex items-center justify-center p-2 min-h-[50px]">
                      {isUploadingLogo ? (
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      ) : editData.logo && editData.logo.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editData.logo} alt="Logo" className="w-10 h-10 object-cover rounded-md" />
                      ) : (
                        <span className="text-2xl">{editData.logo || '⚽'}</span>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Tải ảnh lên"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Ảnh Bìa (Cover)</label>
                    <div className="relative w-full bg-[#1a242d] border border-white/5 rounded-xl flex items-center justify-center p-2 min-h-[50px] overflow-hidden">
                      {isUploadingCover ? (
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      ) : editData.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editData.cover} alt="Cover" className="w-full h-full object-cover absolute inset-0 opacity-50" />
                      ) : (
                        <span className="text-xs text-gray-400">Chọn ảnh</span>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'cover')}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        title="Tải ảnh lên"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 mt-4">
                  <h3 className="text-white font-medium mb-3">Tùy chọn nâng cao</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editData.isPrivate}
                        onChange={e => setEditData({...editData, isPrivate: e.target.checked})}
                        className="w-4 h-4 rounded bg-[#1a242d] border-white/20 text-emerald-500 focus:ring-emerald-500/30"
                      />
                      <div>
                        <p className="text-sm text-white">Nhóm riêng tư</p>
                        <p className="text-xs text-gray-500">Chỉ thành viên mới xem được nội dung</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editData.requireApproval}
                        onChange={e => setEditData({...editData, requireApproval: e.target.checked})}
                        className="w-4 h-4 rounded bg-[#1a242d] border-white/20 text-emerald-500 focus:ring-emerald-500/30"
                      />
                      <div>
                        <p className="text-sm text-white">Duyệt thành viên</p>
                        <p className="text-xs text-gray-500">Admin cần phê duyệt người mới</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Mạng xã hội (Tuỳ chọn)</label>
                  <div className="space-y-2">
                    <input type="text" value={editData.socialLinks.facebook} onChange={e => setEditData({...editData, socialLinks: {...editData.socialLinks, facebook: e.target.value}})} placeholder="Link Facebook" className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 transition-colors" />
                    <input type="text" value={editData.socialLinks.discord} onChange={e => setEditData({...editData, socialLinks: {...editData.socialLinks, discord: e.target.value}})} placeholder="Link Discord" className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdating || !!nameError || isCheckingName}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed sticky bottom-0"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu Thay Đổi'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f1923] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-400" /> Quản lý cộng đồng
                </h2>
                <button 
                  onClick={() => setIsAdminModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex border-b border-white/5 px-6">
                <button 
                  onClick={() => setAdminTab('members')}
                  className={`py-4 px-4 font-semibold text-sm border-b-2 transition-colors ${adminTab === 'members' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  Thành viên ({membersList.length})
                </button>
                <button 
                  onClick={() => setAdminTab('requests')}
                  className={`py-4 px-4 font-semibold text-sm border-b-2 transition-colors ${adminTab === 'requests' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  Yêu cầu duyệt ({requestsList.length})
                </button>
                <button 
                  onClick={() => setAdminTab('invite')}
                  className={`py-4 px-4 font-semibold text-sm border-b-2 transition-colors ${adminTab === 'invite' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  Mời thành viên
                </button>
                {community.requirePostApproval && (
                  <button 
                    onClick={() => setAdminTab('posts')}
                    className={`py-4 px-4 font-semibold text-sm border-b-2 transition-colors ${adminTab === 'posts' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                  >
                    Kiểm duyệt bài ({pendingPosts.length})
                  </button>
                )}
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {adminTab === 'members' && (
                  <div className="space-y-4">
                    {/* Local Member Search */}
                    <div className="mb-6">
                      <input 
                        type="text" 
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Tìm kiếm thành viên trong cộng đồng..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    {membersList.filter(m => m.username.toLowerCase().includes(memberSearch.toLowerCase()) || (m as any).displayName?.toLowerCase().includes(memberSearch.toLowerCase())).length === 0 ? (
                      <div className="text-center text-gray-500 py-10">Chưa có thành viên nào hoặc không tìm thấy.</div>
                    ) : (
                      membersList
                        .filter(m => m.username.toLowerCase().includes(memberSearch.toLowerCase()) || (m as any).displayName?.toLowerCase().includes(memberSearch.toLowerCase()))
                        .map(member => (
                        <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl gap-4">
                          <div className="flex items-center gap-3">
                            <img src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} alt="Avatar" className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="text-white font-bold">{member.username}</p>
                              <p className="text-sm text-gray-400">
                                {community?.creatorId === member.id ? 'Người tạo' : community?.adminIds?.includes(member.id) ? 'Quản trị viên' : 'Thành viên'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {user?.id === member.id && (community?.creatorId === user.id || community?.adminIds?.includes(user.id)) && (
                              <button 
                                onClick={async () => {
                                  try {
                                    await resignCommunityAdmin(id);
                                    toast.success('Đã từ chức Quản trị viên');
                                    setIsAdminModalOpen(false);
                                    setCommunity(prev => prev ? { ...prev, adminIds: prev.adminIds?.filter(aId => aId !== user.id) } : null);
                                  } catch (err: any) {
                                    toast.error(err.response?.data?.message || 'Lỗi khi từ chức');
                                  }
                                }}
                                className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white border border-yellow-500/20 rounded-lg transition-colors text-sm font-bold"
                              >
                                Từ chức
                              </button>
                            )}

                            {community?.creatorId !== member.id && user?.id !== member.id && (
                              <>
                                {!community?.adminIds?.includes(member.id) && (
                                  <button 
                                    onClick={async () => {
                                      try {
                                        await promoteCommunityAdmin(id, member.id);
                                        toast.success('Đã gửi lời mời Quản trị viên');
                                      } catch (err: any) {
                                        toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded-lg transition-colors text-sm font-bold"
                                  >
                                    Phong QTV
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleKick(member.id)}
                                  className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-bold"
                                >
                                  Kick
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminTab === 'requests' && (
                  <div className="space-y-4">
                    {requestsList.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">Không có yêu cầu nào.</div>
                    ) : (
                      requestsList.map(req => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl gap-4">
                          <div className="flex items-center gap-3">
                            <img src={req.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.username}`} alt="Avatar" className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="text-white font-semibold">{req.displayName || req.username}</p>
                              <p className="text-xs text-gray-400">@{req.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleApprove(req.id)}
                              className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-emerald-500/30"
                            >
                              Duyệt
                            </button>
                            <button 
                              onClick={() => handleReject(req.id)}
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminTab === 'invite' && (
                  <div className="space-y-4">
                    <div className="mb-6">
                      <input 
                        type="text" 
                        value={inviteSearch}
                        onChange={(e) => setInviteSearch(e.target.value)}
                        placeholder="Tìm kiếm người dùng trong hệ thống..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    
                    {isSearchingUsers ? (
                      <div className="text-center text-gray-500 py-10">Đang tìm kiếm...</div>
                    ) : inviteSearch.trim().length > 0 && inviteSearchResults.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">Không tìm thấy người dùng nào phù hợp.</div>
                    ) : inviteSearchResults.length > 0 ? (
                      inviteSearchResults.map(u => {
                        const isAlreadyMember = membersList.some(m => m.id === u.id);
                        return (
                          <div key={u.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="Avatar" className="w-10 h-10 rounded-full" />
                              <div>
                                <p className="text-white font-bold">{u.username}</p>
                                <p className="text-sm text-gray-400">{(u as any).displayName || u.role}</p>
                              </div>
                            </div>
                            {isAlreadyMember ? (
                              <span className="px-3 py-1.5 text-gray-500 text-sm font-medium">Đã tham gia</span>
                            ) : (
                                <button 
                                  onClick={() => handleInvite(u.username)}
                                  disabled={isInviting}
                                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black rounded-lg transition-colors text-sm font-bold"
                                >
                                  Mời
                                </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-gray-500 py-10">Gõ từ khoá để tìm kiếm người dùng</div>
                    )}
                  </div>
                )}

                {adminTab === 'posts' && (
                  <div className="space-y-4">
                    {pendingPosts.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">Không có bài viết nào cần duyệt.</div>
                    ) : (
                      pendingPosts.map(post => (
                        <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <img src={post.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10" />
                            <div>
                              <div className="font-bold text-white">{post.author.displayName}</div>
                              <div className="text-xs text-gray-500">{new Date(post.createdAt || Date.now()).toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>
                          
                          {post.image && (
                            <div className="mb-4 rounded-xl overflow-hidden border border-white/5">
                              <img src={post.image} alt="Post" className="max-h-[300px] w-auto object-contain" />
                            </div>
                          )}

                          <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                            <button 
                              onClick={() => handleApprovePost(post.id)}
                              className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-2 rounded-xl font-bold transition-colors"
                            >
                              Duyệt bài
                            </button>
                            <button 
                              onClick={() => handleRejectPost(post.id)}
                              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-xl font-bold transition-colors"
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
