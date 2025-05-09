import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface TimeResultProps {
  time: string;
  type: string;
}

export default function TimeResult({ time, type }: TimeResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4"
    >
      <Card className="shadow-md">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            <h3 className="text-3xl md:text-4xl font-bold text-primary font-playfair">{time}</h3>
            <p className="text-secondary font-medium mt-1">{type}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
