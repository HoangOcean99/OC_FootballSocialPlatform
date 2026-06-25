'use client';

import { useEffect, useState, useRef } from 'react';
import { ChatUser, useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/components/providers/SocketProvider';
import { fetchPrivateMessages, sendPrivateMessage, markConversationAsRead, uploadImage } from '@/lib/api';
import { X, Minus, Send, Phone, Video, Info, Maximize2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useImageModalStore } from '@/store/useImageModalStore';
import { useTranslations } from 'next-intl';

export default function ChatBox({ user: chatUser }: { user: ChatUser }) {
  const t = useTranslations('Messages');
  const { user: currentUser } = useAuthStore();
  const { socket } = useSocket();
  const { closeChat, toggleMinimize, minimizedChats } = useChatStore();
  const router = useRouter();
  const { openModal } = useImageModalStore();

  const isMinimized = minimizedChats.includes(chatUser.id);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isMinimized) {
      loadMessages();
      setHasUnread(false);
    }
  }, [isMinimized]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data: any) => {
        if (data.senderId === chatUser.id || data.receiverId === chatUser.id) {
          setMessages(prev => [...prev, data]);
          if (isMinimized) {
            setHasUnread(true);
          } else {
            // Assume there's a conversation ID or we can just fetch again or let backend mark as read later
            // We just scroll
            setTimeout(scrollToBottom, 100);
          }
        }
      };
      
      socket.on('newPrivateMessage', handleNewMessage);
      return () => {
        socket.off('newPrivateMessage', handleNewMessage);
      };
    }
  }, [socket, chatUser.id, isMinimized]);

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [messages, isMinimized]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = await fetchPrivateMessages(chatUser.id);
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImageFile) return;

    try {
      setIsUploading(true);
      let imageUrl: string | undefined = undefined;

      if (selectedImageFile && currentUser?.id && chatUser.id) {
        const folderName = `chat_images/${[currentUser.id, chatUser.id].sort().join('_')}`;
        imageUrl = await uploadImage(selectedImageFile, folderName);
      }

      const tempMsg = {
        _id: Date.now().toString(),
        senderId: currentUser?.id,
        receiverId: chatUser.id,
        content: newMessage,
        imageUrl,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempMsg]);
      setNewMessage('');
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(scrollToBottom, 100);
      
      await sendPrivateMessage(chatUser.id, tempMsg.content, imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Click on minimized head
  if (isMinimized) {
    return (
      <div 
        onClick={() => toggleMinimize(chatUser.id)}
        className="relative w-12 h-12 cursor-pointer hover:scale-105 transition-transform shrink-0"
      >
        {chatUser.avatarUrl ? (
          <img src={chatUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover border-2 border-[#080d14] shadow-xl" />
        ) : (
          <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white border-2 border-[#080d14] shadow-xl">
            {chatUser.initials || chatUser.username?.charAt(0).toUpperCase()}
          </div>
        )}
        {hasUnread && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#080d14] z-10" />
        )}
      </div>
    );
  }

  return (
    <div className="w-[330px] h-[450px] flex flex-col bg-[#080d14] border border-white/[0.1] rounded-t-xl shadow-2xl overflow-hidden shadow-emerald-900/20">
      {/* Header */}
      <div className="h-12 bg-[#182330] border-b border-white/5 flex items-center px-2 gap-2 shrink-0 cursor-pointer" onClick={() => toggleMinimize(chatUser.id)}>
        <div className="relative w-8 h-8 shrink-0">
          {chatUser.avatarUrl ? (
            <img src={chatUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
              {chatUser.initials || chatUser.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#182330] rounded-full z-10" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-[14px] font-bold text-white truncate hover:underline">{chatUser.displayName || chatUser.username}</h3>
          <p className="text-[10px] text-gray-400 truncate leading-none">{t('active')}</p>
        </div>
        <div className="flex items-center gap-1 text-emerald-500">
          <button 
            onClick={(e) => { e.stopPropagation(); }} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <Video className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); closeChat(chatUser.id); }} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors ml-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin bg-[#080d14]">
        {loading ? (
          <div className="text-center text-xs text-gray-500 mt-4">Đang tải...</div>
        ) : messages.length === 0 ? (
          <div className="text-center flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">👋</div>
            <p className="text-xs">Gửi lời chào đến {chatUser.username}!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.senderId === currentUser?.id;
            return (
              <div key={msg._id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-2 group`}>
                <div className={`max-w-[65%] px-3 py-1.5 text-[14px] ${
                  isMine 
                    ? 'bg-emerald-600 text-white rounded-[18px] rounded-br-sm' 
                    : 'bg-[#182330] text-gray-100 rounded-[18px] rounded-bl-sm border border-white/[0.05]'
                }`}>
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Chat image" 
                      onClick={() => openModal(msg.imageUrl)}
                      className="max-w-full rounded-xl mb-1 object-cover cursor-pointer hover:opacity-90 transition-opacity max-h-[200px]"
                    />
                  )}
                  {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                </div>
                <span className={`text-[10px] text-gray-500 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'text-right' : 'text-left'}`}>
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 bg-[#080d14] border-t border-white/[0.06] flex flex-col relative">
        {/* Image Preview */}
        {selectedImagePreview && (
          <div className="absolute bottom-full left-0 mb-2 ml-2 bg-[#182330] p-2 rounded-xl border border-white/10 shadow-lg">
            <div className="relative">
              <img src={selectedImagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setSelectedImageFile(null);
                  setSelectedImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors shrink-0 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Aa"
            className="flex-1 bg-[#182330] rounded-full px-3 py-1.5 text-[14px] text-white focus:outline-none transition-all placeholder:text-gray-500 min-w-0"
          />
          
          {newMessage.trim() || selectedImageFile ? (
            <button
              type="submit"
              disabled={isUploading}
              className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors shrink-0 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => {
                const tempMsg = {
                  _id: Date.now().toString(),
                  senderId: currentUser?.id,
                  receiverId: chatUser.id,
                  content: '👍',
                  createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev, tempMsg]);
                setTimeout(scrollToBottom, 100);
                sendPrivateMessage(chatUser.id, '👍');
              }}
              className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors shrink-0"
            >
              <span className="text-[20px] leading-none">👍</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
