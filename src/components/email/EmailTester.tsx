
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmail } from '@/hooks/useEmail';
import { Mail } from 'lucide-react';

const EmailTester = () => {
  const [email, setEmail] = useState('');
  const [template, setTemplate] = useState<'welcome' | 'notification' | 'streak-reminder'>('welcome');
  const { sendEmail, loading } = useEmail();

  const handleSendTestEmail = async () => {
    if (!email) return;

    const templates = {
      welcome: {
        subject: 'Välkommen till Aktivitetsappen!',
        templateData: { name: 'Testanvändare' }
      },
      notification: {
        subject: 'Ny notifikation',
        templateData: { message: 'Det här är ett test-meddelande!' }
      },
      'streak-reminder': {
        subject: '🔥 Din streak är i fara!',
        templateData: { name: 'Testanvändare', streak: 5 }
      }
    };

    const templateConfig = templates[template];

    try {
      await sendEmail({
        to: email,
        subject: templateConfig.subject,
        template: template,
        templateData: templateConfig.templateData,
      });
    } catch (error) {
      console.error('Failed to send test email:', error);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Test Email-funktionen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Email-adress</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="din@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="template-select">Email-mall</Label>
          <Select value={template} onValueChange={(value: any) => setTemplate(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Välkomstmail</SelectItem>
              <SelectItem value="notification">Notifikation</SelectItem>
              <SelectItem value="streak-reminder">Streak-påminnelse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSendTestEmail}
          disabled={loading || !email}
          className="w-full"
        >
          {loading ? 'Skickar...' : 'Skicka test-email'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailTester;
