import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { X, Clock, Trash2, RefreshCw } from 'lucide-react';

interface HistoryItem {
  id: number;
  time: string;
  type: string;
  savedAt: Date;
  thoughts?: string;
  details: {
    spiritual: { title: string; description: string; };
    angel: { name: string; message: string; };
    numerology: { title: string; analysis: string; };
    isAiGenerated?: boolean;
  };
}

export default function History() {
  const [, setLocation] = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Fetch history from API
  const fetchHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch from API - Use ID 1 directly as we know that's the DB ID after our fix
      const userId = user.id === 351811 ? 1 : user.id;
      console.log(`Using userId ${userId} instead of ${user.id} for API call`);
      const response = await fetch(`/api/history/${userId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the details JSON for each item
      const processedData = data.map((item: any) => ({
        ...item,
        // Parse the details field if it exists and is a string
        details: item.details && typeof item.details === 'string' 
          ? JSON.parse(item.details) 
          : item.details || {
              spiritual: { title: '', description: '' },
              angel: { name: '', message: '' },
              numerology: { title: '', analysis: '' }
            }
      }));
      
      setHistoryItems(processedData);
      
      // Also save to localStorage for backup
      localStorage.setItem(`mirrorTime_history_${user.id}`, JSON.stringify(processedData));
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history. Using local data if available.');
      
      // Fallback to localStorage
      const savedHistory = localStorage.getItem(`mirrorTime_history_${user.id}`);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          setHistoryItems(parsed);
        } catch (e) {
          console.error('Failed to parse local history', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/');
      return;
    }
    
    fetchHistory();
  }, [isLoggedIn, user, setLocation]);
  
  const handleDeleteItem = (id: number) => {
    setItemToDelete(id);
  };
  
  const confirmDelete = async () => {
    if (itemToDelete === null || !user) return;
    
    try {
      // Delete from API
      await apiRequest('DELETE', `/api/history/${itemToDelete}`);
      
      // Update local state
      const newHistory = historyItems.filter(item => item.id !== itemToDelete);
      setHistoryItems(newHistory);
      
      // Also update localStorage
      localStorage.setItem(`mirrorTime_history_${user.id}`, JSON.stringify(newHistory));
      
      toast({
        title: t('history.deleteSuccess'),
        description: t('history.deleteSuccessDescription'),
      });
    } catch (err) {
      console.error('Error deleting history item:', err);
      
      toast({
        title: t('errors.deleteFailed'),
        description: t('errors.deleteFailedDescription'),
        variant: 'destructive',
      });
    } finally {
      setItemToDelete(null);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8 bg-[#F5ECE6] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-marcellus font-bold text-[#B39BC8] mr-3 tracking-wide">{t('history.title')}</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#D8C3A5] hover:text-[#B39BC8] hover:bg-[#F5B7B1]/10 transition-all" 
              onClick={fetchHistory}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} hover-scale`} />
              <span className="sr-only">{t('common.refresh')}</span>
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="border-[#D8C3A5] text-[#D8C3A5] hover:bg-[#F5B7B1]/10 hover:text-[#B39BC8] transition-all"
          >
            <X className="h-4 w-4 mr-2 hover-scale" />
            {t('common.close')}
          </Button>
        </div>
        
        {error && (
          <div className="bg-[#F5B7B1]/20 border border-[#F5B7B1]/50 text-[#B39BC8] px-6 py-4 rounded-[12px] mb-6 shadow-sm fade-in-card">
            <p className="font-light">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <Card className="text-center py-12 bg-white/70 border-[#D8C3A5]/30 rounded-[12px] shadow-card fade-in-card">
            <CardContent className="flex flex-col items-center">
              <RefreshCw className="h-12 w-12 text-[#B39BC8] mb-4 animate-spin" />
              <p className="text-[#D8C3A5] font-light">{t('history.loading')}</p>
            </CardContent>
          </Card>
        ) : historyItems.length === 0 ? (
          <Card className="text-center py-12 bg-white/70 border-[#D8C3A5]/30 rounded-[12px] shadow-card fade-in-card">
            <CardContent className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-[#D8C3A5]/50 mb-4" />
              <p className="text-[#B39BC8]/70 font-light">{t('history.noItems')}</p>
              <p className="text-[#D8C3A5]/70 text-sm mt-2 max-w-md">{t('history.emptyDescription', 'Explore mirror hours and save them to build your history.')}</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            {historyItems.map((item) => (
              <Card key={item.id} className="mb-6 border-[#D8C3A5]/30 rounded-[12px] bg-white/90 shadow-card fade-in-card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xl font-marcellus font-bold text-[#B39BC8]">{item.time}</span>
                      <span className="text-sm font-light text-[#D8C3A5] ml-2 italic">{item.type}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-light text-[#D8C3A5] mr-3">{formatDate(item.savedAt)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#F5B7B1]/70 hover:text-[#F5B7B1] hover:bg-[#F5B7B1]/10 transition-all"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 hover-scale" />
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue={item.details.isAiGenerated ? "analysis" : "spiritual"}>
                    {/* All items have 3-4 base tabs + optional analysis tab if AI-generated */}
                    <TabsList className={`grid w-full ${item.thoughts ? (item.details.isAiGenerated ? 'grid-cols-5' : 'grid-cols-4') : (item.details.isAiGenerated ? 'grid-cols-4' : 'grid-cols-3')} bg-[#FDF8F4]/80 border-[#D8C3A5]/20`}>
                      <TabsTrigger value="spiritual" className="data-[state=active]:bg-white data-[state=active]:text-[#B39BC8] data-[state=active]:shadow-sm">{t('interpretation.spiritualTab')}</TabsTrigger>
                      <TabsTrigger value="angel" className="data-[state=active]:bg-white data-[state=active]:text-[#B39BC8] data-[state=active]:shadow-sm">{t('interpretation.angelTab')}</TabsTrigger>
                      <TabsTrigger value="numerology" className="data-[state=active]:bg-white data-[state=active]:text-[#B39BC8] data-[state=active]:shadow-sm">{t('interpretation.numerologyTab')}</TabsTrigger>
                      {item.details.isAiGenerated && (
                        <TabsTrigger value="analysis" className="data-[state=active]:bg-white data-[state=active]:text-[#B39BC8] data-[state=active]:shadow-sm">{t('analysis.title')}</TabsTrigger>
                      )}
                      {item.thoughts && (
                        <TabsTrigger value="thoughts" className="data-[state=active]:bg-white data-[state=active]:text-[#B39BC8] data-[state=active]:shadow-sm">{t('thoughts.myThoughts')}</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="spiritual" className="mt-4">
                      <div className="bg-[#EFE7DC] p-6 rounded-[12px] border border-[#D8C3A5]/30 shadow-md">
                        <h4 className="font-marcellus text-[#7A5A9E] mb-3 font-semibold text-base">
                          {item.details.spiritual.title}
                        </h4>
                        <p className="text-[#5C4E4E] text-[15.5px] leading-relaxed">
                          {item.details.spiritual.description}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="angel" className="mt-4">
                      <div className="bg-[#EFE7DC] p-6 rounded-[12px] border border-[#D8C3A5]/30 shadow-md">
                        <h4 className="font-marcellus text-[#7A5A9E] mb-3 font-semibold text-base">{item.details.angel.name || t('interpretation.angelTab')}</h4>
                        <p className="text-[#5C4E4E] text-[15.5px] leading-relaxed">{item.details.angel.message || t('history.noContentForTab')}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="numerology" className="mt-4">
                      <div className="bg-[#EFE7DC] p-6 rounded-[12px] border border-[#D8C3A5]/30 shadow-md">
                        <h4 className="font-marcellus text-[#7A5A9E] mb-3 font-semibold text-base">{item.details.numerology.title || t('interpretation.numerologyTab')}</h4>
                        <p className="text-[#5C4E4E] text-[15.5px] leading-relaxed">{item.details.numerology.analysis || t('history.noContentForTab')}</p>
                      </div>
                    </TabsContent>
                    
                    {item.details.isAiGenerated && (
                      <TabsContent value="analysis" className="mt-4">
                        <div className="bg-[#EFE7DC] p-6 rounded-[12px] border border-[#D8C3A5]/30 shadow-md">
                          <h4 className="font-marcellus text-[#7A5A9E] mb-3 font-semibold text-base">{t('analysis.title')}</h4>
                          <p className="text-[#5C4E4E] text-[15.5px] leading-relaxed">{item.details.spiritual.description}</p>
                        </div>
                      </TabsContent>
                    )}
                    
                    {item.thoughts && (
                      <TabsContent value="thoughts" className="mt-4">
                        <div className="bg-[#EFE7DC] p-6 rounded-[12px] border border-[#D8C3A5]/30 shadow-md">
                          <h4 className="font-marcellus text-[#7A5A9E] mb-3 font-semibold text-base">{t('thoughts.experience')}</h4>
                          <p className="text-[#5C4E4E] text-[15.5px] leading-relaxed italic">{item.thoughts}</p>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        )}
      </div>
      
      <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="border-[#D8C3A5]/30 bg-white/95 shadow-card rounded-[12px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-marcellus text-[#B39BC8] text-xl">{t('history.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#D8C3A5]">
              {t('history.deleteConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#D8C3A5]/50 text-[#D8C3A5] hover:bg-[#FDF8F4] hover:text-[#B39BC8] transition-all">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-[#F5B7B1] hover:bg-[#F5B7B1]/80 text-white transition-all"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
