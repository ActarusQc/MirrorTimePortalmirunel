import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Interpretation } from '@/lib/timeUtils';
import { formatTimeDisplay } from '@/lib/utils';

interface ShareInterpretationProps {
  time: string;
  interpretation: Interpretation;
}

export default function ShareInterpretation({ time, interpretation }: ShareInterpretationProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  
  // Create a function to generate and download the image
  const generateImage = async () => {
    if (!shareCardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      // Convert to a data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Return the data URL
      setIsGenerating(false);
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      setIsGenerating(false);
      return null;
    }
  };

  // Handle download
  const handleDownload = async () => {
    const imageUrl = await generateImage();
    if (!imageUrl) {
      toast({
        title: t('share.errorTitle'),
        description: t('share.errorGenerating'),
        variant: 'destructive',
      });
      return;
    }
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `mirror-hour-${time.replace(':', '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t('share.downloadedTitle'),
      description: t('share.downloadedDescription'),
    });
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    const imageUrl = await generateImage();
    if (!imageUrl) {
      toast({
        title: t('share.errorTitle'),
        description: t('share.errorGenerating'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Create an image blob from the data URL
      const blob = await (await fetch(imageUrl)).blob();
      
      // Copy to clipboard using the Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
      
      toast({
        title: t('share.copiedTitle'),
        description: t('share.copiedDescription'),
      });
    } catch (error) {
      console.error('Failed to copy image:', error);
      
      toast({
        title: t('share.errorTitle'),
        description: t('share.errorCopying'),
        variant: 'destructive',
      });
    }
  };

  // Handle sharing (uses Web Share API if available)
  const handleShare = async () => {
    const imageUrl = await generateImage();
    if (!imageUrl) {
      toast({
        title: t('share.errorTitle'),
        description: t('share.errorGenerating'),
        variant: 'destructive',
      });
      return;
    }
    
    if (navigator.share) {
      try {
        // Convert data URL to Blob for sharing
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], `mirror-hour-${time.replace(':', '-')}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: t('share.shareTitle', { time }),
          text: t('share.shareText'),
          files: [file]
        });
        
        toast({
          title: t('share.sharedTitle'),
          description: t('share.sharedDescription'),
        });
      } catch (err) {
        console.error('Error sharing:', err);
        
        // If sharing failed but not because user canceled
        if (err instanceof Error && err.name !== 'AbortError') {
          toast({
            title: t('share.errorTitle'),
            description: t('share.errorSharing'),
            variant: 'destructive',
          });
        }
      }
    } else {
      // Fallback if Web Share API is not available
      handleCopyToClipboard();
    }
  };

  // Get current tab content based on active tab
  const getTabContent = () => {
    if (interpretation.type === 'mirror') {
      return {
        title: interpretation.spiritual.title,
        content: interpretation.spiritual.description,
      };
    } else if (interpretation.type === 'reversed') {
      return {
        title: interpretation.angel.name,
        content: interpretation.angel.message,
      };
    } else {
      return {
        title: interpretation.numerology.title,
        content: interpretation.numerology.analysis,
      };
    }
  };

  const tabContent = getTabContent();

  return (
    <>
      <div className="mt-6 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary text-white hover:bg-secondary transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              {t('share.shareButton')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={handleDownload} disabled={isGenerating}>
              <Download className="h-4 w-4 mr-2" />
              {t('share.download')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyToClipboard} disabled={isGenerating}>
              {isLinkCopied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {isLinkCopied ? t('share.copied') : t('share.copyImage')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare} disabled={isGenerating}>
              <Share2 className="h-4 w-4 mr-2" />
              {t('share.share')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hidden shareable image card that will be captured */}
      <div className="hidden">
        <div 
          ref={shareCardRef} 
          className="w-[600px] h-[600px] p-8 bg-gradient-to-br from-primary/5 to-secondary/10"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <div className="h-full flex flex-col bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
            {/* Background subtle pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-repeat" style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${interpretation.type === 'mirror' ? '9C92AC' : interpretation.type === 'reversed' ? 'A98467' : '7EA1C4'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            
            {/* Logo and branding */}
            <div className="text-center mb-3">
              <h1 className="text-xl font-bold text-primary">MirrorTime</h1>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-1"></div>
            </div>
            
            {/* Time display */}
            <div className="text-center my-4">
              <h2 className="text-5xl font-bold text-primary">{formatTimeDisplay(time)}</h2>
              <div className="text-lg opacity-75 mt-1">
                {i18n.language === 'fr' ? 'Heure' : 'Hour'} 
                {interpretation.type === 'mirror' ? 
                  (i18n.language === 'fr' ? ' Miroir' : ' Mirror') : 
                  interpretation.type === 'reversed' ? 
                    (i18n.language === 'fr' ? ' Inversée' : ' Reversed') : 
                    ''}
              </div>
            </div>
            
            {/* Interpretation content */}
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-center mb-4">{tabContent.title}</h3>
              <p className="text-center text-md leading-relaxed">{tabContent.content}</p>
            </div>
            
            {/* Footer */}
            <div className="text-center text-sm opacity-50 mt-4">
              www.mirrortime.app
            </div>
          </div>
        </div>
      </div>
    </>
  );
}