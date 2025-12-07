import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Competition start date
const COMPETITION_START = '2025-11-02';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, profile_image_url, gratitude_summary')
      .eq('id', userId)
      .single();

    // Get all claimed activities since competition start
    const { data: claimedActivities } = await supabase
      .from('claimed_activities')
      .select(`
        id,
        date,
        photo_url,
        photo_urls,
        created_at,
        activity_id,
        activities (
          id,
          name,
          points,
          type
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', COMPETITION_START)
      .order('date', { ascending: true });

    // Get gratitude entries count
    const { count: gratitudeCount } = await supabase
      .from('gratitude_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (!claimedActivities || claimedActivities.length === 0) {
      return new Response(
        JSON.stringify({
          totalActivities: 0,
          totalPoints: 0,
          longestStreak: 0,
          daysActive: 0,
          topActivities: [],
          achievements: [],
          gratitudeSummary: profile?.gratitude_summary || null,
          gratitudeCount: gratitudeCount || 0,
          photos: [],
          userName: profile?.name || 'Användare',
          profileImage: profile?.profile_image_url || null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate statistics
    const totalActivities = claimedActivities.length;
    const totalPoints = claimedActivities.reduce((sum, ca) => {
      const activity = ca.activities as any;
      return sum + (activity?.points || 0);
    }, 0);

    // Calculate unique days active
    const uniqueDays = new Set(claimedActivities.map(ca => ca.date));
    const daysActive = uniqueDays.size;

    // Calculate longest streak
    const sortedDates = Array.from(uniqueDays).sort();
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    // Count activities by name
    const activityCounts: Record<string, { count: number; type: string }> = {};
    claimedActivities.forEach(ca => {
      const activity = ca.activities as any;
      if (activity?.name) {
        if (!activityCounts[activity.name]) {
          activityCounts[activity.name] = { count: 0, type: activity.type };
        }
        activityCounts[activity.name].count++;
      }
    });

    // Get top 5 activities
    const getActivityEmoji = (type: string, name: string): string => {
      const emojiMap: Record<string, string> = {
        'vatten': '💧',
        'träning': '💪',
        'steg': '👟',
        'sömn': '😴',
        'kost': '🥗',
        'mindfulness': '🧘',
      };
      if (name.toLowerCase().includes('vatten')) return '💧';
      if (name.toLowerCase().includes('frukt') || name.toLowerCase().includes('grönsak')) return '🥗';
      if (name.toLowerCase().includes('vegetarisk')) return '🥬';
      if (name.toLowerCase().includes('gym')) return '🏋️';
      if (name.toLowerCase().includes('hemmaträning')) return '🏠';
      if (name.toLowerCase().includes('steg')) return '👟';
      if (name.toLowerCase().includes('sömn')) return '😴';
      if (name.toLowerCase().includes('tacksamhet')) return '🙏';
      if (name.toLowerCase().includes('mindfulness') || name.toLowerCase().includes('andning')) return '🧘';
      return emojiMap[type] || '✨';
    };

    const topActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        count: data.count,
        emoji: getActivityEmoji(data.type, name)
      }));

    // Generate achievements
    const achievements: Array<{ id: string; title: string; description: string; emoji: string }> = [];

    if (longestStreak >= 7) {
      achievements.push({
        id: 'streak_7',
        title: 'Veckostreak!',
        description: `Du hade en streak på ${longestStreak} dagar i rad`,
        emoji: '🔥'
      });
    }

    if (totalActivities >= 50) {
      achievements.push({
        id: 'activities_50',
        title: 'Aktivitetsmaskin',
        description: `Du loggade ${totalActivities} aktiviteter`,
        emoji: '🚀'
      });
    }

    if (totalPoints >= 100) {
      achievements.push({
        id: 'points_100',
        title: 'Poängjägare',
        description: `Du samlade ${totalPoints} poäng`,
        emoji: '🏆'
      });
    }

    if ((gratitudeCount || 0) >= 10) {
      achievements.push({
        id: 'gratitude_10',
        title: 'Tacksamhetsmästare',
        description: `Du skrev ner ${gratitudeCount} tacksamhetsposter`,
        emoji: '🙏'
      });
    }

    // Check for specific activity achievements
    const waterActivities = claimedActivities.filter(ca => {
      const activity = ca.activities as any;
      return activity?.name?.toLowerCase().includes('vatten');
    });
    if (waterActivities.length >= 20) {
      achievements.push({
        id: 'water_20',
        title: 'Hydreringshjälte',
        description: `Du loggade vatten ${waterActivities.length} gånger`,
        emoji: '💧'
      });
    }

    const workoutActivities = claimedActivities.filter(ca => {
      const activity = ca.activities as any;
      const name = activity?.name?.toLowerCase() || '';
      return name.includes('gym') || name.includes('hemmaträning');
    });
    if (workoutActivities.length >= 10) {
      achievements.push({
        id: 'workout_10',
        title: 'Träningsentusiast',
        description: `Du tränade ${workoutActivities.length} gånger`,
        emoji: '💪'
      });
    }

    // Collect photos (excluding step photos)
    const photos: string[] = [];
    claimedActivities.forEach(ca => {
      const activity = ca.activities as any;
      const name = activity?.name?.toLowerCase() || '';
      // Skip step-related photos
      if (name.includes('steg')) return;
      
      if (ca.photo_url) {
        photos.push(ca.photo_url);
      }
      if (ca.photo_urls && Array.isArray(ca.photo_urls)) {
        photos.push(...ca.photo_urls);
      }
    });

    // Mark wrapped as generated
    await supabase
      .from('profiles')
      .update({ wrapped_generated_at: new Date().toISOString() })
      .eq('id', userId);

    const result = {
      totalActivities,
      totalPoints,
      longestStreak,
      daysActive,
      topActivities,
      achievements,
      gratitudeSummary: profile?.gratitude_summary || null,
      gratitudeCount: gratitudeCount || 0,
      photos: photos.slice(0, 50), // Limit to 50 photos
      userName: profile?.name || 'Användare',
      profileImage: profile?.profile_image_url || null,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-wrapped:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
