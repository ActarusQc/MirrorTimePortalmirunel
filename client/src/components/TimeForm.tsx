import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const timeFormSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (e.g., 10:10)"
  })
});

type TimeFormValues = z.infer<typeof timeFormSchema>;

interface TimeFormProps {
  onSubmit: (time: string) => void;
}

export default function TimeForm({ onSubmit }: TimeFormProps) {
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-white rounded-xl shadow-md p-6">
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="block text-mediumgray mb-2 font-medium">Enter Time (24-hour format)</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type="time"
                    className="time-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                    placeholder="HH:MM"
                  />
                </FormControl>
                <button
                  type="submit"
                  className="absolute right-3 top-3 text-primary hover:text-secondary transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
              <FormMessage className="text-error text-sm mt-1" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
