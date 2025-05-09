import { useState, useEffect } from 'react';
import hoursData from '@/data/hours.json';
import { Interpretation, getTimeType } from '@/lib/timeUtils';

export function useTimeInterpretation(time: string | null) {
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [timeType, setTimeType] = useState<string>('');

  useEffect(() => {
    if (!time) {
      setInterpretation(null);
      setTimeType('');
      return;
    }

    // Determine the time type
    const type = getTimeType(time);
    setTimeType(type);

    // Find interpretation in the data
    const interpretationData = hoursData[time as keyof typeof hoursData];
    if (interpretationData) {
      setInterpretation({
        ...interpretationData,
        type
      });
    } else {
      // If we don't have specific data for this time, generate a generic interpretation
      setInterpretation({
        type,
        spiritual: {
          title: "Personal Reflection",
          description: `This ${type.toLowerCase()} invites you to pause and reflect on your current life situation.`,
          guidance: "Take a moment to consider what thoughts were in your mind as you noticed this time. The universe may be highlighting these areas for attention."
        },
        angel: {
          name: "Divine Messenger",
          message: `This ${type.toLowerCase()} carries a message unique to your current spiritual journey.`,
          guidance: "Trust your intuition about what this time means for you personally. Pay attention to recurring thoughts or feelings."
        },
        numerology: {
          title: `The Energy of ${time}`,
          rootNumber: "Calculate the sum of all digits to find your personal message.",
          mirrorEffect: `The pattern in ${time} amplifies its energy and significance in your life.`,
          analysis: "This number combination has appeared to draw your attention to patterns in your life that need acknowledgment or change."
        }
      });
    }
  }, [time]);

  return { interpretation, timeType };
}
