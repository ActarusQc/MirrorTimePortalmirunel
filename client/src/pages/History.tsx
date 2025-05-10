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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-playfair font-bold text-primary mr-3">{t('history.title')}</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-mediumgray" 
              onClick={fetchHistory}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">{t('common.refresh')}</span>
            </Button>
          </div>
          <Button variant="outline" onClick={() => setLocation('/')}>
            <X className="h-4 w-4 mr-2" />
            {t('common.close')}
          </Button>
        </div>
        
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <Card className="text-center py-10">
            <CardContent className="flex flex-col items-center">
              <RefreshCw className="h-12 w-12 text-primary mb-3 animate-spin" />
              <p className="text-mediumgray">{t('history.loading')}</p>
            </CardContent>
          </Card>
        ) : historyItems.length === 0 ? (
          <Card className="text-center py-10">
            <CardContent className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-mediumgray">{t('history.noItems')}</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            {historyItems.map((item) => (
              <Card key={item.id} className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-xl font-playfair font-bold text-primary">{item.time}</span>
                      <span className="text-sm text-mediumgray ml-2">{item.type}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-mediumgray mr-3">{formatDate(item.savedAt)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="spiritual">
                    <TabsList className={`grid w-full ${item.thoughts ? 'grid-cols-4' : 'grid-cols-3'}`}>
                      <TabsTrigger value="spiritual">{t('interpretation.spiritualTab')}</TabsTrigger>
                      <TabsTrigger value="angel">{t('interpretation.angelTab')}</TabsTrigger>
                      <TabsTrigger value="numerology">{t('interpretation.numerologyTab')}</TabsTrigger>
                      {item.thoughts && (
                        <TabsTrigger value="thoughts">{t('thoughts.myThoughts')}</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="spiritual" className="mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-primary mb-1">{item.details.spiritual.title}</h4>
                        <p className="text-mediumgray text-sm">{item.details.spiritual.description}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="angel" className="mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-primary mb-1">{item.details.angel.name}</h4>
                        <p className="text-mediumgray text-sm">{item.details.angel.message}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="numerology" className="mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-primary mb-1">{item.details.numerology.title}</h4>
                        <p className="text-mediumgray text-sm">{item.details.numerology.analysis}</p>
                      </div>
                    </TabsContent>
                    
                    {item.thoughts && (
                      <TabsContent value="thoughts" className="mt-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-primary mb-1">{t('thoughts.experience')}</h4>
                          <p className="text-mediumgray text-sm">{item.thoughts}</p>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('history.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('history.deleteConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
