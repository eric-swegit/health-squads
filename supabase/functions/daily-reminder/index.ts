
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
    console.log(`Sending daily reminders to all users on ${today}`);

    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email');

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} total users to send reminders to`);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Send daily reminder emails to all users
    for (const user of profiles || []) {
      try {
        console.log(`Sending daily reminder email to: ${user.email}`);

        const emailResponse = await resend.emails.send({
          from: "Health Squads <kontakt@healthsquads.fcwebben.se>",
          to: [user.email],
          subject: "🌟 Dags för din dagliga aktivitetsreflektion!",
          html: generateDailyReminderEmail(user.name),
          text: `Hej ${user.name}! Dags att reflektera över dagen och logga dina aktiviteter. Logga in i appen för att se vad du gjort idag och planera för imorgon!`,
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
      emailsSent,
      emailsFailed,
      date: today,
      reminderType: 'daily_reflection'
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
      <h1 style="color: #7c3aed;">🌟 Dags för din dagliga aktivitetsreflektion!</h1>
      <p>Hej ${name || 'där'}!</p>
      <p>Det är 20:00 och dags för din dagliga check-in! Hur har dagen varit och vilka aktiviteter har du gjort?</p>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
        <h3 style="color: black; margin: 0 0 10px 0;">Dagens reflektion</h3>
        <p style="color: black; margin: 0;">Ta en stund att reflektera över dagen och logga dina aktiviteter!</p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151;">Kom ihåg att:</h3>
        <ul style="color: #374151;">
          <li>📊 Logga alla aktiviteter du gjort idag</li>
          <li>🔥 Håll din streak levande</li>
          <li>🏆 Se hur du ligger till på topplistan</li>
          <li>💪 Planera för imorgon</li>
          <li>🎯 Reflektera över dina framsteg</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://healthsquads.fcwebben.se" 
           style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Öppna appen nu
        </a>
      </div>
      
      <p style="color: #6b7280;">Ha en fantastisk kväll!</p>
      <p style="color: #6b7280;">Mvh,<br>Health Squads-teamet</p>
    </div>
  `;
}

serve(handler);
