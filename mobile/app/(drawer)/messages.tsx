import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';

const MOCK_CHATS = [
  { id: '1', name: 'Real Madrid Fan Club', lastMessage: 'Hala Madrid! Trận tối nay ai xem không?', time: '10:30' },
  { id: '2', name: 'Nguyễn Văn A', lastMessage: 'Bạn có vé xem chung kết chưa?', time: 'Hôm qua' },
  { id: '3', name: 'Nhóm Dự đoán Tỷ số', lastMessage: 'Tôi vừa đặt cược vào Man City', time: 'Hôm qua' },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#03060a]">
      <View className="flex-row items-center px-4 py-3 border-b border-white/10">
        <DrawerToggleButton tintColor="#fafafa" />
        <Text className="text-xl font-bold text-white ml-2">Tin nhắn</Text>
      </View>
      
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-row items-center p-4 border-b border-white/5">
            <View className="w-12 h-12 rounded-full bg-emerald-500/20 mr-4 items-center justify-center">
              <Text className="text-emerald-400 font-bold">{item.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">{item.name}</Text>
              <Text className="text-zinc-400 text-sm mt-1" numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text className="text-zinc-500 text-xs">{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
