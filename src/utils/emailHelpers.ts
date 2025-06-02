
import { supabase } from '@/integrations/supabase/client';

export const sendWelcomeEmail = async (email: string, name: string) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: email,
      subject: 'Välkommen till Aktivitetsappen!',
      template: 'welcome',
      templateData: { name }
    }
  });

  if (error) throw error;
  return data;
};

export const sendNotificationEmail = async (email: string, message: string) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: email,
      subject: 'Ny notifikation från Aktivitetsappen',
      template: 'notification',
      templateData: { message }
    }
  });

  if (error) throw error;
  return data;
};

export const sendStreakReminderEmail = async (email: string, name: string, streak: number) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: email,
      subject: '🔥 Din streak är i fara!',
      template: 'streak-reminder',
      templateData: { name, streak }
    }
  });

  if (error) throw error;
  return data;
};
