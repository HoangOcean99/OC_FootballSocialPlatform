import React from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon, Clock } from 'lucide-react-native';

const MOCK_MATCHES = [
  {
    id: '1',
    homeTeam: 'Man United',
    awayTeam: 'Arsenal',
    homeScore: 1,
    awayScore: 2,
    status: 'LIVE',
    time: '75\''
  },
  {
    id: '2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 0,
    awayScore: 0,
    status: 'Upcoming',
    time: '20:00'
  },
  {
    id: '3',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Dortmund',
    homeScore: 3,
    awayScore: 1,
    status: 'FT',
    time: 'Yesterday'
  }
];

export default function MatchesScreen() {
  const renderMatch = ({ item }) => (
    <TouchableOpacity className="bg-card border border-border rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          {item.status === 'LIVE' ? (
            <View className="bg-danger/20 px-2 py-1 rounded-md flex-row items-center">
              <View className="w-2 h-2 bg-danger rounded-full mr-2" />
              <Text className="text-danger font-bold text-xs">{item.time}</Text>
            </View>
          ) : (
            <Text className="text-zinc-500 font-medium text-sm">{item.status} • {item.time}</Text>
          )}
        </View>
        <Clock size={16} color="#71717a" />
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-1 items-end pr-4">
          <Text className="text-foreground font-bold text-lg">{item.homeTeam}</Text>
        </View>
        
        <View className="bg-background border border-border px-4 py-2 rounded-lg">
          {item.status === 'Upcoming' ? (
            <Text className="text-foreground font-bold text-lg">- : -</Text>
          ) : (
            <Text className="text-primary font-bold text-xl">{item.homeScore} - {item.awayScore}</Text>
          )}
        </View>
        
        <View className="flex-1 items-start pl-4">
          <Text className="text-foreground font-bold text-lg">{item.awayTeam}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-3 border-b border-border bg-card mb-4 flex-row justify-between items-center">
        <Text className="text-xl font-extrabold text-foreground tracking-tight">Matches</Text>
        <CalendarIcon size={24} color="#71717a" />
      </View>

      <FlatList
        data={MOCK_MATCHES}
        keyExtractor={item => item.id}
        renderItem={renderMatch}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
