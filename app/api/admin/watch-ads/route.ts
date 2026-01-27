import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// No caching - admin needs immediate updates
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// GET - Fetch all watch ads videos
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          videos: [],
          count: 0,
          error: 'Supabase admin client is not configured on the server',
        },
        { status: 200 }
      );
    }

    // Query videos using admin client (bypasses RLS)
    const { data: videos, error } = await supabaseAdmin
      .from('watch_ads_videos')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json({
        videos: [],
        count: 0,
        error: error.message
      }, { status: 200 });
    }

    return NextResponse.json({
      videos: videos || [],
      count: (videos || []).length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        videos: [],
        count: 0,
        error: error?.message || 'Internal server error'
      },
      { status: 200 }
    );
  }
}

// POST - Create a new watch ads video
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client is not configured on the server' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      video_url,
      video_type,
      thumbnail_url,
      watch_duration_seconds,
      credit_amount,
      watch_percentage_required,
      display_order,
      is_active,
      max_watches_per_day,
      advertiser_name,
      category
    } = body;

    // Validate required fields
    if (!title || !video_url) {
      return NextResponse.json(
        { error: 'Missing required fields: title and video_url are required' },
        { status: 400 }
      );
    }

    const insertData: any = {
      title,
      description,
      video_url,
      video_type: video_type || 'direct',
      thumbnail_url,
      watch_duration_seconds: watch_duration_seconds || 30,
      credit_amount: credit_amount || 5.00,
      watch_percentage_required: watch_percentage_required || 80,
      display_order: display_order || 0,
      is_active: is_active ?? true,
      max_watches_per_day: max_watches_per_day || 3,
      advertiser_name,
      category
    };

    const { data, error } = await supabaseAdmin
      .from('watch_ads_videos')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ video: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a watch ads video
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client is not configured on the server' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('watch_ads_videos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ video: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a watch ads video
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client is not configured on the server' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('watch_ads_videos')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
