import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Trophy, MessageSquare, Users, Medal, Star, ShoppingBag, Shield } from 'lucide-react-native';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false, // We'll handle headers inside the screens or tabs if needed
        drawerStyle: {
          backgroundColor: '#0f172a',
          width: 280,
        },
        drawerActiveTintColor: '#10b981',
        drawerInactiveTintColor: '#cbd5e1',
        drawerLabelStyle: {
          fontWeight: 'bold',
          marginLeft: -10,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Trang chủ',
          title: 'Trang chủ',
          drawerIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="messages"
        options={{
          drawerLabel: 'Tin nhắn',
          title: 'Tin nhắn',
          drawerIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="friends"
        options={{
          drawerLabel: 'Bạn bè',
          title: 'Bạn bè',
          drawerIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="competitions"
        options={{
          drawerLabel: 'Giải đấu',
          title: 'Giải đấu',
          drawerIcon: ({ color, size }) => <Medal size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="predictions"
        options={{
          drawerLabel: 'Dự đoán',
          title: 'Dự đoán',
          drawerIcon: ({ color, size }) => <Star size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="shop"
        options={{
          drawerLabel: 'Cửa hàng',
          title: 'Cửa hàng',
          drawerIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="plus"
        options={{
          drawerLabel: 'PitchGrid Plus',
          title: 'PitchGrid Plus',
          drawerIcon: ({ color, size }) => <Star size={size} color="#f59e0b" fill="#f59e0b" />,
        }}
      />
      <Drawer.Screen
        name="admin"
        options={{
          drawerLabel: 'Quản trị Admin',
          title: 'Admin',
          drawerIcon: ({ color, size }) => <Shield size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}
