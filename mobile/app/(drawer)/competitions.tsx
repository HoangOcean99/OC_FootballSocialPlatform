import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Trophy } from 'lucide-react-native';

const MOCK_COMPS = [
  { id: '1', name: 'Premier League', region: 'England' },
  { id: '2', name: 'La Liga', region: 'Spain' },
  { id: '3', name: 'Champions League', region: 'Europe' },
];

export default function CompetitionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#03060a]">
      <View className="flex-row items-center px-4 py-3 border-b border-white/10">
        <DrawerToggleButton tintColor="#fafafa" />
        <Text className="text-xl font-bold text-white ml-2">Giải đấu</Text>
      </View>
      
      <FlatList
        data={MOCK_COMPS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-row items-center p-4 border-b border-white/5 bg-[#080d14] m-2 rounded-xl border border-white/10">
            <View className="w-12 h-12 rounded-full bg-emerald-500/20 mr-4 items-center justify-center border border-emerald-500/30">
              <Trophy size={20} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{item.name}</Text>
              <Text className="text-zinc-500 text-sm mt-1">{item.region}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
