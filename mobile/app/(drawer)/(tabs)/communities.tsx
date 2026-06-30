import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Users, ChevronRight } from 'lucide-react-native';

const MOCK_COMMUNITIES = [
  { id: '1', name: 'Real Madrid Fans', members: '1.2M', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=100' },
  { id: '2', name: 'Premier League Hub', members: '850K', image: 'https://images.unsplash.com/photo-1518605368461-1e1e11894d07?w=100' },
  { id: '3', name: 'Tactics & Analysis', members: '120K', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100' }
];

export default function CommunitiesScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity className="flex-row items-center p-4 bg-card border-b border-border">
      <Image source={{ uri: item.image }} className="w-14 h-14 rounded-xl bg-border" />
      <View className="flex-1 ml-4">
        <Text className="text-foreground font-bold text-lg">{item.name}</Text>
        <Text className="text-zinc-500">{item.members} members</Text>
      </View>
      <TouchableOpacity className="bg-primary/20 px-4 py-2 rounded-full">
        <Text className="text-primary font-bold">Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-3 border-b border-border bg-card mb-2 flex-row justify-between items-center">
        <Text className="text-xl font-extrabold text-foreground tracking-tight">Communities</Text>
        <Users size={24} color="#71717a" />
      </View>
      
      <FlatList
        data={MOCK_COMMUNITIES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}
