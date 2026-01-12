<<<<<<< HEAD
=======

>>>>>>> UserAuthetication
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Moon, Sun, Menu, X, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import SearchBar, { SearchType } from '@/components/SearchBar';
import UserItem from '@/components/UserItem';
import MessageBubble from '@/components/MessageBubble';
import MessageInput from '@/components/MessageInput';
import MediaModal from '@/components/MediaModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  mockUsers, 
  mockMessages, 
  currentUser,
  getConversationMessages,
  getLastMessage,
<<<<<<< HEAD
  type User,
=======
  // type User,
>>>>>>> UserAuthetication
  type Message
} from '@/lib/mockData';
import Image from 'next/image';

function ChatApp() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get('user');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
<<<<<<< HEAD
  
=======
>>>>>>> UserAuthetication

  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedUser = selectedUserId 
    ? mockUsers.find(u => u.id === selectedUserId) || null 
    : null;

<<<<<<< HEAD

=======
>>>>>>> UserAuthetication
  useEffect(() => {
    if (selectedUser) {
      const msgs = getConversationMessages(selectedUser.id);
      setLocalMessages(msgs);
      setIsSidebarOpen(false);
    }
  }, [selectedUser?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, selectedUser]);


  const getFilteredUsers = () => {
    if (!searchQuery) return mockUsers;
    
    if (searchType === 'all' || searchType === 'users') {
      return mockUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  };

  const getFilteredMessages = () => {
    if (!searchQuery || (searchType !== 'all' && searchType !== 'messages')) {
      return [];
    }

    return mockMessages.filter(msg =>
      msg.type === 'text' && 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredMedia = () => {
    if (!searchQuery || (searchType !== 'all' && searchType !== 'media')) {
      return [];
    }

    return mockMessages.filter(msg => msg.type === 'image');
  };

  const handleSendMessage = (content: string) => {
    if (!selectedUser) return;


    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      receiverId: selectedUser.id,
      content,
      timestamp: new Date(),
      type: 'text',
      read: false
    };

    setLocalMessages(prev => [...prev, newMessage]);


    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedUser.id,
        receiverId: 'current-user',
        content: "I'm currently unavailable, but I'll get back to you soon!",
        timestamp: new Date(),
        type: 'text',
        read: true
      };
      setLocalMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const handleSearch = (query: string, type: SearchType) => {
    setSearchQuery(query);
    setSearchType(type);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchType('all');
  };

  const selectUser = (userId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('user', userId);
    router.push(`/?${params.toString()}`);
    setIsSidebarOpen(false);
  };

  const openMedia = (url: string) => {
    setSelectedMediaUrl(url);
    setMediaModalOpen(true);
  };

  const filteredUsers = getFilteredUsers();
  const filteredMessages = getFilteredMessages();
  const filteredMedia = getFilteredMedia();

  const showSearchResults = searchQuery.length > 0;

  return (
    <div className="h-screen flex overflow-hidden">
      <MediaModal 
        isOpen={mediaModalOpen} 
        imageUrl={selectedMediaUrl} 
        onClose={() => setMediaModalOpen(false)} 
      />


      <aside
        className={`
          w-full md:w-80 lg:w-96 bg-surface border-r border-border flex flex-col
          ${isSidebarOpen ? 'fixed inset-0 z-40 md:relative' : 'hidden md:flex'}
        `}
      >

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tether
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-text-secondary" />
                ) : (
                  <Moon className="w-5 h-5 text-text-secondary" />
                )}
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          </div>

          <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
        </div>


        <div className="flex-1 overflow-y-auto p-4">
          {!showSearchResults ? (
            <>
              <h2 className="text-sm font-semibold text-text-muted mb-3 px-1">
                Active Now ({mockUsers.filter(u => u.isActive).length})
              </h2>
              <div className="space-y-1">
                {mockUsers.map((user) => {
                  const lastMsg = getLastMessage(user.id);
                  return (
                    <UserItem
                      key={user.id}
                      user={user}
                      isSelected={selectedUser?.id === user.id}
                      onClick={() => selectUser(user.id)}
                      lastMessage={lastMsg?.content}
                      unreadCount={user.id === '4' || user.id === '1' ? 1 : 0}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-6">

              {(searchType === 'all' || searchType === 'users') && filteredUsers.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-text-muted mb-3 px-1">
                    Users ({filteredUsers.length})
                  </h2>
                  <div className="space-y-1">
                    {filteredUsers.map((user) => (
                      <UserItem
                        key={user.id}
                        user={user}
                        isSelected={selectedUser?.id === user.id}
                        onClick={() => selectUser(user.id)}
                      />
                    ))}
                  </div>
                </div>
              )}


              {(searchType === 'all' || searchType === 'messages') && filteredMessages.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-text-muted mb-3 px-1">
                    Messages ({filteredMessages.length})
                  </h2>
                  <div className="space-y-3">
                    {filteredMessages.map((msg) => {
                      const sender = mockUsers.find(u => u.id === msg.senderId) || currentUser;
                      return (
                        <div
                          key={msg.id}
                          className="p-3 bg-background rounded-xl border border-border hover:border-primary transition-colors cursor-pointer"
                          onClick={() => {
                            const user = mockUsers.find(u => 
                              u.id === msg.senderId || u.id === msg.receiverId
                            );
                            if (user && user.id !== 'current-user') {
                              selectUser(user.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Image
                              src={sender.avatar}
                              alt={sender.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span className="text-sm font-medium text-text-primary">
                              {sender.name}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">
                            {msg.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {(searchType === 'all' || searchType === 'media') && filteredMedia.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-text-muted mb-3 px-1">
                    Media ({filteredMedia.length})
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredMedia.map((msg) => (
                      <div
                        key={msg.id}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => openMedia(msg.imageUrl!)}
                      >
                        <Image
                          src={msg.imageUrl!}
                          alt="Media"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {filteredUsers.length === 0 && 
               filteredMessages.length === 0 && 
               filteredMedia.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-text-muted">No results found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>


      <main className="flex-1 flex flex-col bg-background relative w-full">
        {selectedUser ? (
          <>

            <header className="p-4 border-b border-border bg-surface flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Back to contacts"
              >
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <Image
                src={selectedUser.avatar}
                alt={selectedUser.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-text-primary">
                  {selectedUser.name}
                </h2>
                <p className="text-sm text-text-muted">
                  {selectedUser.isActive ? 'Active now' : selectedUser.lastSeen}
                </p>
              </div>
            </header>


            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {localMessages.map((msg, index) => {
                const isSent = msg.senderId === 'current-user';
                const showAvatar = !isSent && (
                  index === 0 || 
                  localMessages[index - 1].senderId !== msg.senderId
                );

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isSent={isSent}
                    showAvatar={showAvatar}
                    avatar={!isSent ? selectedUser.avatar : undefined}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>


            <MessageInput onSend={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center hidden md:flex">
            
            <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Welcome to Tether
            </h2>
            <p className="text-text-muted max-w-md">
              Select a conversation from the sidebar to start messaging
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

<<<<<<< HEAD
=======
>>>>>>> Stashed changes
>>>>>>> UserAuthetication
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatApp />
    </Suspense>
  );
}