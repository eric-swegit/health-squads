
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: 'welcome' | 'notification' | 'streak-reminder';
  templateData?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, html, text, template, templateData }: EmailRequest = await req.json();

    let emailHtml = html;
    let emailText = text;

    // Generate email content based on template
    if (template) {
      const templateContent = generateEmailTemplate(template, templateData || {});
      emailHtml = templateContent.html;
      emailText = templateContent.text;
    }

    console.log(`Sending email to: ${to}, subject: ${subject}`);

    const emailResponse = await resend.emails.send({
      from: "Health Squads <kontakt@healthsquads.fcwebben.se>",
      to: [to],
      subject: subject,
      html: emailHtml,
      text: emailText,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailTemplate(template: string, data: Record<string, any>) {
  switch (template) {
    case 'welcome':
      return {
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #7c3aed;">Välkommen till Aktivitetsappen!</h1>
            <p>Hej ${data.name || 'där'}!</p>
            <p>Tack för att du registrerat dig på vår aktivitetsapp. Nu kan du börja samla poäng för dina aktiviteter!</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Kom igång:</h3>
              <ul>
                <li>Utforska våra aktiviteter</li>
                <li>Samla poäng för varje aktivitet</li>
                <li>Tävla på topplistan</li>
                <li>Håll din streak levande!</li>
              </ul>
            </div>
            <p>Lycka till!</p>
            <p style="color: #6b7280;">Mvh,<br>Aktivitetsapp-teamet</p>
          </div>
        `,
        text: `Välkommen till Aktivitetsappen! Hej ${data.name || 'där'}! Tack för att du registrerat dig. Nu kan du börja samla poäng för dina aktiviteter!`
      };
    
    case 'notification':
      return {
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #7c3aed;">Ny notifikation</h2>
            <p>${data.message || 'Du har en ny notifikation i appen!'}</p>
            <p>Logga in för att se vad som hänt.</p>
            <p style="color: #6b7280;">Mvh,<br>Aktivitetsapp-teamet</p>
          </div>
        `,
        text: `Ny notifikation: ${data.message || 'Du har en ny notifikation i appen!'}`
      };
    
    case 'streak-reminder':
      return {
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #f59e0b;">🔥 Din streak är i fara!</h2>
            <p>Hej ${data.name || 'där'}!</p>
            <p>Du har en ${data.streak || 0} dagars streak som riskerar att brytas idag.</p>
            <p>Gör en aktivitet för att hålla din streak levande!</p>
            <p style="color: #6b7280;">Mvh,<br>Aktivitetsapp-teamet</p>
          </div>
        `,
        text: `🔥 Din ${data.streak || 0} dagars streak är i fara! Gör en aktivitet idag för att hålla den levande.`
      };

    case 'daily-reminder':
      return {
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #7c3aed;">🌟 Glöm inte dina aktiviteter idag!</h1>
            <p>Hej ${data.name || 'där'}!</p>
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
            
            <p style="color: #6b7280;">Ha en fantastisk dag!</p>
            <p style="color: #6b7280;">Mvh,<br>Aktivitetsapp-teamet</p>
          </div>
        `,
        text: `🌟 Glöm inte dina aktiviteter idag! Hej ${data.name || 'där'}! Det är dags att logga dina aktiviteter för idag. Logga in i appen för att fortsätta samla poäng!`
      };
    
    default:
      return {
        html: '<p>Standard email</p>',
        text: 'Standard email'
      };
  }
}

serve(handler);
