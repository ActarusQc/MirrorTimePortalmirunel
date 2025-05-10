import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Bookmark, PencilIcon, SaveIcon, Sparkles, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Interpretation } from '@/lib/timeUtils';
import { apiRequest } from '@/lib/queryClient';
import ShareInterpretation from '@/components/ShareInterpretation';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimeInterpretationProps {
  time: string;
  interpretation: Interpretation;
  onShowLogin: () => void;
  onShowSignup: () => void;
}

export default function TimeInterpretation({ 
  time, 
  interpretation,
  onShowLogin,
  onShowSignup
}: TimeInterpretationProps) {
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [thoughts, setThoughts] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Get current language
      const currentLanguage = localStorage.getItem('mirrorTime_language') || 'en';
      
      // Call the API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time,
          message: thoughts,
          language: currentLanguage
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAiAnalysis(data.analysis);
      
      toast({
        title: t('analysis.success'),
        description: t('analysis.successDetail'),
      });
      
      // If logged in, save the analysis to history
      if (isLoggedIn && user) {
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
                title: t('analysis.alreadySaved'),
                description: t('analysis.alreadySavedDetail'),
              });
              return;
            }
          }
          
          // Create a special version of details for AI-generated analysis
          const aiDetails = {
            spiritual: {
              title: t('analysis.title'),
              description: data.analysis,
              guidance: ''
            },
            angel: {
              name: t('interpretation.angelTab'),
              message: t('history.noContentForTab'),
              guidance: ''
            },
            numerology: {
              title: t('interpretation.numerologyTab'),
              rootNumber: '',
              mirrorEffect: '',
              analysis: t('history.noContentForTab')
            },
            isAiGenerated: true
          };
          
          // Save to API
          await apiRequest('POST', '/api/history', {
            userId: user.id,
            time,
            type: interpretation.type,
            thoughts: thoughts.trim() ? thoughts : undefined,
            details: aiDetails
          });
          
          // Show success message
          toast({
            title: t('analysis.savedToHistory'),
            description: t('analysis.savedToHistoryDetail'),
          });
        } catch (saveError) {
          console.error('Error saving analysis to history:', saveError);
          toast({
            title: t('errors.saveFailed'),
            description: t('errors.saveFailedDescription'),
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing with OpenAI:', error);
      setAnalysisError(t('analysis.error'));
      
      toast({
        title: t('analysis.error'),
        description: t('analysis.errorDetail'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSaveInterpretation = async () => {
    if (!isLoggedIn || !user) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Save to API
      await apiRequest('POST', '/api/history', {
        userId: user.id,
        time,
        type: interpretation.type,
        thoughts: thoughts.trim() ? thoughts : undefined,
        details: {
          spiritual: interpretation.spiritual,
          angel: interpretation.angel,
          numerology: interpretation.numerology
        }
      });
      
      // Also save to localStorage for quick access
      const historyKey = `mirrorTime_history_${user.id}`;
      const existingHistory = localStorage.getItem(historyKey);
      let history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const newHistoryItem = {
        id: Date.now(),
        time,
        type: interpretation.type,
        thoughts: thoughts.trim() ? thoughts : undefined,
        savedAt: new Date(),
        details: {
          spiritual: interpretation.spiritual,
          angel: interpretation.angel,
          numerology: interpretation.numerology
        }
      };
      
      history = [newHistoryItem, ...history];
      localStorage.setItem(historyKey, JSON.stringify(history));
      
      setIsSaved(true);
      
      toast({
        title: t('toast.savedTitle'),
        description: t('toast.savedDescription', { time }),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving to history:', error);
      
      // Try to extract more detailed error message if available
      let errorMessage = t('errors.saveFailedDescription');
      if (error instanceof Error) {
        console.error('Detailed error:', error.message);
        errorMessage = error.message;
      } else if (error instanceof Response) {
        console.error('Response error status:', error.status);
        try {
          // Try to extract JSON error if available
          const errorData = await error.json();
          console.error('Response error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Could not parse error response as JSON');
        }
      }
      
      toast({
        title: t('errors.saveFailed'),
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="overflow-hidden shadow-card rounded-[12px] fade-in-card border border-[#D8C3A5] bg-white">
        <Tabs defaultValue="spiritual">
          <TabsList className="flex w-full border-b border-[#D8C3A5]/50 bg-[#F5ECE6]/80 p-0 rounded-none">
            <TabsTrigger 
              value="spiritual" 
              className="flex-1 py-4 px-6 font-medium text-[#6A4F6B] data-[state=active]:bg-white data-[state=active]:text-[#9F84B5] data-[state=active]:shadow-sm rounded-none"
            >
              <svg className="w-5 h-5 mr-2 hover-scale text-[#9F84B5]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
              {t('interpretation.spiritualTab')}
            </TabsTrigger>
            <TabsTrigger 
              value="angel" 
              className="flex-1 py-4 px-6 font-medium text-[#6A4F6B] data-[state=active]:bg-white data-[state=active]:text-[#9F84B5] data-[state=active]:shadow-sm rounded-none"
            >
              <svg className="w-5 h-5 mr-2 hover-scale text-[#9F84B5]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>
              {t('interpretation.angelTab')}
            </TabsTrigger>
            <TabsTrigger 
              value="numerology" 
              className="flex-1 py-4 px-6 font-medium text-[#6A4F6B] data-[state=active]:bg-white data-[state=active]:text-[#9F84B5] data-[state=active]:shadow-sm rounded-none"
            >
              <svg className="w-5 h-5 mr-2 hover-scale text-[#9F84B5]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              {t('interpretation.numerologyTab')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="spiritual" className="p-6">
            <div className="md:flex items-start">
              <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6 flex justify-center">
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                  <svg 
                    className="w-24 h-24 md:w-32 md:h-32 text-primary/70" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 2V22M2 12H22M12 12L17 7M12 12L7 17M12 12L7 7M12 12L17 17" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl md:text-2xl font-marcellus font-bold text-[#9F84B5] mb-4 tracking-wide">
                  {interpretation.spiritual.title}
                </h3>
                <p className="text-[#6A4F6B] mb-4 leading-relaxed">
                  {interpretation.spiritual.description}
                </p>
                <div className="bg-[#F5ECE6] p-5 rounded-[12px] mb-3 border border-[#D8C3A5]/40 shadow-sm">
                  <h4 className="font-marcellus font-semibold text-[#9F84B5] mb-2 tracking-wide">{t('interpretation.guidance')}</h4>
                  <p className="text-[#6A4F6B] leading-relaxed">
                    {interpretation.spiritual.guidance}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="angel" className="p-6">
            <div className="md:flex items-start">
              <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6 flex justify-center">
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                  <svg 
                    className="w-24 h-24 md:w-32 md:h-32 text-primary/70" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5 20C5 14.5 8 12 12 12C16 12 19 14.5 19 20" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 14L8 19M8 14L3 19" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M21 14L16 19M16 14L21 19" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl md:text-2xl font-marcellus font-bold text-[#9F84B5] mb-4 tracking-wide">
                  {interpretation.angel.name}
                </h3>
                <p className="text-[#6A4F6B] mb-4 leading-relaxed">
                  {interpretation.angel.message}
                </p>
                <div className="bg-[#F5ECE6] p-5 rounded-[12px] mb-3 border border-[#D8C3A5]/40 shadow-sm">
                  <h4 className="font-marcellus font-semibold text-[#9F84B5] mb-2 tracking-wide">{t('interpretation.divineGuidance')}:</h4>
                  <p className="text-[#6A4F6B] italic leading-relaxed">
                    {interpretation.angel.guidance}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="numerology" className="p-6">
            <div className="md:flex items-start">
              <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6 flex justify-center">
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                  <svg 
                    className="w-24 h-24 md:w-32 md:h-32 text-primary/70" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 8.5H12V18" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15 15.5H9" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 6V8.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl md:text-2xl font-marcellus font-bold text-[#9F84B5] mb-4 tracking-wide">
                  {interpretation.numerology.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="bg-[#F5ECE6] p-4 rounded-[12px] border border-[#D8C3A5]/40 shadow-sm">
                    <h4 className="font-marcellus font-semibold text-[#9F84B5] mb-2 tracking-wide">{t('interpretation.rootNumber')}</h4>
                    <p className="text-[#6A4F6B] leading-relaxed">
                      {interpretation.numerology.rootNumber}
                    </p>
                  </div>
                  <div className="bg-[#F5ECE6] p-4 rounded-[12px] border border-[#D8C3A5]/40 shadow-sm">
                    <h4 className="font-marcellus font-semibold text-[#9F84B5] mb-2 tracking-wide">{t('interpretation.mirrorAmplification')}</h4>
                    <p className="text-[#6A4F6B] leading-relaxed">
                      {interpretation.numerology.mirrorEffect}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-[12px] border border-[#D8C3A5] shadow-sm">
                  <p className="text-[#6A4F6B] leading-relaxed">
                    {interpretation.numerology.analysis}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <CardFooter className="px-6 pb-6 pt-0 flex flex-col">
            <div className="flex flex-col space-y-4 w-full">
              {/* Thoughts input - moved to the top */}
              {isLoggedIn && (
                <div className="border rounded-md p-4 bg-card">
                  <div className="space-y-2">
                    <Label htmlFor="thoughts">
                      <div className="flex items-center">
                        <PencilIcon className="h-4 w-4 mr-2" />
                        {t('thoughts.prompt')}
                      </div>
                    </Label>
                    <Textarea
                      id="thoughts"
                      placeholder={t('thoughts.placeholder')}
                      value={thoughts}
                      onChange={(e) => setThoughts(e.target.value)}
                      className="min-h-[100px]"
                      disabled={isSaving || isSaved}
                    />
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Analyze button */}
                <Button 
                  onClick={handleAnalyze} 
                  className="w-full bg-[#C7CEB2] text-[#5C4E4E] py-3 hover:bg-[#B5C098] transition-colors font-medium shadow-md"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      {t('analysis.analyzing')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Sparkles className="h-5 w-5 mr-2 hover-scale" />
                      {t('analysis.button')}
                    </span>
                  )}
                </Button>

                {/* Save button */}
                {isLoggedIn ? (
                  <Button 
                    onClick={handleSaveInterpretation} 
                    className="w-full bg-[#9F84B5] text-white py-3 hover:bg-[#8A6C9F] transition-colors font-medium shadow-md"
                    disabled={isSaving || isSaved}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2 text-lg">⧖</span>
                        {t('thoughts.saving')}
                      </span>
                    ) : isSaved ? (
                      <span className="flex items-center justify-center">
                        <SaveIcon className="h-5 w-5 mr-2 hover-scale" />
                        {t('thoughts.saved.button')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Bookmark className="h-5 w-5 mr-2 hover-scale" />
                        {t('interpretation.saveButton')}
                      </span>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button disabled className="w-full bg-[#9F84B5] text-white py-3 transition-colors opacity-70 font-medium shadow-sm">
                      <Bookmark className="h-5 w-5 mr-2" />
                      {t('interpretation.saveButton')}
                    </Button>
                    <p className="text-center text-sm text-[#6A4F6B] font-medium mt-1 mb-3">
                      <button onClick={onShowLogin} className="text-[#9F84B5] hover:text-[#8A6C9F] font-semibold hover:underline transition-colors">{t('auth.login')}</button> {t('common.or')}{' '}
                      <button onClick={onShowSignup} className="text-[#9F84B5] hover:text-[#8A6C9F] font-semibold hover:underline transition-colors">{t('auth.signup')}</button> {t('interpretation.toSave')}
                    </p>
                  </>
                )}
                
                {/* Share interpretation component */}
                <ShareInterpretation time={time} interpretation={interpretation} />
              </div>

              {/* AI Analysis result */}
              {(aiAnalysis || analysisError) && (
                <div className="mt-6 fade-in-card">
                  {analysisError ? (
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                      <AlertDescription className="text-red-700">
                        {analysisError}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="bg-[#EFE7DC] p-6 rounded-[12px] border border-[#D8C3A5]/30 shadow-md">
                      <h4 className="font-marcellus text-[#7A5A9E] mb-3 font-semibold text-base">
                        {t('analysis.title')}
                      </h4>
                      <p className="text-[#5C4E4E] text-[15.5px] leading-relaxed whitespace-pre-wrap">
                        {aiAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardFooter>
        </Tabs>
      </Card>
    </motion.section>
  );
}
