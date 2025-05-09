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
      // Make sure the element is properly rendered before capturing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff',
        logging: true, // Enable logging for debugging
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        removeContainer: true
      });
      
      // Convert to a data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Return the data URL
      setIsGenerating(false);
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      setIsGenerating(false);
      
      // Show error toast
      toast({
        title: t('share.errorTitle'),
        description: t('share.errorGenerating'),
        variant: 'destructive',
      });
      
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
          className="w-[600px] h-[600px]"
          style={{ 
            backgroundColor: "#ffffff",
            padding: "32px"
          }}
        >
          <div 
            style={{
              height: "100%", 
              display: "flex", 
              flexDirection: "column",
              backgroundColor: "#ffffff", 
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "32px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}
          >
            {/* Logo and branding */}
            <div style={{textAlign: "center", marginBottom: "12px"}}>
              <h1 style={{fontSize: "20px", fontWeight: "bold", color: "#6366f1"}}>MirrorTime</h1>
              <div style={{width: "64px", height: "4px", backgroundColor: "#6366f1", margin: "4px auto 0"}}></div>
            </div>
            
            {/* Time display */}
            <div style={{textAlign: "center", margin: "16px 0"}}>
              <h2 style={{fontSize: "48px", fontWeight: "bold", color: "#6366f1"}}>{formatTimeDisplay(time)}</h2>
              <div style={{fontSize: "18px", opacity: "0.75", marginTop: "4px"}}>
                {i18n.language === 'fr' ? 'Heure' : 'Hour'} 
                {interpretation.type === 'mirror' ? 
                  (i18n.language === 'fr' ? ' Miroir' : ' Mirror') : 
                  interpretation.type === 'reversed' ? 
                    (i18n.language === 'fr' ? ' Inversée' : ' Reversed') : 
                    ''}
              </div>
            </div>
            
            {/* Interpretation content */}
            <div style={{
              flex: "1", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center"
            }}>
              <h3 style={{
                fontSize: "20px", 
                fontWeight: "bold", 
                textAlign: "center", 
                marginBottom: "16px",
                color: "#4b5563"
              }}>{tabContent.title}</h3>
              <p style={{
                textAlign: "center", 
                fontSize: "16px", 
                lineHeight: "1.5",
                color: "#4b5563"
              }}>{tabContent.content}</p>
            </div>
            
            {/* Footer */}
            <div style={{
              textAlign: "center", 
              fontSize: "14px", 
              opacity: "0.5", 
              marginTop: "16px"
            }}>
              www.mirrortime.app
            </div>
          </div>
        </div>
      </div>
    </>
  );
}