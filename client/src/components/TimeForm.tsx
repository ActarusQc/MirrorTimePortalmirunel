import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const getTimeFormSchema = (t: any) => z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: t('errors.invalidTime')
  })
});

interface TimeFormProps {
  onSubmit: (time: string) => void;
}

export default function TimeForm({ onSubmit }: TimeFormProps) {
  const { t } = useTranslation();
  const timeFormSchema = getTimeFormSchema(t);
  type TimeFormValues = z.infer<typeof timeFormSchema>;
  
  const form = useForm<TimeFormValues>({
    resolver: zodResolver(timeFormSchema),
    defaultValues: {
      time: ''
    }
  });

  const handleSubmit = (values: TimeFormValues) => {
    onSubmit(values.time);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-white rounded-[12px] shadow-card p-6 border border-[#D8C3A5] transition-all duration-300 hover:shadow-lg fade-in-card">
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="block text-[#6A4F6B] mb-3 font-semibold tracking-wide text-base">{t('timeForm.label')}</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type="time"
                    className="time-input w-full px-4 py-3 border-2 border-[#D8C3A5] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#9F84B5]/30 focus:border-[#9F84B5] text-xl bg-[#F5ECE6]/30 shadow-form text-[#6A4F6B] font-medium"
                    placeholder="HH:MM"
                  />
                </FormControl>
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-[#9F84B5] hover:text-[#8A6C9F] transition-all duration-300 hover-scale"
                  aria-label={t('timeForm.searchAriaLabel')}
                >
                  <Search className="h-6 w-6" />
                </button>
              </div>
              <FormMessage className="text-[#F44336] text-sm mt-2 font-medium" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
