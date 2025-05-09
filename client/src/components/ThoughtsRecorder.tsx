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
        time,
        type: timeType,
        thoughts,
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
    <div className="mt-6 border rounded-md p-4 bg-card">
      <Tabs defaultValue="record">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="record">
            {isSaved ? (
              <CheckIcon className="h-4 w-4 mr-2" />
            ) : (
              <PencilIcon className="h-4 w-4 mr-2" />
            )}
            {t('thoughts.tabTitle')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="thoughts">{t('thoughts.prompt')}</Label>
            <Textarea
              id="thoughts"
              placeholder={t('thoughts.placeholder')}
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              className="min-h-[100px]"
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
                <CheckIcon className="h-4 w-4 mr-2" />
                {t('thoughts.saved.button')}
              </span>
            ) : (
              <span className="flex items-center">
                <SaveIcon className="h-4 w-4 mr-2" />
                {t('thoughts.saveButton')}
              </span>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}