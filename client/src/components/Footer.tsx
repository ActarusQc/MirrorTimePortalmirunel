import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-dark text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-sm text-gray-400">{t('footer.copyright')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
