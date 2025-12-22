import type { Metadata } from 'next';
import { CreatorCard } from '@/components/cards';
import { createClient } from '@/lib/supabase-server';
import type { Channel } from '@/types/database';

export const metadata: Metadata = {
  title: 'Creators',
  description:
    'Discover top STR content creators and experts. Watch educational videos from industry leaders.',
};

// Revalidate every hour
export const revalidate = 3600;

async function getCreators(): Promise<Channel[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('videos_channels')
    .select('*')
    .eq('status', 'active')
    .order('subscriber_count', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching creators:', error);
    return [];
  }

  return data || [];
}

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creators</h1>
        <p className="text-muted-foreground">
          Expert STR content creators sharing their knowledge and experience
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{creators.length}</span> creators
          {' '}sharing educational content on short-term rentals
        </p>
      </div>

      {/* Creators Grid */}
      {creators.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} channel={creator} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No creators found</p>
        </div>
      )}
    </div>
  );
}
