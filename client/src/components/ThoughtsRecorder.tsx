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
      // First check if there's already an entry for this time and message to prevent duplicates
      const userId = user.id === 351811 ? 1 : user.id; // Use the same ID mapping as in History.tsx
      const historyResponse = await fetch(`/api/history/${userId}`, {
        credentials: 'include'
      });
      
      if (historyResponse.ok) {
        const historyItems = await historyResponse.json();
        
        // Check for potential duplicate - same time and thoughts within the last minute
        const now = new Date();
        const potentialDuplicate = historyItems.find((item: any) => 
          item.time === time && 
          item.thoughts === thoughts && 
          // Only consider items saved in the last minute
          (now.getTime() - new Date(item.savedAt).getTime() < 60000)
        );
        
        // If there's already a recent entry for this time and message, don't create another one
        if (potentialDuplicate) {
          console.log('Skipping save - duplicate entry detected');
          toast({
            title: t('thoughts.saved.title'),
            description: t('thoughts.alreadySaved'),
          });
          setIsSaved(true);
          return;
        }
      }
      
      // Save to API if no duplicate found
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
    <div className="mt-6 border border-[#D8C3A5] rounded-[12px] p-5 bg-white shadow-card fade-in-card">
      <Tabs defaultValue="record">
        <TabsList className="grid w-full grid-cols-1 bg-[#F5ECE6]/80 border-[#D8C3A5]/30">
          <TabsTrigger value="record" className="data-[state=active]:bg-white data-[state=active]:text-[#9F84B5] data-[state=active]:shadow-sm font-medium">
            {isSaved ? (
              <CheckIcon className="h-5 w-5 mr-2 hover-scale text-[#9F84B5]" />
            ) : (
              <PencilIcon className="h-5 w-5 mr-2 hover-scale text-[#9F84B5]" />
            )}
            {t('thoughts.tabTitle')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="space-y-5 pt-5">
          <div className="space-y-3">
            <Label htmlFor="thoughts" className="text-[#6A4F6B] font-semibold tracking-wide text-base">{t('thoughts.prompt')}</Label>
            <Textarea
              id="thoughts"
              placeholder={t('thoughts.placeholder')}
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              className="min-h-[120px] border-[#D8C3A5] rounded-[12px] focus:border-[#9F84B5] focus:ring-[#9F84B5]/30 bg-[#F5ECE6]/30 transition-all duration-300 shadow-form text-[#6A4F6B] placeholder:text-[#6A4F6B]/50"
              disabled={isSaving || isSaved}
            />
          </div>
          
          <Button 
            onClick={handleSaveThoughts} 
            disabled={isSaving || isSaved || !thoughts.trim()}
            className="w-full bg-[#9F84B5] hover:bg-[#8A6C9F] text-white py-2.5 shadow-md font-medium"
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⧖</span>
                {t('thoughts.saving')}
              </span>
            ) : isSaved ? (
              <span className="flex items-center">
                <CheckIcon className="h-5 w-5 mr-2 hover-scale text-white" />
                {t('thoughts.saved.button')}
              </span>
            ) : (
              <span className="flex items-center">
                <SaveIcon className="h-5 w-5 mr-2 hover-scale text-white" />
                {t('thoughts.saveButton')}
              </span>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}