'use client';
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { ChatMessage } from '@football-fan/shared-types';
import { fetchCommunityMessages, sendCommunityMessage, uploadImage, fetchOnlineFriends } from '@/lib/api';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useImageModalStore } from '@/store/useImageModalStore';
import { useTranslations } from 'next-intl';

interface Props {
  communityId: string;
  isJoined: boolean;
  communityName?: string;
}

export default function CommunityChat({ communityId, isJoined, communityName }: Props) {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const { openModal } = useImageModalStore();
  const t = useTranslations('Communities');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!communityId) return;
    
    // Load initial messages
    fetchCommunityMessages(communityId, 50)
      .then(data => {
        setMessages(data);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      })
      .catch(err => {
        console.error('Failed to load messages', err);
        setLoading(false);
      });

    // Fetch online users
    const getOnlineUsers = async () => {
      try {
        const users = await fetchOnlineFriends();
        setOnlineUserIds(users.map((u: any) => u.id));
      } catch (err) {
        console.error('Failed to fetch online users', err);
      }
    };
    getOnlineUsers();
    const interval = setInterval(getOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, [communityId]);

  useEffect(() => {
    if (!socket || !communityId || !isJoined) return;

    // Join room
    socket.emit('joinCommunityChat', { communityId });

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setTimeout(scrollToBottom, 100);
    };

    socket.on('COMMUNITY_CHAT_MESSAGE', handleNewMessage);

    return () => {
      socket.emit('leaveCommunityChat', { communityId });
      socket.off('COMMUNITY_CHAT_MESSAGE', handleNewMessage);
    };
  }, [socket, communityId, isJoined]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;
    if (!isJoined) return;

    try {
      setIsSending(true);
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `communities/${communityId}/chat`);
      }
      
      const newMessage = await sendCommunityMessage(communityId, content, imageUrl);
      
      // If websocket is slow, optimistically add it? We are waiting for WS to broadcast.
      // But adding immediately is better UX.
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      
      setContent('');
      setImageFile(null);
      setImagePreview('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  if (!isJoined) {
    return (
      <div className="bg-[#0f1923] border border-white/[0.05] rounded-3xl p-10 text-center shadow-xl h-[500px] flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-white mb-2">{t('chat_room_title')}</h3>
        <p className="text-gray-400">{t('join_to_chat')}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1923] border border-white/[0.05] rounded-3xl flex flex-col shadow-xl h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {communityName && (
          <div className="text-center py-4 mb-2">
            <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-xs font-semibold inline-block border border-emerald-500/20">
              {t('chat_welcome', { name: communityName })}
            </span>
          </div>
        )}
        
        {loading ? (
          <div className="text-center text-gray-500 my-10">{t('loading_messages')}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 my-10">{t('no_messages')}</div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.author.id === user?.id;
            const showAvatar = !isMe && (index === 0 || messages[index - 1].author.id !== msg.author.id);
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                {!isMe && (
                  <div className="w-8 h-8 shrink-0 mr-2 relative">
                    {showAvatar && (
                      <>
                        <img 
                          src={msg.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.author.username}`} 
                          alt="Avatar" 
                          className={`w-full h-full rounded-full object-cover border border-white/10 ${
                            msg.author.purchasedItems?.includes('frame_dragon') ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : ''
                          }`} 
                        />
                        {msg.author.purchasedItems?.includes('frame_dragon') && (
                          <div className="absolute -inset-1 border border-amber-500/50 rounded-full animate-pulse pointer-events-none" />
                        )}
                        {onlineUserIds.includes(msg.author.id) && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0f1923]"></div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && showAvatar && (
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`text-xs font-bold ${
                        msg.author.purchasedItems?.includes('name_vip_red') 
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' 
                          : 'text-gray-400'
                      }`}>
                        {msg.author.displayName}
                      </span>
                      {msg.author.purchasedItems?.includes('badge_wizard') && (
                        <span className="text-[10px] drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] animate-pulse" title="Huy Hiệu Phù Thuỷ Dự Đoán">🌟</span>
                      )}
                    </div>
                  )}

                  <div className={`group relative px-4 py-2 rounded-2xl ${
                    isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'
                  }`}>
                    {msg.content && <p className="whitespace-pre-wrap text-sm break-words">{msg.content}</p>}
                    {msg.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                        <img 
                          src={msg.imageUrl} 
                          alt="Attachment" 
                          onClick={() => openModal(msg.imageUrl!)}
                          className="max-w-full max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                        />
                      </div>
                    )}
                    
                    {/* Timestamp tooltip on hover */}
                    <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] text-gray-400 bg-black/80 px-2 py-1 rounded-lg pointer-events-none z-10`}>
                      {new Date(msg.createdAt).toLocaleString('vi-VN', { 
                        hour: '2-digit', minute: '2-digit', 
                        day: '2-digit', month: '2-digit', year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-[#1a242d] rounded-b-3xl">
        {imagePreview && (
          <div className="mb-3 relative inline-block w-24 h-24">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg border border-white/10" />
            <button 
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(''); }} 
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <label className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <input 
            type="text" 
            placeholder="Nhắn tin vào phòng chat..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={(!content.trim() && !imageFile) || isSending}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center"
          >
            {isSending ? <span className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></span> : <Send className="w-6 h-6 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
