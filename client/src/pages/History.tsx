import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
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
import { X, Clock, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: number;
  time: string;
  type: string;
  savedAt: Date;
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
  
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/');
      return;
    }
    
    // Load history from localStorage
    const loadHistory = () => {
      if (!user) return;
      
      const savedHistory = localStorage.getItem(`mirrorTime_history_${user.id}`);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          setHistoryItems(parsed);
        } catch (e) {
          console.error('Failed to parse history', e);
        }
      }
    };
    
    loadHistory();
  }, [isLoggedIn, user, setLocation]);
  
  const handleDeleteItem = (id: number) => {
    setItemToDelete(id);
  };
  
  const confirmDelete = () => {
    if (itemToDelete === null || !user) return;
    
    const newHistory = historyItems.filter(item => item.id !== itemToDelete);
    setHistoryItems(newHistory);
    
    // Save to localStorage
    localStorage.setItem(`mirrorTime_history_${user.id}`, JSON.stringify(newHistory));
    setItemToDelete(null);
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
          <h1 className="text-2xl font-playfair font-bold text-primary">Your History</h1>
          <Button variant="outline" onClick={() => setLocation('/')}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
        
        {historyItems.length === 0 ? (
          <Card className="text-center py-10">
            <CardContent className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-mediumgray">You haven't saved any interpretations yet</p>
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
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
                      <TabsTrigger value="angel">Angel</TabsTrigger>
                      <TabsTrigger value="numerology">Numerology</TabsTrigger>
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
            <AlertDialogTitle>Delete interpretation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this interpretation from your history?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
