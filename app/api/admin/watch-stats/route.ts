import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client is not configured on the server' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const video_id = searchParams.get('video_id');
    const user_id = searchParams.get('user_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    // Step 1: Query video_watches
    let query = supabaseAdmin
      .from('video_watches')
      .select(`
        *,
        video:watch_ads_videos(*)
      `);

    if (video_id) query = query.eq('video_id', video_id);
    if (user_id) query = query.eq('user_id', user_id);
    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const { data: rawWatches, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 200 });
    }

    // Step 2: Manually join users
    let watches = rawWatches || [];
    if (watches.length > 0) {
      const userIds = [...new Set(watches.map((w: any) => w.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabaseAdmin
          .from('users')
          .select('id, email, full_name')
          .in('id', userIds);
          
        if (!usersError && users) {
          const usersMap = users.reduce((acc: any, user: any) => {
            acc[user.id] = user;
            return acc;
          }, {});
          
          watches = watches.map((w: any) => ({
            ...w,
            user: usersMap[w.user_id] || null
          }));
        }
      }
    }

    return NextResponse.json({
      watches,
      count: watches.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
