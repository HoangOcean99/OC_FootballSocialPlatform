import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react-native';

const MOCK_POSTS = [
  {
    id: '1',
    user: { name: 'Alex Johnson', handle: '@alexj', avatar: 'https://i.pravatar.cc/150?u=1' },
    content: 'What a game last night! Real Madrid showed why they are the kings of Europe. 👑⚽️',
    likes: 245,
    comments: 42,
    time: '2h ago'
  },
  {
    id: '2',
    user: { name: 'Sarah Connor', handle: '@sarahc', avatar: 'https://i.pravatar.cc/150?u=2' },
    content: 'Just bought my tickets for the derby this weekend. Who else is going? 🏟️🔥',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=800',
    likes: 890,
    comments: 120,
    time: '5h ago'
  },
  {
    id: '3',
    user: { name: 'Marcus Rashford Fan', handle: '@mufc_fan', avatar: 'https://i.pravatar.cc/150?u=3' },
    content: 'Ten Hag needs to change the tactics. The midfield is completely overrun every single game.',
    likes: 112,
    comments: 89,
    time: '1d ago'
  }
];

export default function FeedScreen() {
  const renderPost = ({ item }) => (
    <View className="bg-card border-b border-border p-4">
      {/* Post Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Image source={{ uri: item.user.avatar }} className="w-10 h-10 rounded-full bg-border" />
          <View className="ml-3">
            <Text className="text-foreground font-bold">{item.user.name}</Text>
            <Text className="text-zinc-500 text-sm">{item.user.handle} • {item.time}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={20} color="#71717a" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <Text className="text-foreground text-base leading-6 mb-3">{item.content}</Text>
      
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          className="w-full h-48 rounded-xl mb-3 bg-border" 
          resizeMode="cover"
        />
      )}

      {/* Post Actions */}
      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border/50">
        <TouchableOpacity className="flex-row items-center">
          <Heart size={20} color="#71717a" />
          <Text className="text-zinc-400 ml-2">{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center">
          <MessageCircle size={20} color="#71717a" />
          <Text className="text-zinc-400 ml-2">{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Share2 size={20} color="#71717a" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-border bg-card">
        <Text className="text-xl font-extrabold text-foreground tracking-tight">Feed</Text>
        <View className="w-8 h-8 bg-primary/20 rounded-full items-center justify-center">
          <Text className="text-primary font-bold">OC</Text>
        </View>
      </View>
      
      <FlatList
        data={MOCK_POSTS}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
