
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

export interface EmailTemplate {
  welcome: {
    name?: string;
  };
  notification: {
    message?: string;
  };
  'streak-reminder': {
    name?: string;
    streak?: number;
  };
}

export interface SendEmailOptions<T extends keyof EmailTemplate> {
  to: string;
  subject: string;
  template?: T;
  templateData?: EmailTemplate[T];
  html?: string;
  text?: string;
}

export const useEmail = () => {
  const [loading, setLoading] = useState(false);

  const sendEmail = async <T extends keyof EmailTemplate>(
    options: SendEmailOptions<T>
  ) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: options.to,
          subject: options.subject,
          template: options.template,
          templateData: options.templateData,
          html: options.html,
          text: options.text,
        },
      });

      if (error) throw error;

      toast.success('Email skickat!');
      return data;
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(`Kunde inte skicka email: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEmail,
    loading,
  };
};
