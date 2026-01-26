
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { notificationManager } from '@/lib/notificationManager';
import { useAuth } from '@/hooks/use-auth';

export function useRealtimeConnection() {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // Create a channel for realtime updates
    const channel = supabase.channel('admin_dashboard_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          // Handle different table updates
          const { table, eventType } = payload;
          
          if (table === 'collections' && eventType === 'INSERT') {
            notificationManager.success('New collection added');
          } else if (table === 'users' && eventType === 'INSERT') {
            notificationManager.info('New user registered');
          } else if (table === 'withdrawals' && eventType === 'INSERT') {
            notificationManager.warning('New withdrawal request');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connection established');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  return { isConnected: !!channelRef.current };
}
