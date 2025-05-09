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
      // Create canvas - make it taller to fit all three sections
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1200;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set up colors
      const primaryColor = '#6366f1';
      const textColor = '#4b5563';
      const sectionBgColor = '#f8fafc';
      
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
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText('MirrorTime', canvas.width / 2, 80);
      
      // Underline
      ctx.fillStyle = primaryColor;
      ctx.fillRect(canvas.width / 2 - 40, 90, 80, 4);
      
      // Time display
      ctx.font = 'bold 56px Arial';
      ctx.fillStyle = primaryColor;
      ctx.fillText(formatTimeDisplay(time), canvas.width / 2, 160);
      
      // Time type
      ctx.font = '20px Arial';
      ctx.fillStyle = textColor;
      ctx.fillText(
        `${i18n.language === 'fr' ? 'Heure' : 'Hour'}${interpretation.type === 'mirror' ? 
          (i18n.language === 'fr' ? ' Miroir' : ' Mirror') : 
          interpretation.type === 'reversed' ? 
            (i18n.language === 'fr' ? ' Inversée' : ' Reversed') : 
            ''}`, 
        canvas.width / 2, 
        200
      );
      
      // Constants for sections
      const sectionPadding = 20;
      const maxWidth = canvas.width - 128;
      const lineHeight = 24;
      let currentY = 240;
      
      // Draw section divider
      const drawDivider = (y: number) => {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(64, y);
        ctx.lineTo(canvas.width - 64, y);
        ctx.stroke();
      };
      
      // ----- SPIRITUAL SECTION -----
      // Section title
      currentY += 40;
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = primaryColor;
      ctx.fillText(t('interpretation.spiritualTab'), canvas.width / 2, currentY);
      currentY += 20;
      
      // Section background
      ctx.fillStyle = sectionBgColor;
      ctx.beginPath();
      ctx.roundRect(64, currentY, canvas.width - 128, 240, 8);
      ctx.fill();
      
      // Section content
      currentY += sectionPadding + 10;
      
      // Title
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = textColor;
      ctx.fillText(interpretation.spiritual.title, canvas.width / 2, currentY);
      currentY += 30;
      
      // Description - with text wrapping
      ctx.font = '16px Arial';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      
      // Wrap text - description
      const descLines = wrapText(ctx, interpretation.spiritual.description, canvas.width / 2, currentY, maxWidth - 40, lineHeight);
      currentY += lineHeight * descLines + 15;
      
      // Wrap text - guidance
      const guidanceLines = wrapText(ctx, interpretation.spiritual.guidance, canvas.width / 2, currentY, maxWidth - 40, lineHeight);
      currentY += lineHeight * guidanceLines + sectionPadding;
      
      // Move to bottom of section
      currentY = 240 + 40 + 240 + 20;
      
      // ----- ANGEL SECTION -----
      // Section title
      currentY += 20;
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = primaryColor;
      ctx.fillText(t('interpretation.angelTab'), canvas.width / 2, currentY);
      currentY += 20;
      
      // Section background
      ctx.fillStyle = sectionBgColor;
      ctx.beginPath();
      ctx.roundRect(64, currentY, canvas.width - 128, 240, 8);
      ctx.fill();
      
      // Section content
      currentY += sectionPadding + 10;
      
      // Title
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = textColor;
      ctx.fillText(interpretation.angel.name, canvas.width / 2, currentY);
      currentY += 30;
      
      // Message - with text wrapping
      ctx.font = '16px Arial';
      ctx.fillStyle = textColor;
      
      // Wrap text - message
      const messageLines = wrapText(ctx, interpretation.angel.message, canvas.width / 2, currentY, maxWidth - 40, lineHeight);
      currentY += lineHeight * messageLines + 15;
      
      // Guidance title
      ctx.font = 'bold 16px Arial';
      ctx.fillText(t('interpretation.divineGuidance'), canvas.width / 2, currentY);
      currentY += 25;
      
      // Wrap text - guidance
      ctx.font = 'italic 16px Arial';
      const angelGuidanceLines = wrapText(ctx, interpretation.angel.guidance, canvas.width / 2, currentY, maxWidth - 40, lineHeight);
      
      // Move to bottom of section
      currentY = 240 + 40 + 240 + 20 + 20 + 240 + 20;
      
      // ----- NUMEROLOGY SECTION -----
      // Section title
      currentY += 20;
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = primaryColor;
      ctx.fillText(t('interpretation.numerologyTab'), canvas.width / 2, currentY);
      currentY += 20;
      
      // Section background
      ctx.fillStyle = sectionBgColor;
      ctx.beginPath();
      ctx.roundRect(64, currentY, canvas.width - 128, 260, 8);
      ctx.fill();
      
      // Section content
      currentY += sectionPadding + 10;
      
      // Title
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = textColor;
      ctx.fillText(interpretation.numerology.title, canvas.width / 2, currentY);
      currentY += 30;
      
      // Root number & Mirror effect - in two columns
      const colWidth = (maxWidth - 80) / 2;
      
      // Left column - Root number
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(t('interpretation.rootNumber'), 84, currentY);
      currentY += 25;
      
      ctx.font = '16px Arial';
      // Root number value with wrapping
      const rootLines = wrapText(ctx, interpretation.numerology.rootNumber, 84, currentY, colWidth, lineHeight);
      
      // Reset Y for right column
      let rightColY = currentY - 25;
      
      // Right column - Mirror effect
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(t('interpretation.mirrorAmplification'), canvas.width / 2, rightColY);
      rightColY += 25;
      
      ctx.font = '16px Arial';
      // Mirror effect value with wrapping
      const mirrorLines = wrapText(ctx, interpretation.numerology.mirrorEffect, canvas.width / 2, rightColY, colWidth, lineHeight);
      
      // Update currentY to the lower of the two columns
      currentY += Math.max(rootLines, mirrorLines) * lineHeight + 20;
      
      // Analysis
      ctx.textAlign = 'center';
      ctx.font = '16px Arial';
      const analysisLines = wrapText(ctx, interpretation.numerology.analysis, canvas.width / 2, currentY, maxWidth - 40, lineHeight);
      
      // Footer
      ctx.font = '14px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('www.mirrortime.app', canvas.width / 2, canvas.height - 50);
      
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

  // No need for getTabContent function since we now display all three sections

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