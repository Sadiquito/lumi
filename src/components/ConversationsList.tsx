
import React, { useEffect, useRef, useCallback } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { ConversationEntry } from './ConversationEntry';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare } from 'lucide-react';

export const ConversationsList: React.FC = () => {
  const { conversations, loading, hasMore, loadMore } = useConversations();
  const observerRef = useRef<IntersectionObserver>();
  const lastConversationRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMore]);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-xl font-cinzel text-white/90 mb-2">
          Your journal awaits
        </h3>
        <p className="text-white/70 font-crimson">
          Start your first conversation with Lumi to see your reflections here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        {conversations.map((conversation, index) => {
          const isLast = index === conversations.length - 1;
          return (
            <div
              key={conversation.id}
              ref={isLast ? lastConversationRef : null}
            >
              <ConversationEntry conversation={conversation} />
            </div>
          );
        })}
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="ml-2 text-white/70 font-crimson">Loading more conversations...</span>
          </div>
        )}
        
        {!hasMore && conversations.length > 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto"></div>
            <p className="text-white/50 font-crimson text-sm mt-4">
              You've reached the beginning of your journey
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
