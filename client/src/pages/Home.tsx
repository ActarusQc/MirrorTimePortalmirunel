import { useState } from "react";
import { useTranslation } from "react-i18next";
import TimeForm from "@/components/TimeForm";
import TimeResult from "@/components/TimeResult";
import TimeInterpretation from "@/components/TimeInterpretation";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { useAuth } from "@/hooks/useAuth";
import { useTimeInterpretation } from "@/hooks/useTimeInterpretation";
import { Interpretation } from "@/lib/timeUtils";

export default function Home() {
  const { t } = useTranslation();
  const [time, setTime] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { isLoggedIn } = useAuth();
  const { interpretation, timeType } = useTimeInterpretation(time);

  const handleTimeSubmit = (timeValue: string) => {
    setTime(timeValue);
  };

  const handleShowLoginModal = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleShowSignupModal = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Time input section */}
      <section className="max-w-md mx-auto mb-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-medium text-primary mb-3 tracking-wide">{t('home.title')}</h2>
          <p className="text-muted-foreground text-sm md:text-base">{t('home.subtitle')}</p>
        </div>
        
        <TimeForm onSubmit={handleTimeSubmit} />

        {time && (
          <TimeResult 
            time={time} 
            type={timeType}
          />
        )}
      </section>

      {/* Interpretation section */}
      {time && interpretation && (
        <TimeInterpretation 
          time={time}
          interpretation={interpretation}
          onShowLogin={handleShowLoginModal}
          onShowSignup={handleShowSignupModal}
        />
      )}

      {/* Auth modals */}
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
    </div>
  );
}
