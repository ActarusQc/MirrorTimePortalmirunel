import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LogOut, History } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import logoImage from '../assets/logo-mirunel.png';

export default function Header() {
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { t } = useTranslation();
  
  const handleShowLoginModal = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleShowSignupModal = () => {
    setShowSignup(true);
    setShowLogin(false);
  };
  
  const handleShowHistory = () => {
    setLocation('/history');
  };
  
  const handleLogout = () => {
    logout();
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="bg-[#D8C3A5] text-[#6A4F6B] shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer bg-[#9F84B5] px-4 py-2 rounded-full shadow-sm border border-white/20" 
          onClick={() => setLocation('/')}
        >
          <img 
            src={logoImage} 
            alt="Mirunel Logo" 
            className="h-7 md:h-9 hover-scale brightness-[1.5] filter drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]" 
          />
        </div>
        
        {isLoggedIn && user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm md:text-base hidden md:inline">{user.username}</span>
            <Button 
              onClick={handleShowHistory} 
              variant="outline" 
              className="header-button bg-[#9F84B5] hover:bg-[#8A6C9F] border-1 border-white/30 text-white font-medium shadow-sm"
            >
              <History className="h-5 w-5 md:mr-2 hover-scale" />
              <span className="hidden md:inline">{t('header.historyButton')}</span>
            </Button>
            
            <LanguageSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-0 h-10 w-10 rounded-full border-2 border-[#9F84B5]/70 shadow-sm" 
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8 bg-[#9F84B5] cursor-pointer">
                    <AvatarFallback className="text-white font-bold">{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-[#D8C3A5]/50 bg-white/95 shadow-md">
                <DropdownMenuItem className="md:hidden hover:bg-[#F5ECE6] focus:bg-[#F5ECE6]" onClick={handleShowHistory}>
                  <History className="h-5 w-5 mr-2 text-[#9F84B5]" />
                  <span className="text-[#6A4F6B] font-medium">{t('header.historyButton')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden bg-[#D8C3A5]/30" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="hover:bg-[#F5ECE6] focus:bg-[#F5ECE6]"
                >
                  <LogOut className="h-5 w-5 mr-2 text-[#9F84B5]" />
                  <span className="text-[#6A4F6B] font-medium">{t('header.logoutButton')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center">
            <LanguageSwitcher />
            <Button
              onClick={handleShowLoginModal}
              variant="ghost"
              className="text-sm md:text-base bg-white bg-opacity-25 hover:bg-opacity-40 text-white mr-3 font-medium shadow-sm px-5 py-2 border border-white/20"
            >
              {t('header.loginButton')}
            </Button>
            <Button
              onClick={handleShowSignupModal}
              className="text-sm md:text-base bg-[#F5B7B1] text-[#6A4F6B] hover:bg-[#F5B7B1]/90 font-medium shadow-sm px-5 py-2"
            >
              {t('header.signupButton')}
            </Button>
          </div>
        )}
      </div>
      
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onShowSignup={handleShowSignupModal}
      />
      
      <SignupModal 
        isOpen={showSignup} 
        onClose={() => setShowSignup(false)} 
        onShowLogin={handleShowLoginModal} 
      />
    </header>
  );
}
