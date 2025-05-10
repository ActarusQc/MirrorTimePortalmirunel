import { useTranslation } from 'react-i18next';
import logoImage from '../assets/logo-mirunel.png';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-[#B39BC8] text-white py-6 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <img 
              src={logoImage} 
              alt="Mirunel Logo" 
              className="h-5 w-auto opacity-80" 
            />
            <span className="text-sm text-white/90 font-light tracking-wide">{t('footer.copyright')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
