import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Sparkles, RefreshCw, Heart } from 'lucide-react';
import { useGratitudeEntries } from '@/hooks/useGratitudeEntries';
import { useGratitudeSummary } from '@/hooks/useGratitudeSummary';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const GratitudeSection = () => {
  const { user } = useAuth();
  const { entries, loading: entriesLoading } = useGratitudeEntries();
  const { summary, loading: summaryLoading, generateSummary, fetchCachedSummary } = useGratitudeSummary(user?.id);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCachedSummary();
  }, [fetchCachedSummary]);

  if (entriesLoading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return null;
  }

  const getThemeEmoji = (theme: string) => {
    const themeMap: Record<string, string> = {
      'relationer': '❤️',
      'familj': '👨‍👩‍👧‍👦',
      'hälsa': '💪',
      'träning': '🏃',
      'arbete': '💼',
      'karriär': '📈',
      'personlig utveckling': '🌟',
      'natur': '🌿',
      'mat': '🍽️',
      'vila': '😴',
      'vänner': '👫',
      'hobbyer': '🎨',
      'lärande': '📚',
      'tacksamhet': '🙏',
    };
    const lowerTheme = theme.toLowerCase();
    for (const [key, emoji] of Object.entries(themeMap)) {
      if (lowerTheme.includes(key)) return emoji;
    }
    return '✨';
  };

  return (
    <Card className="mt-4 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-amber-500" />
          Tacksamhet
          <span className="text-sm font-normal text-muted-foreground">
            ({entries.length} poster)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* AI Summary Section */}
        <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm text-purple-700">AI-sammanfattning</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => generateSummary(entries)}
              disabled={summaryLoading}
              className="h-8 text-xs"
            >
              {summaryLoading ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              {summary ? 'Uppdatera' : 'Generera'}
            </Button>
          </div>
          
          {summaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : summary ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">{summary.summary}</p>
              
              {summary.themes && summary.themes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {summary.themes.map((theme, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 rounded-full text-xs font-medium text-purple-700"
                    >
                      {getThemeEmoji(theme)} {theme}
                    </span>
                  ))}
                </div>
              )}
              
              {summary.insight && (
                <p className="text-xs italic text-purple-600 border-l-2 border-purple-300 pl-2">
                  "{summary.insight}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Klicka på "Generera" för att skapa en AI-sammanfattning av dina tacksamhetsposter.
            </p>
          )}
        </div>

        {/* Collapsible History */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-10">
              <span className="text-sm font-medium">Historik</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {format(new Date(entry.created_at), 'd MMMM yyyy', { locale: sv })}
                  </p>
                  <ul className="space-y-1">
                    <li className="text-sm flex items-start gap-2">
                      <span className="text-amber-500">1.</span>
                      {entry.gratitude_1}
                    </li>
                    <li className="text-sm flex items-start gap-2">
                      <span className="text-amber-500">2.</span>
                      {entry.gratitude_2}
                    </li>
                    <li className="text-sm flex items-start gap-2">
                      <span className="text-amber-500">3.</span>
                      {entry.gratitude_3}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default GratitudeSection;
