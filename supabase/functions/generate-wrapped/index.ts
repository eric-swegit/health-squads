import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get ALL claimed activities for the whole year (2025)
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
      .gte('created_at', '2025-01-01')
      .order('date', { ascending: true });

    // Get gratitude entries count for the whole year
    const { count: gratitudeCount } = await supabase
      .from('gratitude_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', '2025-01-01');

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

    // Get icon type based on activity name
    const getActivityIconType = (type: string, name: string): string => {
      const nameLower = name.toLowerCase();
      if (nameLower.includes('vatten')) return 'water';
      if (nameLower.includes('frukt') || nameLower.includes('grönsak') || nameLower.includes('vegetarisk')) return 'food';
      if (nameLower.includes('gym')) return 'gym';
      if (nameLower.includes('hemmaträning')) return 'home';
      if (nameLower.includes('steg')) return 'steps';
      if (nameLower.includes('sömn')) return 'sleep';
      if (nameLower.includes('tacksamhet')) return 'gratitude';
      if (nameLower.includes('mindfulness') || nameLower.includes('andning')) return 'mindfulness';
      return 'default';
    };

    const topActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        count: data.count,
        iconType: getActivityIconType(data.type, name)
      }));

    // Generate achievements with icon types
    const achievements: Array<{ id: string; title: string; description: string; iconType: string }> = [];

    if (longestStreak >= 7) {
      achievements.push({
        id: 'streak_7',
        title: 'Veckostreak!',
        description: `Du hade en streak på ${longestStreak} dagar i rad`,
        iconType: 'streak'
      });
    }

    if (totalActivities >= 50) {
      achievements.push({
        id: 'activities_50',
        title: 'Aktivitetsmaskin',
        description: `Du loggade ${totalActivities} aktiviteter`,
        iconType: 'activities'
      });
    }

    if (totalPoints >= 100) {
      achievements.push({
        id: 'points_100',
        title: 'Poängjägare',
        description: `Du samlade ${totalPoints} poäng`,
        iconType: 'points'
      });
    }

    if ((gratitudeCount || 0) >= 10) {
      achievements.push({
        id: 'gratitude_10',
        title: 'Tacksamhetsmästare',
        description: `Du skrev ner ${gratitudeCount} tacksamhetsposter`,
        iconType: 'gratitude'
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
        iconType: 'water'
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
        iconType: 'workout'
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
      photos: photos.slice(0, 50),
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
