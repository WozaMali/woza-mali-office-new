import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { notificationManager } from '@/lib/notificationManager'
import { useAuth } from '@/hooks/use-auth'

export function useRealtimeConnection() {
  const { user } = useAuth()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('admin_dashboard_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload: any) => {
          const table = payload.table
          const eventType = payload.eventType
          if (table === 'collections' && eventType === 'INSERT') {
            notificationManager.success('New collection added')
          } else if (table === 'users' && eventType === 'INSERT') {
            notificationManager.info('New user registered')
          } else if (table === 'withdrawals' && eventType === 'INSERT') {
            notificationManager.warning('New withdrawal request')
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user])

  return { isConnected: !!channelRef.current }
}

