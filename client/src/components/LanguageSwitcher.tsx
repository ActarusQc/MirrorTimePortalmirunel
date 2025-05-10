import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  
  // Update current language when i18n.language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('mirrorTime_language', lng);
    setCurrentLanguage(lng);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-[#9F84B5] hover:bg-[#8A6C9F] border-1 border-white/30 text-white rounded-full shadow-sm" 
          aria-label="Change language"
        >
          <Globe className="h-5 w-5 hover-scale" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-[#D8C3A5]/50 bg-white/95 shadow-card">
        <DropdownMenuItem
          className={currentLanguage === 'en' ? 'bg-[#F5ECE6] text-[#6A4F6B] font-medium' : 'text-[#6A4F6B] hover:bg-[#F5ECE6]'}
          onClick={() => changeLanguage('en')}
        >
          <span>🇬🇧 {t('language.english')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={currentLanguage === 'fr' ? 'bg-[#F5ECE6] text-[#6A4F6B] font-medium' : 'text-[#6A4F6B] hover:bg-[#F5ECE6]'}
          onClick={() => changeLanguage('fr')}
        >
          <span>🇫🇷 {t('language.french')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}