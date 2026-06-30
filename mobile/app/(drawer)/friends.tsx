import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { UserPlus, UserCheck } from 'lucide-react-native';

const MOCK_FRIENDS = [
  { id: '1', name: 'Nguyễn Văn B', status: 'Online' },
  { id: '2', name: 'Trần Thị C', status: 'Offline' },
];

export default function FriendsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#03060a]">
      <View className="flex-row items-center px-4 py-3 border-b border-white/10">
        <DrawerToggleButton tintColor="#fafafa" />
        <Text className="text-xl font-bold text-white ml-2">Bạn bè</Text>
      </View>
      
      <FlatList
        data={MOCK_FRIENDS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center p-4 border-b border-white/5">
            <View className="w-12 h-12 rounded-full bg-zinc-800 mr-4 items-center justify-center">
              <Text className="text-zinc-400 font-bold">{item.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">{item.name}</Text>
              <Text className={item.status === 'Online' ? "text-emerald-400 text-sm mt-1" : "text-zinc-500 text-sm mt-1"}>
                {item.status}
              </Text>
            </View>
            <TouchableOpacity className="p-2 bg-white/10 rounded-full">
              {item.status === 'Online' ? <UserCheck size={20} color="#10b981" /> : <UserPlus size={20} color="#fafafa" />}
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
