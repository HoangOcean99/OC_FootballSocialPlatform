'use client';

import { useChatStore } from '@/store/useChatStore';
import ChatBox from './ChatBox';
import { Link } from '@/navigation';
import { MessageCircle } from 'lucide-react';

export default function ChatManager() {
  const { activeChats } = useChatStore();

  return (
    <>
      <div className="fixed bottom-0 right-10 z-[100] flex items-end gap-3 pointer-events-none pb-4">
        {activeChats.map(user => (
          <div key={user.id} className="pointer-events-auto">
            <ChatBox user={user} />
          </div>
        ))}
      </div>
    </>
  );
}
