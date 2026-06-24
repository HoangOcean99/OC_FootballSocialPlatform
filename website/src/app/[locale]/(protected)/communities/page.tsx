'use client';
import { useEffect, useState } from 'react';
import { Users, Shield, MessageSquare, TrendingUp, Plus, X, Search, Filter, Edit2, Trash2, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllCommunities, createCommunity, joinCommunity, leaveCommunity, checkCommunityName, updateCommunity, deleteCommunity, batchDeleteCommunities, uploadImage, fetchUserProfile, fetchMyInvites, acceptCommunityInvite, rejectCommunityInvite } from '@/lib/api';
import { Community } from '@football-fan/shared-types';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useSocket } from '@/components/providers/SocketProvider';
import { useTranslations } from 'next-intl';

const MySwal = withReactContent(Swal);

export default function CommunitiesPage() {
  const t = useTranslations('Communities');
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { socket } = useSocket();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [invites, setInvites] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'joined' | 'invites' | 'admin'>('discover');
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Create Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState('');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [formData, setFormData] = useState({
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
    themeColor: '#10b981',
    socialLinks: { facebook: '', discord: '', instagram: '', youtube: '' }
  });

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editId, setEditId] = useState('');
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
    themeColor: '#10b981',
    socialLinks: { facebook: '', discord: '', instagram: '', youtube: '' }
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Helper to handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'cover', isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'logo') setIsUploadingLogo(true);
    else setIsUploadingCover(true);

    try {
      const folder = field === 'logo' ? 'communities/logos' : 'communities/covers';
      const url = await uploadImage(file, folder);
      if (isEdit) {
        setEditData(prev => ({ ...prev, [field]: url }));
      } else {
        setFormData(prev => ({ ...prev, [field]: url }));
      }
      toast.success('Tải ảnh lên thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      if (field === 'logo') setIsUploadingLogo(false);
      else setIsUploadingCover(false);
    }
  };

  // Batch Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce check name for Create
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.name.trim().length > 2) {
        setIsCheckingName(true);
        try {
          const res = await checkCommunityName(formData.name.trim());
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
  }, [formData.name]);

  // Debounce check name for Edit
  useEffect(() => {
    const timer = setTimeout(async () => {
      const originalName = communities.find(c => c.id === editId)?.name;
      if (editData.name.trim().length > 2 && editData.name !== originalName) {
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
  }, [editData.name, editId, communities]);

  useEffect(() => {
    fetchAllCommunities()
      .then(setCommunities)
      .catch(console.error)
      .finally(() => setLoading(false));

    if (user?.username) {
      fetchUserProfile(user.username).then((data) => {
        if (data && data.joinedCommunities) {
          updateUser({ joinedCommunities: data.joinedCommunities });
        }
      }).catch(console.error);

      fetchMyInvites().then(setInvites).catch(console.error);
    }
  }, [user?.username]);

  // WebSocket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleKicked = (data: { communityId: string }) => {
      if (user?.joinedCommunities?.includes(data.communityId)) {
        updateUser({ joinedCommunities: user.joinedCommunities.filter(id => id !== data.communityId) });
        setCommunities(prev => prev.map(c => c.id === data.communityId ? { ...c, memberCount: Math.max(0, (c.memberCount || 0) - 1) } : c));
        toast.error('Bạn đã bị kick khỏi một cộng đồng!', { icon: '🚪' });
      }
    };

    const handleInviteReceived = (data: { communityId: string, communityName: string }) => {
      fetchMyInvites().then(setInvites);
      toast.success(`Bạn nhận được lời mời tham gia cộng đồng ${data.communityName}!`, { icon: '✉️' });
    };

    socket.on('COMMUNITY_KICKED', handleKicked);
    socket.on('COMMUNITY_INVITE_RECEIVED', handleInviteReceived);

    return () => {
      socket.off('COMMUNITY_KICKED', handleKicked);
      socket.off('COMMUNITY_INVITE_RECEIVED', handleInviteReceived);
    };
  }, [socket, user, updateUser]);

  const handleAcceptInvite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await acceptCommunityInvite(id);
      setInvites(prev => prev.filter(c => c.id !== id));
      if (user) updateUser({ joinedCommunities: [...(user.joinedCommunities || []), id] });
      toast.success(t('join_success'));
    } catch (err) { toast.error('Có lỗi xảy ra!'); }
  };

  const handleRejectInvite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await rejectCommunityInvite(id);
      setInvites(prev => prev.filter(c => c.id !== id));
      toast.success('Đã từ chối lời mời');
    } catch (err) { toast.error('Có lỗi xảy ra!'); }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) return;
    setIsCreating(true);
    try {
      const payload = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : formData.tags
      };
      const newCommunity = await createCommunity(payload);
      const updatedCommunities = await fetchAllCommunities();
      setCommunities(updatedCommunities);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', category: 'General', logo: '⚽', cover: '', coverColor: 'from-emerald-500 to-teal-700', slogan: '', rules: '', tags: '', location: '', website: '', isPrivate: false, requireApproval: false, themeColor: '#10b981', socialLinks: { facebook: '', discord: '', instagram: '', youtube: '' } });
      if (user) updateUser({ joinedCommunities: [...(user.joinedCommunities || []), newCommunity.id] });
      toast.success('Tạo cộng đồng thành công!');
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Có lỗi xảy ra khi tạo cộng đồng!');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) return;
    setIsUpdating(true);
    try {
      const payload = {
        ...editData,
        tags: typeof editData.tags === 'string' ? editData.tags.split(',').map(t => t.trim()).filter(Boolean) : editData.tags
      };
      await updateCommunity(editId, payload);
      const updatedCommunities = await fetchAllCommunities();
      setCommunities(updatedCommunities);
      setIsEditModalOpen(false);
      toast.success('Cập nhật cộng đồng thành công!');
    } catch (error) {
      console.error('Error updating community:', error);
      toast.error('Có lỗi xảy ra khi cập nhật cộng đồng!');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCommunity = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
          setCommunities(prev => prev.filter(c => c.id !== id));
          setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
          toast.success('Xóa cộng đồng thành công!');
        } catch (error) {
          console.error('Error deleting community:', error);
          toast.error('Có lỗi xảy ra khi xóa cộng đồng!');
        }
      }
    });
  };

  const handleBatchDelete = async () => {
    MySwal.fire({
      title: 'Xóa hàng loạt',
      text: `Bạn có chắc chắn muốn xóa ${selectedIds.length} cộng đồng đã chọn không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Có, xóa tất cả!',
      cancelButtonText: 'Hủy',
      background: '#0f1923',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsDeleting(true);
        try {
          await batchDeleteCommunities(selectedIds);
          setCommunities(prev => prev.filter(c => !selectedIds.includes(c.id || '')));
          setSelectedIds([]);
          toast.success('Xóa hàng loạt thành công!');
        } catch (error) {
          console.error('Error batch deleting communities:', error);
          toast.error('Có lỗi xảy ra khi xóa cộng đồng!');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleJoinLeave = async (e: React.MouseEvent, communityId: string) => {
    e.stopPropagation();
    if (!user) return;
    
    const isJoined = user.joinedCommunities?.includes(communityId);
    try {
      if (isJoined) {
        const res = await leaveCommunity(communityId);
        if (res.success) {
          updateUser({ joinedCommunities: res.joinedCommunities });
          setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, memberCount: Math.max(0, (c.memberCount || 0) - 1) } : c));
        }
      } else {
        const res = await joinCommunity(communityId);
        if (res.success) {
          updateUser({ joinedCommunities: res.joinedCommunities });
          setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, memberCount: (c.memberCount || 0) + 1 } : c));
        }
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error);
    }
  };

  // Grouping logic
  const filteredCommunities = communities.filter(c => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(searchLower) || 
      (c.description || '').toLowerCase().includes(searchLower) ||
      (c.slogan || '').toLowerCase().includes(searchLower) ||
      (c.location || '').toLowerCase().includes(searchLower);
      
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const isUserAdmin = (c: Community) => user?.id && (c.creatorId === user.id || c.adminIds?.includes(user.id));
  
  const adminCommunities = filteredCommunities.filter(c => isUserAdmin(c));
  const joinedCommunities = filteredCommunities.filter(c => user?.joinedCommunities?.includes(c.id || '') && !isUserAdmin(c));
  const discoverCommunities = filteredCommunities.filter(c => !user?.joinedCommunities?.includes(c.id || '') && !isUserAdmin(c) && !c.isPrivate);

  const renderCommunityList = (list: Community[]) => {
    if (list.length === 0) {
      return <div className="col-span-full text-center text-gray-400 py-10 bg-white/5 rounded-2xl border border-white/10 border-dashed">{t('no_communities')}</div>;
    }
    return list.map((community, i) => {
      const isJoined = user?.joinedCommunities?.includes(community.id || '');
      const isCreator = user?.id && (community.creatorId === user.id || community.adminIds?.includes(user.id));
      const isSelected = selectedIds.includes(community.id || '');
      
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          key={community.id} 
          onClick={() => router.push(`/communities/${community.id}`)}
          className={`group relative bg-[#0f1923] border ${isSelected ? 'border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'border-white/[0.05] hover:border-emerald-500/30'} rounded-3xl overflow-hidden transition-all cursor-pointer shadow-xl`}
        >
          {isCreator && activeTab === 'admin' && (
            <div 
              className="absolute top-4 left-4 z-30"
              onClick={(e) => {
                e.stopPropagation();
                if (isSelected) {
                  setSelectedIds(prev => prev.filter(id => id !== community.id));
                } else {
                  setSelectedIds(prev => [...prev, community.id || '']);
                }
              }}
            >
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 bg-black/50 backdrop-blur-md hover:border-emerald-400'}`}>
                {isSelected && <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
              </div>
            </div>
          )}

          {/* Cover */}
          <div className="h-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-transparent to-transparent z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {community.cover ? (
              <img src={community.cover} alt="Cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${community.coverColor}`} />
            )}
            
            <div className="absolute top-3 right-3 z-20 flex gap-2">
              {isCreator && activeTab === 'admin' && (
                <>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditId(community.id || ''); 
                      setEditData({ 
                        name: community.name, 
                        description: community.description, 
                        category: community.category, 
                        logo: community.logo,
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
                      setIsEditModalOpen(true); 
                    }}
                    className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-blue-500/90 transition-all border border-white/10"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteCommunity(community.id || '', e)}
                    className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500/90 transition-all border border-white/10"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 pt-0 relative">
            <div className="flex justify-between items-end mb-3">
              <div className="w-16 h-16 bg-[#080d14] rounded-2xl flex items-center justify-center text-3xl border-2 border-[#0f1923] shadow-xl relative z-20 -mt-8 overflow-hidden">
                {community.logo && community.logo.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={community.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  community.logo
                )}
              </div>
              
              {/* Badge based on tab */}
              <div className="relative z-20">
                {activeTab === 'invites' ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleAcceptInvite(e, community.id || '')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                    >
                      Chấp nhận
                    </button>
                    <button 
                      onClick={(e) => handleRejectInvite(e, community.id || '')}
                      className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                    >
                      Từ chối
                    </button>
                  </div>
                ) : isCreator ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">
                      <Settings className="w-3 h-3" /> {t('admin_btn')}
                    </span>
                    <button 
                      onClick={(e) => handleJoinLeave(e, community.id || '')}
                      className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
                      title={t('leave_btn')}
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                ) : isJoined ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
                      <Shield className="w-3 h-3" /> {t('joined_status')}
                    </span>
                    <button 
                      onClick={(e) => handleJoinLeave(e, community.id || '')}
                      className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
                      title={t('leave_btn')}
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => handleJoinLeave(e, community.id || '')}
                    className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white hover:bg-emerald-500 hover:text-black transition-colors"
                  >
                    <Plus className="w-3 h-3" /> {t('join_btn')}
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{community.name}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{community.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-300">{community.members || community.memberCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-300">{community.posts || community.postsToday || 0}{t('per_day')}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#0f1923] to-transparent p-6 rounded-3xl border border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            {t('title').replace('👥 ', '')}
          </h1>
          <p className="text-gray-400 text-sm">{t('subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-[#03060a] px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-400 transition-colors w-full md:w-auto flex justify-center items-center gap-2"
        >
          {t('create_btn').replace('+ ', '')} <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-px overflow-x-auto scrollbar-none">
        {[
          { id: 'discover', label: t('tab_discover') },
          { id: 'joined', label: t('tab_joined') },
          { id: 'invites', label: t('tab_invites') },
          { id: 'admin', label: t('tab_admin') }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 border-b-2 text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            {tab.label}
            {tab.id === 'invites' && invites.length > 0 && (
              <span className="bg-emerald-500 text-[#03060a] text-[10px] px-1.5 py-0.5 rounded-md">{invites.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-[#0f1923] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-48 bg-[#0f1923] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="All">{t('tab_all')}</option>
              <option value="Club">{t('tab_teams')}</option>
              <option value="National">{t('tab_competitions')}</option>
              <option value="General">{t('tab_fanmade')}</option>
            </select>
          </div>
        </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-400 py-10">Đang tải...</div>
        ) : (
          activeTab === 'discover' ? renderCommunityList(discoverCommunities) :
          activeTab === 'joined' ? renderCommunityList(joinedCommunities) :
          activeTab === 'invites' ? renderCommunityList(invites) :
          renderCommunityList(adminCommunities)
        )}
      </div>

      {/* Batch Delete Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#0f1923] border border-white/10 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6"
          >
            <span className="text-white font-medium">Đã chọn {selectedIds.length} cộng đồng</span>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-5 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                {isDeleting ? 'Đang xóa...' : (
                  <>
                    <Trash2 className="w-4 h-4" /> Xóa hàng loạt
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-6">{t('create_title')}</h2>
              
              <form onSubmit={handleCreateCommunity} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_name')}</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className={`w-full bg-[#1a242d] border ${nameError ? 'border-red-500 focus:border-red-500' : 'border-white/5 focus:border-emerald-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                      placeholder={t('create_name_ph')}
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_slogan')}</label>
                  <input 
                    type="text" 
                    value={formData.slogan}
                    onChange={e => setFormData({...formData, slogan: e.target.value})}
                    className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder={t('create_slogan_ph')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_desc')}</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors h-24 resize-none"
                    placeholder={t('create_desc_ph')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_location')}</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder={t('create_location_ph')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_category')}</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="Club">{t('tab_teams')}</option>
                      <option value="National">{t('tab_competitions')}</option>
                      <option value="General">{t('tab_fanmade')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_color')}</label>
                    <input 
                      type="color" 
                      value={formData.themeColor}
                      onChange={e => setFormData({...formData, themeColor: e.target.value})}
                      className="w-full h-[50px] bg-[#1a242d] border border-white/5 rounded-xl px-2 py-1 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_logo')}</label>
                    <div className="relative w-full bg-[#1a242d] border border-white/5 rounded-xl flex items-center justify-center p-2 min-h-[50px]">
                      {isUploadingLogo ? (
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      ) : formData.logo && formData.logo.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.logo} alt="Logo" className="w-10 h-10 object-cover rounded-md" />
                      ) : (
                        <span className="text-2xl">{formData.logo || '⚽'}</span>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo', false)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Tải ảnh lên"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('create_upload_tip')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_cover')}</label>
                    <div className="relative w-full bg-[#1a242d] border border-white/5 rounded-xl flex items-center justify-center p-2 min-h-[50px] overflow-hidden">
                      {isUploadingCover ? (
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      ) : formData.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.cover} alt="Cover" className="w-full h-full object-cover absolute inset-0 opacity-50" />
                      ) : (
                        <span className="text-xs text-gray-400">{t('create_select_photo')}</span>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'cover', false)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        title="Tải ảnh lên"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 mt-4">
                  <h3 className="text-white font-medium mb-3">{t('create_advanced')}</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isPrivate}
                        onChange={e => setFormData({...formData, isPrivate: e.target.checked})}
                        className="w-4 h-4 rounded bg-[#1a242d] border-white/20 text-emerald-500 focus:ring-emerald-500/30"
                      />
                      <div>
                        <p className="text-sm text-white">{t('create_private_label')}</p>
                        <p className="text-xs text-gray-500">{t('create_private_desc')}</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.requireApproval}
                        onChange={e => setFormData({...formData, requireApproval: e.target.checked})}
                        className="w-4 h-4 rounded bg-[#1a242d] border-white/20 text-emerald-500 focus:ring-emerald-500/30"
                      />
                      <div>
                        <p className="text-sm text-white">{t('create_approval_label')}</p>
                        <p className="text-xs text-gray-500">{t('create_approval_desc')}</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('create_social')}</label>
                  <div className="space-y-2">
                    <input type="text" value={formData.socialLinks.facebook} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, facebook: e.target.value}})} placeholder={t('link_fb')} className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 transition-colors" />
                    <input type="text" value={formData.socialLinks.discord} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, discord: e.target.value}})} placeholder={t('link_discord')} className="w-full bg-[#1a242d] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isCreating || !!nameError || isCheckingName}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-bold py-3.5 rounded-xl transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed sticky bottom-0"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#03060a] border-t-transparent rounded-full animate-spin" />
                      {t('create_loading')}
                    </>
                  ) : (
                    t('create_btn')
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              
              <form onSubmit={handleUpdateCommunity} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
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
                        onChange={(e) => handleImageUpload(e, 'logo', true)}
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
                        onChange={(e) => handleImageUpload(e, 'cover', true)}
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
    </div>
  );
}
