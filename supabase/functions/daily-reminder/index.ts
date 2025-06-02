
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily reminder job...");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking for users without activities on ${today}`);

    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email');

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} total users`);

    // Get users who have already completed activities today
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('claimed_activities')
      .select('user_id')
      .eq('date', today);

    if (activeUsersError) {
      console.error("Error fetching active users:", activeUsersError);
      throw activeUsersError;
    }

    const activeUserIds = new Set(activeUsers?.map(user => user.user_id) || []);
    console.log(`Found ${activeUserIds.size} users who have completed activities today`);

    // Filter users who haven't completed any activities today
    const inactiveUsers = profiles?.filter(profile => !activeUserIds.has(profile.id)) || [];
    console.log(`Found ${inactiveUsers.length} users who need reminders`);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Send reminder emails to inactive users
    for (const user of inactiveUsers) {
      try {
        console.log(`Sending reminder email to: ${user.email}`);

        const emailResponse = await resend.emails.send({
          from: "Health Squads <kontakt@healthsquads.fcwebben.se>",
          to: [user.email],
          subject: "🌟 Glöm inte dina aktiviteter idag!",
          html: generateDailyReminderEmail(user.name),
          text: `Hej ${user.name}! Glöm inte att logga dina aktiviteter för idag. Logga in i appen för att fortsätta samla poäng och hålla din streak levande!`,
        });

        console.log(`Email sent successfully to ${user.email}:`, emailResponse.data?.id);
        emailsSent++;
      } catch (emailError: any) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
        emailsFailed++;
      }
    }

    const summary = {
      totalUsers: profiles?.length || 0,
      activeUsers: activeUserIds.size,
      inactiveUsers: inactiveUsers.length,
      emailsSent,
      emailsFailed,
      date: today
    };

    console.log("Daily reminder job completed:", summary);

    return new Response(JSON.stringify({ 
      success: true, 
      summary 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in daily-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateDailyReminderEmail(name: string) {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #7c3aed;">🌟 Glöm inte dina aktiviteter idag!</h1>
      <p>Hej ${name || 'där'}!</p>
      <p>Det är dags att logga dina aktiviteter för idag. Du har fortfarande tid att samla poäng och hålla din streak levande!</p>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
        <h3 style="color: white; margin: 0 0 10px 0;">Varför vänta?</h3>
        <p style="color: white; margin: 0;">Varje aktivitet för dig närmare dina mål!</p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151;">Kom ihåg:</h3>
        <ul style="color: #374151;">
          <li>📊 Samla poäng för varje aktivitet</li>
          <li>🔥 Håll din streak levande</li>
          <li>🏆 Klättra på topplistan</li>
          <li>💪 Bygg starka vanor</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://cbypedcyszozqezowbbo.supabase.co" 
           style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Logga dina aktiviteter nu
        </a>
      </div>
      
      <p style="color: #6b7280;">Ha en fantastisk dag!</p>
      <p style="color: #6b7280;">Mvh,<br>Aktivitetsapp-teamet</p>
    </div>
  `;
}

serve(handler);
