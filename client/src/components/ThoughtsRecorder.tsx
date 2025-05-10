import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { PencilIcon, CheckIcon, SaveIcon } from 'lucide-react';
import { useTimeInterpretation } from '@/hooks/useTimeInterpretation';

interface ThoughtsRecorderProps {
  time: string;
  timeType: string;
  onSaved?: () => void;
}

export default function ThoughtsRecorder({ time, timeType, onSaved }: ThoughtsRecorderProps) {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const [thoughts, setThoughts] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Get the interpretation data for this time
  const { interpretation } = useTimeInterpretation(time);

  const handleSaveThoughts = async () => {
    if (!isLoggedIn || !user) {
      toast({
        title: t('thoughts.loginRequired.title'),
        description: t('thoughts.loginRequired.description'),
        variant: 'destructive',
      });
      return;
    }

    if (!thoughts.trim()) {
      toast({
        title: t('thoughts.empty.title'),
        description: t('thoughts.empty.description'),
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest('POST', '/api/history', {
        userId: user.id,
        time,
        type: timeType,
        thoughts,
        details: interpretation ? {
          spiritual: interpretation.spiritual,
          angel: interpretation.angel,
          numerology: interpretation.numerology
        } : {}
      });

      setIsSaved(true);
      toast({
        title: t('thoughts.saved.title'),
        description: t('thoughts.saved.description'),
      });

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Error saving thoughts:', error);
      toast({
        title: t('thoughts.error.title'),
        description: t('thoughts.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="mt-6 border border-[#D8C3A5]/30 rounded-[12px] p-5 bg-white shadow-card fade-in-card">
      <Tabs defaultValue="record">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="record">
            {isSaved ? (
              <CheckIcon className="h-4 w-4 mr-2 hover-scale text-[#B39BC8]" />
            ) : (
              <PencilIcon className="h-4 w-4 mr-2 hover-scale text-[#B39BC8]" />
            )}
            {t('thoughts.tabTitle')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="thoughts" className="text-primary font-medium tracking-wide">{t('thoughts.prompt')}</Label>
            <Textarea
              id="thoughts"
              placeholder={t('thoughts.placeholder')}
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              className="min-h-[120px] border-[#D8C3A5]/50 rounded-[12px] focus:border-primary focus:ring-primary/20 bg-[#FDF8F4]/50 transition-all duration-300"
              disabled={isSaving || isSaved}
            />
          </div>
          
          <Button 
            onClick={handleSaveThoughts} 
            disabled={isSaving || isSaved || !thoughts.trim()}
            className="w-full"
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⧖</span>
                {t('thoughts.saving')}
              </span>
            ) : isSaved ? (
              <span className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-2 hover-scale text-[#B39BC8]" />
                {t('thoughts.saved.button')}
              </span>
            ) : (
              <span className="flex items-center">
                <SaveIcon className="h-4 w-4 mr-2 hover-scale text-[#B39BC8]" />
                {t('thoughts.saveButton')}
              </span>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}