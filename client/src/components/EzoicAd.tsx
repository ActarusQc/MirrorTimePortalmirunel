import { useEffect, useState } from 'react';

interface EzoicAdProps {
  placementId: number;
}

export default function EzoicAd({ placementId }: EzoicAdProps) {
  const [showAd, setShowAd] = useState(true);
  
  useEffect(() => {
    // Function to detect if we're in a mobile app WebView
    const isInAppWebView = (): boolean => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Common WebView user agent patterns
      return (
        userAgent.includes('wv') || // Android WebView
        userAgent.includes('mirunel') || // Custom app name if applicable
        (userAgent.includes('mobile') && 
          (userAgent.includes('safari') === false && 
           userAgent.includes('chrome') === false))
      );
    };
    
    // Only show ads if we're not in a WebView
    setShowAd(!isInAppWebView());
    
    // Load the ad if we're showing it
    if (!isInAppWebView() && window.ezstandalone) {
      // Using setTimeout to ensure this runs after the component is mounted
      setTimeout(() => {
        if (window.ezstandalone && window.ezstandalone.cmd) {
          window.ezstandalone.cmd.push(function() {
            window.ezstandalone.showAds(placementId);
          });
        }
      }, 100);
    }
  }, [placementId]);
  
  if (!showAd) return null;
  
  return (
    <div 
      id={`ezoic-pub-ad-placeholder-${placementId}`} 
      className="my-6 mx-auto text-center min-h-[90px]"
    />
  );
}

// Add type definition for the ezstandalone global object
declare global {
  interface Window {
    ezstandalone: {
      cmd: Array<() => void>;
      showAds: (placementId: number) => void;
    };
  }
}