import { useState, useEffect } from 'react';
import englishHoursData from '@/data/hours.json';
import frenchHoursData from '@/data/hours.fr.json';
import { Interpretation, getTimeType } from '@/lib/timeUtils';
import { useTranslation } from 'react-i18next';

export function useTimeInterpretation(time: string | null) {
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [timeType, setTimeType] = useState<string>('');
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (!time) {
      setInterpretation(null);
      setTimeType('');
      return;
    }

    // Determine the time type
    const type = getTimeType(time);
    setTimeType(type);

    // Select the appropriate language data
    const hoursData = i18n.language === 'fr' ? frenchHoursData : englishHoursData;

    // Find interpretation in the data
    const interpretationData = hoursData[time as keyof typeof hoursData];
    if (interpretationData) {
      setInterpretation({
        ...interpretationData,
        type
      });
    } else {
      // If we don't have specific data for this time, generate a generic interpretation
      const isFrench = i18n.language === 'fr';
      
      setInterpretation({
        type,
        spiritual: {
          title: isFrench ? "Réflexion Personnelle" : "Personal Reflection",
          description: isFrench 
            ? `Cette ${type.toLowerCase()} vous invite à faire une pause et à réfléchir sur votre situation de vie actuelle.`
            : `This ${type.toLowerCase()} invites you to pause and reflect on your current life situation.`,
          guidance: isFrench
            ? "Prenez un moment pour considérer les pensées qui étaient dans votre esprit lorsque vous avez remarqué cette heure. L'univers pourrait mettre en évidence ces domaines pour votre attention."
            : "Take a moment to consider what thoughts were in your mind as you noticed this time. The universe may be highlighting these areas for attention."
        },
        angel: {
          name: isFrench ? "Messager Divin" : "Divine Messenger",
          message: isFrench
            ? `Cette ${type.toLowerCase()} porte un message unique à votre voyage spirituel actuel.`
            : `This ${type.toLowerCase()} carries a message unique to your current spiritual journey.`,
          guidance: isFrench
            ? "Faites confiance à votre intuition sur ce que cette heure signifie pour vous personnellement. Faites attention aux pensées ou sentiments récurrents."
            : "Trust your intuition about what this time means for you personally. Pay attention to recurring thoughts or feelings."
        },
        numerology: {
          title: isFrench ? `L'Énergie de ${time}` : `The Energy of ${time}`,
          rootNumber: isFrench
            ? "Calculez la somme de tous les chiffres pour trouver votre message personnel."
            : "Calculate the sum of all digits to find your personal message.",
          mirrorEffect: isFrench
            ? `Le motif dans ${time} amplifie son énergie et sa signification dans votre vie.`
            : `The pattern in ${time} amplifies its energy and significance in your life.`,
          analysis: isFrench
            ? "Cette combinaison de nombres est apparue pour attirer votre attention sur des modèles dans votre vie qui nécessitent une reconnaissance ou un changement."
            : "This number combination has appeared to draw your attention to patterns in your life that need acknowledgment or change."
        }
      });
    }
  }, [time, i18n.language]);

  return { interpretation, timeType };
}
