import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  
  // Function to draw text with wrapping
  const wrapText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineCount = 1;

    for (let i = 0; i < words.length; i++) {
      testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, y);
        line = words[i] + ' ';
        y += lineHeight;
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    ctx.fillText(line, x, y);
    return lineCount;
  };
  
  // Create a function to generate the image
  const generateImage = async () => {
    setIsGenerating(true);
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set up colors
      const primaryColor = '#6366f1';
      const textColor = '#4b5563';
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw card background
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(32, 32, canvas.width - 64, canvas.height - 64, 8);
      ctx.fill();
      ctx.stroke();
      
      // Header with logo
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText('MirrorTime', canvas.width / 2, 80);
      
      // Underline
      ctx.fillStyle = primaryColor;
      ctx.fillRect(canvas.width / 2 - 32, 90, 64, 4);
      
      // Time display
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = primaryColor;
      ctx.fillText(formatTimeDisplay(time), canvas.width / 2, 160);
      
      // Time type
      ctx.font = '18px Arial';
      ctx.fillStyle = textColor;
      ctx.fillText(
        `${i18n.language === 'fr' ? 'Heure' : 'Hour'}${interpretation.type === 'mirror' ? 
          (i18n.language === 'fr' ? ' Miroir' : ' Mirror') : 
          interpretation.type === 'reversed' ? 
            (i18n.language === 'fr' ? ' Inversée' : ' Reversed') : 
            ''}`, 
        canvas.width / 2, 
        190
      );
      
      // Get tab content
      const tabContent = (() => {
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
      })();
      
      // Title
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = textColor;
      ctx.fillText(tabContent.title, canvas.width / 2, 250);
      
      // Description - with text wrapping
      ctx.font = '16px Arial';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      
      // Wrap text
      const maxWidth = canvas.width - 128;
      const lineHeight = 24;
      let y = 280;
      
      const lines = wrapText(ctx, tabContent.content, canvas.width / 2, y, maxWidth, lineHeight);
      
      // Footer
      ctx.font = '14px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('www.mirrortime.app', canvas.width / 2, 550);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
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

  return (
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
  );
}