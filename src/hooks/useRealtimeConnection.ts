import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SubscriptionConfig {
  table: string;
  schema?: string;
  filter?: string;
  onUpdate?: (payload: any) => void;
  onInsert?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtimeConnection(
  subscriptions: SubscriptionConfig[],
  enabled: boolean = true
) {
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef(subscriptions);

  // Update ref if subscriptions change deeply (simplified check or just always update ref but use a key for effect)
  // For now, we'll assume the table/filter structure is stable and only callbacks might change.
  // Actually, to handle inline function definitions without re-subscribing, we should use a ref for the current subscriptions
  // and call the current ref's callbacks in the event handler.
  
  useEffect(() => {
    subscriptionsRef.current = subscriptions;
  }, [subscriptions]);

  useEffect(() => {
    if (!enabled) return;

    const channels: RealtimeChannel[] = [];

    // We use the initial subscriptions config for setting up channels
    // If the table/filter changes, this effect should re-run.
    // We can create a key string to detect structural changes.
    
    const configKey = subscriptions.map(s => `${s.schema || 'public'}:${s.table}:${s.filter || ''}`).join('|');

    subscriptions.forEach((sub, index) => {
      const channel = supabase
        .channel(`public:${sub.table}:${index}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: sub.schema || 'public',
            table: sub.table,
            filter: sub.filter,
          },
          (payload) => {
            // Always use the latest callbacks from the ref
            const currentSub = subscriptionsRef.current[index];
            if (!currentSub) return;

            if (payload.eventType === 'INSERT' && currentSub.onInsert) {
              currentSub.onInsert(payload);
            } else if (payload.eventType === 'UPDATE' && currentSub.onUpdate) {
              currentSub.onUpdate(payload);
            } else if (payload.eventType === 'DELETE' && currentSub.onDelete) {
              currentSub.onDelete(payload);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setIsConnected(false);
          }
        });

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, subscriptions.map(s => `${s.schema || 'public'}:${s.table}:${s.filter || ''}`).join('|')]);

  return { isConnected };
}
