import { useState } from 'react';
import { Activity } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

interface GratitudeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  onSubmit: (gratitudes: [string, string, string]) => Promise<void>;
}

const GratitudeFormDialog = ({
  open,
  onOpenChange,
  activity,
  onSubmit
}: GratitudeFormDialogProps) => {
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!gratitude1.trim() || !gratitude2.trim() || !gratitude3.trim()) {
      toast.error("Fyll i alla tre fält");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit([gratitude1.trim(), gratitude2.trim(), gratitude3.trim()]);
      setGratitude1('');
      setGratitude2('');
      setGratitude3('');
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting gratitude:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{activity?.name}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-2">
            Ta en minut och fundera på vad som gjort din dag lite bättre. Det kan vara något stort 
            eller något litet - en vänlig gest, en god kopp kaffe eller att solen sken på vägen hem. 
            Skriv ner tre saker du känner tacksamhet för just idag.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="gratitude1">Sak 1</Label>
            <Textarea
              id="gratitude1"
              value={gratitude1}
              onChange={(e) => setGratitude1(e.target.value)}
              placeholder="Ex: Jag tog mig tid att lyssna på en vän som behövde prata"
              rows={2}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gratitude2">Sak 2</Label>
            <Textarea
              id="gratitude2"
              value={gratitude2}
              onChange={(e) => setGratitude2(e.target.value)}
              placeholder="Ex: Jag kände mig stolt över att jag åstadkom ________ idag"
              rows={2}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gratitude3">Sak 3</Label>
            <Textarea
              id="gratitude3"
              value={gratitude3}
              onChange={(e) => setGratitude3(e.target.value)}
              placeholder="Ex: Jag uppskattade en lugn stund för mig själv efter en stressig dag"
              rows={2}
              maxLength={200}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sparar..." : "Spara och få 1 poäng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GratitudeFormDialog;
