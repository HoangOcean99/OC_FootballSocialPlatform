'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Image as ImageIcon, Send, X, MoreHorizontal } from 'lucide-react';
import { fetchPostById, fetchPostComments, fetchCommunityDetails, createComment, deletePost, deleteComment, uploadImage } from '@/lib/api';
import { Post, Comment, Community } from '@football-fan/shared-types';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import PostActions from '@/components/PostActions';
import { io, Socket } from 'socket.io-client';
import { useImageModalStore } from '@/store/useImageModalStore';

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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('Home');
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentImageInputs, setCommentImageInputs] = useState<Record<string, File | null>>({});
  const [commentImagePreviews, setCommentImagePreviews] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; username: string } | null>(null);
  const [isCommenting, setIsCommenting] = useState<Record<string, boolean>>({});
  const { openModal } = useImageModalStore();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    fetchPostById(id)
      .then(p => {
        setPost(p);
        return fetchCommunityDetails(p.community.slug);
      })
      .then(c => {
        setCommunity(c);
        return fetchPostComments(id);
      })
      .then(setComments)
      .catch(err => {
        console.error(err);
        toast.error('Không tìm thấy bài viết');
      })
      .finally(() => setIsLoading(false));

  }, [id]);

  useEffect(() => {
    if (community?.id && user?.id) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
      socketRef.current = io(socketUrl);

      socketRef.current.on('connect', () => {
        socketRef.current?.emit('register', user.id);
      });

      socketRef.current.on('COMMUNITY_COMMENT_CREATED', (data: { communityId: string, comment: Comment }) => {
        if (data.communityId === community.id && data.comment.postId === id) {
          setComments(prev => {
            const addCommentToTree = (list: Comment[], newComment: Comment): Comment[] => {
              if (!newComment.parentId) {
                if (list.some(c => c.id === newComment.id)) return list;
                return [...list, newComment];
              }
              return list.map(c => {
                if (c.id === newComment.parentId) {
                  const existingReplies = c.replies || [];
                  if (existingReplies.some(r => r.id === newComment.id)) return c;
                  return { ...c, replies: [...existingReplies, newComment] };
                }
                if (c.replies) {
                  return { ...c, replies: addCommentToTree(c.replies, newComment) };
                }
                return c;
              });
            };
            return addCommentToTree(prev, data.comment);
          });
          setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : prev);
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [community?.id, user?.id, id]);

  const isJoined = community ? user?.joinedCommunities?.includes(community.id) : false;
  const isAdmin = community && user?.id && community.creatorId && (community.creatorId === user.id || community.adminIds?.includes(user.id));

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

  const handleCreateComment = async (postId: string, parentId?: string) => {
    const idKey = parentId || postId;
    const content = commentInputs[idKey];
    const image = commentImageInputs[idKey];
    
    if (!content?.trim() && !image) return;

    try {
      setIsCommenting(prev => ({ ...prev, [idKey]: true }));
      let imageUrl;
      if (image && community?.id) {
        imageUrl = await uploadImage(image, `communities/${community.id}/comments`);
      }
      
      const newComment = await createComment(postId, content, parentId, imageUrl);
      
      setComments(prev => {
        const addCommentToTree = (list: Comment[], comment: Comment): Comment[] => {
          if (!comment.parentId) {
            if (list.some(c => c.id === comment.id)) return list;
            return [...list, comment];
          }
          return list.map(c => {
            if (c.id === comment.parentId) {
              const existingReplies = c.replies || [];
              if (existingReplies.some(r => r.id === comment.id)) return c;
              return { ...c, replies: [...existingReplies, comment] };
            }
            if (c.replies) {
              return { ...c, replies: addCommentToTree(c.replies, comment) };
            }
            return c;
          });
        };
        return addCommentToTree(prev, newComment);
      });
      setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : prev);

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
      setIsCommenting(prev => ({ ...prev, [idKey]: false }));
      toast.error('Lỗi khi gửi bình luận');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Bạn có chắc chắn muốn gỡ bài đăng này?')) return;
    try {
      await deletePost(id);
      toast.success('Đã gỡ bài đăng');
      router.back();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gỡ bài đăng');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn gỡ bình luận này?')) return;
    try {
      await deleteComment(commentId);
      
      setComments(prev => {
        const removeCommentFromTree = (list: Comment[], cid: string): Comment[] => {
          return list.filter(c => c.id !== cid).map(c => {
            if (c.replies) {
              return { ...c, replies: removeCommentFromTree(c.replies, cid) };
            }
            return c;
          });
        };
        return removeCommentFromTree(prev, commentId);
      });
      setPost(prev => prev ? { ...prev, comments: Math.max(0, prev.comments - 1) } : prev);
      
      toast.success('Đã gỡ bình luận');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gỡ bình luận');
    }
  };

  const sharePost = () => {
    const url = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Đã copy link bài viết');
    }).catch(() => {
      toast.error('Lỗi copy link');
    });
  };

  const renderCommentsTree = (commentsList: Comment[]) => {
    return commentsList.map(comment => (
      <div key={comment.id} className="mt-3 first:mt-0">
        <div className="flex gap-3">
          <div className="relative shrink-0 w-8 h-8">
            <img 
              src={comment.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.username}`} 
              alt="Avatar" 
              className={`w-full h-full rounded-full border border-white/10 ${
                comment.author.purchasedItems?.includes('frame_dragon') ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : ''
              }`} 
            />
            {comment.author.purchasedItems?.includes('frame_dragon') && (
              <div className="absolute -inset-1 border border-amber-500/50 rounded-full animate-pulse pointer-events-none" />
            )}
          </div>
          <div className="flex-1">
            <div className="bg-white/5 rounded-2xl p-3 inline-block min-w-[120px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`font-bold text-sm ${
                  comment.author.purchasedItems?.includes('name_vip_red')
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] tracking-wide'
                    : 'text-white'
                }`}>
                  {comment.author.displayName}
                </span>
                {comment.author.purchasedItems?.includes('badge_wizard') && (
                  <span className="text-xs drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" title="Huy Hiệu Phù Thuỷ Dự Đoán">🌟</span>
                )}
              </div>
              {comment.content && <p className="text-gray-200 text-sm whitespace-pre-wrap">{comment.content}</p>}
              {comment.image && (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-[250px]">
                  <img 
                    src={comment.image} 
                    alt="Comment attachment" 
                    onClick={() => openModal(comment.image!)}
                    className="w-full h-auto object-contain bg-black/20 cursor-pointer hover:opacity-90 transition-opacity" 
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 ml-2 text-[11px] font-semibold text-gray-500">
              <span>{formatTimeAgo(comment.createdAt)}</span>
              {(isJoined || isAdmin) && (
                <button 
                  onClick={() => setReplyingTo({ postId: id, commentId: comment.id, username: comment.author.displayName })}
                  className="hover:text-gray-300 transition-colors"
                >
                  Trả lời
                </button>
              )}
              {(isAdmin || comment.author.username === user?.username) && (
                <button 
                  onClick={() => handleDeleteComment(comment.id)}
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
            {renderCommentsTree(comment.replies)}
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
                    if (e.key === 'Enter') handleCreateComment(id, comment.id);
                  }}
                  autoFocus
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={() => handleCreateComment(id, comment.id)}
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

  if (isLoading) {
    return <div className="min-h-screen pt-24 px-4 flex justify-center text-gray-400">Đang tải bài viết...</div>;
  }

  if (!post || !community) {
    return <div className="min-h-screen pt-24 px-4 flex justify-center text-gray-400">Không tìm thấy bài viết</div>;
  }

  const isPostAuthor = post.author.username === user?.username;

  return (
    <main className="min-h-screen pt-20 pb-12 px-4 bg-[#03060a]">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <article className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="relative shrink-0 w-10 h-10">
              <img 
                src={post.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`} 
                alt="Avatar" 
                className={`w-full h-full rounded-full border border-white/10 ${
                  post.author.purchasedItems?.includes('frame_dragon') ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''
                }`} 
              />
              {post.author.purchasedItems?.includes('frame_dragon') && (
                <div className="absolute -inset-1.5 border-2 border-amber-500/50 rounded-full animate-pulse pointer-events-none" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold ${
                      post.author.purchasedItems?.includes('name_vip_red')
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] tracking-wide'
                        : 'text-white'
                    }`}>
                      {post.author.displayName}
                    </span>
                    {post.author.purchasedItems?.includes('badge_wizard') && (
                      <span className="text-sm drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" title="Huy Hiệu Phù Thuỷ Dự Đoán">🌟</span>
                    )}
                    <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full">{post.author.levelTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm">{community.emoji}</span>
                    <span className="text-[12px] text-emerald-500 cursor-pointer transition-colors" onClick={() => router.push(`/communities/${community.slug}`)}>
                      {community.name}
                    </span>
                    <span className="text-gray-700">·</span>
                    <span className="text-[12px] text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
                {(isAdmin || isPostAuthor) && (
                  <button onClick={handleDeletePost} className="p-2 text-gray-500 hover:bg-white/10 hover:text-red-400 rounded-full transition-colors" title="Gỡ bài đăng">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-200 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
          {post.image && (
            <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
              <img 
                src={post.image} 
                alt="Post image" 
                onClick={() => openModal(post.image!)}
                className="w-full h-auto max-h-[500px] object-cover cursor-pointer hover:opacity-90 transition-opacity" 
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs text-sky-400 bg-sky-400/10 px-2 py-1 rounded-md">#{tag}</span>
              ))}
            </div>
          )}

          {/* Actions - Facebook style (includes summary row + buttons) */}
          <PostActions
            postId={post.id}
            initialCount={post.likes}
            initialReaction={post.myReaction ?? (post.isLiked ? 'like' : null)}
            initialReactionCounts={post.reactionCounts ?? {}}
          >
            {/* Comment count */}
            <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments}</span>
            </div>
            {/* Share */}
            <button
              onClick={sharePost}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-gray-200 hover:bg-white/[0.08] transition-all duration-200 ml-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Chia sẻ
            </button>
          </PostActions>

          {/* Comments Section */}
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
              {comments.length > 0 ? (
                renderCommentsTree(comments)
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">Chưa có bình luận nào</div>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
