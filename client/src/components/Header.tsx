import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';
import { LogOut, History, Clock } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Header() {
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  
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
    <header className="gradient-bg text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => setLocation('/')}
        >
          <Clock className="h-6 w-6 text-accent" />
          <h1 className="text-xl md:text-2xl font-playfair font-bold">MirrorTime</h1>
        </div>
        
        {isLoggedIn && user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm md:text-base hidden md:inline">{user.username}</span>
            <Button 
              onClick={handleShowHistory} 
              variant="outline" 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 border-0 text-white"
            >
              <History className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">History</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 rounded-full" aria-label="User menu">
                  <Avatar className="h-8 w-8 bg-primary/30 cursor-pointer">
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="md:hidden" onClick={handleShowHistory}>
                  <History className="h-4 w-4 mr-2" />
                  <span>History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center">
            <Button
              onClick={handleShowLoginModal}
              variant="ghost"
              className="text-sm md:text-base bg-white bg-opacity-20 hover:bg-opacity-30 text-white mr-2"
            >
              Log In
            </Button>
            <Button
              onClick={handleShowSignupModal}
              className="text-sm md:text-base bg-accent text-dark hover:bg-opacity-90"
            >
              Sign Up
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
