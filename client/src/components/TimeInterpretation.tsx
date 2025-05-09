import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Bookmark } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Interpretation } from '@/lib/timeUtils';

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
  
  const handleSaveInterpretation = () => {
    if (!isLoggedIn || !user) {
      return;
    }
    
    // Save to localStorage
    const historyKey = `mirrorTime_history_${user.id}`;
    const existingHistory = localStorage.getItem(historyKey);
    let history = existingHistory ? JSON.parse(existingHistory) : [];
    
    const newHistoryItem = {
      id: Date.now(),
      time,
      type: interpretation.type,
      savedAt: new Date(),
      details: {
        spiritual: interpretation.spiritual,
        angel: interpretation.angel,
        numerology: interpretation.numerology
      }
    };
    
    history = [newHistoryItem, ...history];
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    toast({
      title: t('toast.savedTitle'),
      description: t('toast.savedDescription', { time }),
      duration: 3000,
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="overflow-hidden shadow-md">
        <Tabs defaultValue="spiritual">
          <TabsList className="flex w-full border-b border-gray-200 bg-transparent p-0 rounded-none">
            <TabsTrigger 
              value="spiritual" 
              className="flex-1 py-3 px-4 font-medium data-[state=active]:tab-active data-[state=active]:shadow-none rounded-none"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
              {t('interpretation.spiritualTab')}
            </TabsTrigger>
            <TabsTrigger 
              value="angel" 
              className="flex-1 py-3 px-4 font-medium data-[state=active]:tab-active data-[state=active]:shadow-none rounded-none"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>
              {t('interpretation.angelTab')}
            </TabsTrigger>
            <TabsTrigger 
              value="numerology" 
              className="flex-1 py-3 px-4 font-medium data-[state=active]:tab-active data-[state=active]:shadow-none rounded-none"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
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
                <h3 className="text-xl md:text-2xl font-playfair font-bold text-primary mb-3">
                  {interpretation.spiritual.title}
                </h3>
                <p className="text-mediumgray mb-4">
                  {interpretation.spiritual.description}
                </p>
                <p className="text-mediumgray">
                  {interpretation.spiritual.guidance}
                </p>
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
                <h3 className="text-xl md:text-2xl font-playfair font-bold text-primary mb-3">
                  {interpretation.angel.name}
                </h3>
                <p className="text-mediumgray mb-4">
                  {interpretation.angel.message}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-primary mb-2">{t('interpretation.divineGuidance')}:</h4>
                  <p className="text-mediumgray italic">
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
                <h3 className="text-xl md:text-2xl font-playfair font-bold text-primary mb-3">
                  {interpretation.numerology.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-primary mb-1">{t('interpretation.rootNumber')}</h4>
                    <p className="text-mediumgray">
                      {interpretation.numerology.rootNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-primary mb-1">{t('interpretation.mirrorAmplification')}</h4>
                    <p className="text-mediumgray">
                      {interpretation.numerology.mirrorEffect}
                    </p>
                  </div>
                </div>
                <p className="text-mediumgray">
                  {interpretation.numerology.analysis}
                </p>
              </div>
            </div>
          </TabsContent>

          <CardFooter className="px-6 pb-6 pt-0 flex flex-col">
            {isLoggedIn ? (
              <Button onClick={handleSaveInterpretation} className="w-full bg-primary text-white py-6 hover:bg-secondary transition-colors">
                <Bookmark className="h-4 w-4 mr-2" />
                {t('interpretation.saveButton')}
              </Button>
            ) : (
              <>
                <Button disabled className="w-full bg-primary text-white py-6 transition-colors opacity-70 mb-2">
                  <Bookmark className="h-4 w-4 mr-2" />
                  {t('interpretation.saveButton')}
                </Button>
                <p className="text-center text-sm text-mediumgray">
                  <button onClick={onShowLogin} className="text-primary hover:underline">{t('auth.login')}</button> {t('common.or')}{' '}
                  <button onClick={onShowSignup} className="text-primary hover:underline">{t('auth.signup')}</button> {t('interpretation.toSave')}
                </p>
              </>
            )}
          </CardFooter>
        </Tabs>
      </Card>
    </motion.section>
  );
}
