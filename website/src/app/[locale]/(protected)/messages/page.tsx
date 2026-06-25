'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/components/providers/SocketProvider';
import { fetchConversations, fetchPrivateMessages, sendPrivateMessage, markConversationAsRead, uploadImage } from '@/lib/api';
import { Send, User as UserIcon, ArrowLeft, Search, Phone, Video, Info, MoreHorizontal, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { formatTimeAgo } from '@/app/[locale]/(protected)/home/page';
import { useImageModalStore } from '@/store/useImageModalStore';
import { useTranslations } from 'next-intl';

export default function MessagesPage() {
  const t = useTranslations('Messages');
  const tCom = useTranslations('Communities');
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openModal } = useImageModalStore();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newPrivateMessage', (data: any) => {
        // If message belongs to active chat
        if (selectedChat && (data.senderId === selectedChat.otherUser._id || data.receiverId === selectedChat.otherUser._id)) {
          setMessages(prev => [...prev, data]);
          // Mark as read
          markConversationAsRead(selectedChat.id);
        } else {
          // Update unread count in conversations list
          loadConversations();
        }
      });
      return () => {
        socket.off('newPrivateMessage');
      };
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConv(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setSelectedChat(conv);
    setLoadingMessages(true);
    try {
      const msgs = await fetchPrivateMessages(conv.otherUser._id);
      setMessages(msgs);
      
      if (conv.unreadCount > 0) {
        // Refresh conversations to clear unread badge
        loadConversations();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImageFile) return;
    if (!selectedChat) return;

    try {
      setIsUploading(true);
      let imageUrl: string | undefined = undefined;

      if (selectedImageFile && user?.id && selectedChat?.otherUser?._id) {
        const folderName = `chat_images/${[user.id, selectedChat.otherUser._id].sort().join('_')}`;
        imageUrl = await uploadImage(selectedImageFile, folderName);
      }

      // Optimistic update
      const tempMsg = {
        _id: Date.now().toString(),
        senderId: user?.id,
        receiverId: selectedChat.otherUser._id,
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
      
      await sendPrivateMessage(selectedChat.otherUser._id, tempMsg.content, imageUrl);
      loadConversations();
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

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-[#080d14]">
      {/* Sidebar - Inbox List */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-white/[0.06] ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">{t('title')}</h1>
          <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#182330] rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loadingConv ? (
            <div className="p-4 text-center text-gray-500">{t('loading')}</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>{t('no_conversations')}</p>
            </div>
          ) : (
            conversations.filter(c => 
              c.otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              c.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((conv) => (
              <div 
                key={conv.id} 
                onClick={() => selectConversation(conv)}
                className={`px-2 py-1 mx-2 mb-1 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/[0.04] transition-colors ${selectedChat?.id === conv.id ? 'bg-white/[0.08]' : ''}`}
              >
                <div className="relative w-14 h-14 shrink-0">
                  {conv.otherUser?.avatarUrl ? (
                    <img src={conv.otherUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                      {conv.otherUser?.initials || conv.otherUser?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Mock Online Indicator */}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#080d14] rounded-full z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] truncate ${conv.unreadCount > 0 ? 'font-bold text-white' : 'font-semibold text-gray-200'}`}>
                    {conv.otherUser?.displayName || conv.otherUser?.username}
                  </p>
                  <div className="flex items-center text-[13px] mt-0.5">
                    <p className={`truncate ${conv.unreadCount > 0 ? 'font-bold text-white' : 'text-gray-400'}`}>
                      {conv.lastMessage?.senderId === user?.id ? t('you') + ': ' : ''}
                      {conv.lastMessage?.imageUrl ? t('sent_a_photo') : (conv.lastMessage?.content || t('no_messages'))}
                    </p>
                    {conv.lastMessage && (
                      <span className="shrink-0 ml-1 text-gray-500">
                        • {formatTimeAgo(conv.updatedAt, tCom)}
                      </span>
                    )}
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 ml-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-white/[0.06] flex items-center px-4 justify-between bg-[#080d14] shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 -ml-2 text-emerald-500 hover:bg-white/5 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative w-10 h-10 shrink-0 cursor-pointer">
                  {selectedChat.otherUser?.avatarUrl ? (
                    <img src={selectedChat.otherUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                      {selectedChat.otherUser?.initials || selectedChat.otherUser?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#080d14] rounded-full z-10" />
                </div>
                <div className="cursor-pointer">
                  <h2 className="text-[15px] font-bold text-white hover:underline">{selectedChat.otherUser?.displayName || selectedChat.otherUser?.username}</h2>
                  <p className="text-xs text-gray-400">{t('active')}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-emerald-500">
                <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-emerald-500 hidden sm:block">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {loadingMessages ? (
                <div className="text-center text-gray-500 mt-4">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <p>Hãy gửi lời chào đến {selectedChat.otherUser?.username}!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.senderId === user?.id;
                  const showAvatar = !isMine && (index === messages.length - 1 || messages[index + 1]?.senderId === user?.id);
                  
                  return (
                    <div key={msg._id || index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-3 group`}>
                      <div className={`flex ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end max-w-full`}>
                        {!isMine && (
                          <div className="w-8 shrink-0 mr-2 pb-1">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                                {selectedChat.otherUser?.avatarUrl ? (
                                  <img src={selectedChat.otherUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  selectedChat.otherUser?.initials || selectedChat.otherUser?.username?.charAt(0).toUpperCase()
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-[65%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div 
                            className={`px-4 py-2 text-[15px] ${
                              isMine 
                                ? 'bg-emerald-600 text-white rounded-[20px] rounded-br-sm' 
                                : 'bg-[#182330] text-gray-100 rounded-[20px] rounded-bl-sm'
                            }`}
                          >
                            {msg.imageUrl && (
                              <img 
                                src={msg.imageUrl} 
                                alt="Chat image" 
                                onClick={() => openModal(msg.imageUrl)}
                                className="max-w-full rounded-xl mb-1 object-cover max-h-[300px] cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            )}
                            {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] text-gray-500 mt-1 px-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'text-right' : 'text-left ml-10'}`}>
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-[#080d14] border-t border-white/[0.06] flex flex-col relative">
              {/* Image Preview */}
              {selectedImagePreview && (
                <div className="absolute bottom-full left-4 mb-2 bg-[#182330] p-3 rounded-2xl border border-white/10 shadow-2xl">
                  <div className="relative">
                    <img src={selectedImagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageFile(null);
                        setSelectedImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-lg"
                    >
                      <X className="w-4 h-4" />
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
                  className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors shrink-0 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Aa"
                  className="flex-1 bg-[#182330] rounded-full px-4 py-2 text-[15px] text-white focus:outline-none transition-all placeholder:text-gray-500 min-w-0"
                />
                
                {newMessage.trim() || selectedImageFile ? (
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => {
                      const tempMsg = {
                        _id: Date.now().toString(),
                        senderId: user?.id,
                        receiverId: selectedChat.otherUser._id,
                        content: '👍',
                        createdAt: new Date().toISOString(),
                      };
                      setMessages(prev => [...prev, tempMsg]);
                      setTimeout(scrollToBottom, 100);
                      sendPrivateMessage(selectedChat.otherUser._id, '👍');
                      loadConversations();
                    }}
                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors shrink-0"
                  >
                    <span className="text-[24px]">👍</span>
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
              <UserIcon className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-lg font-medium text-gray-400">{t('select_conversation')}</p>
            <p className="text-sm mt-2 max-w-sm text-center">
              {t('select_conversation_desc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
