import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

interface TimeResultProps {
  time: string;
  type: string;
}

export default function TimeResult({ time, type }: TimeResultProps) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-6"
    >
      <Card className="shadow-card rounded-[12px] border-[#D8C3A5]/30 transition-all duration-300 hover:shadow-lg">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            <h3 className="text-3xl md:text-4xl font-medium text-primary tracking-wide">{time}</h3>
            {type && (
              <div className="mt-2 flex justify-center items-center">
                <span className="text-xs uppercase tracking-wider text-[#B39BC8]/70 bg-[#B39BC8]/10 px-3 py-1 rounded-full">
                  {type === 'mirror' ? t('timeTypes.mirrorHour') : type === 'reversed' ? t('timeTypes.reversedHour') : t('timeTypes.regularHour')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
