// src/services/feedService.ts
import { supabase } from '@/integrations/supabase/client';
const sb = supabase as any;   // cast supabase to any to skip deep TS generics

interface FeedPostRow {
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}
interface AuthorRow {
  id: string;
  name: string;
  avatar_url: string | null;
}

export type PeopleFilterOption =
  | 'my_friends'
  | 'community'
  | 'friends_and_their_friends';
export type TimeFilterOption = '7 days' | '30 days' | '90 days';

export interface FeedPost {
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export const ITEMS_PER_PAGE = 10;

export async function fetchFeed(
  userId: string,
  page: number,
  peopleFilter: PeopleFilterOption,
  timeFilter: TimeFilterOption
): Promise<FeedPost[]> {
  // 1) Build user-ID list
  let ids = [userId];
  if (peopleFilter !== 'community') {
    const { data: friends = [] } = await sb
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    const friendIds = friends.map((r: any) => r.following_id);

    if (peopleFilter === 'friends_and_their_friends') {
      const { data: fof = [] } = await sb
        .from('follows')
        .select('following_id')
        .in('follower_id', friendIds);
      const fofIds = fof.map((r: any) => r.following_id);
      ids = Array.from(new Set([...friendIds, ...fofIds]));
    } else {
      ids = friendIds;
    }
  } else {
    const { data: comm = [] } = await sb
      .from('users')
      .select('id')
      .eq('is_community_member', true);
    ids = comm.map((r: any) => r.id);
  }

  // 2) Compute cutoff
  const days = parseInt(timeFilter, 10);
  const cutoff = new Date(Date.now() - days * 864e5).toISOString();

  // 3) Pagination
  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // 4) Query untyped
  const { data, error } = await sb
    .from('feed_posts')
    .select(`
      post_id,
      user_id,
      content,
      created_at,
      users!inner(id, name, avatar_url)
    `)
    .in('user_id', ids)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  // 5) Cast back into our typed shape
  const rows = (data || []) as Array<FeedPostRow & { users: AuthorRow }>;

  return rows.map(r => ({
    post_id: r.post_id,
    user_id: r.user_id,
    content: r.content,
    created_at: r.created_at,
    author: {
      id: r.users.id,
      name: r.users.name,
      avatar_url: r.users.avatar_url,
    },
  }));
}
