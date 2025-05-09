import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowLogin: () => void;
}

const signupSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters long"
  }),
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long"
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long"
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupModal({ isOpen, onClose, onShowLogin }: SignupModalProps) {
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
    }
  });

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      await register(values.username, values.password, values.email, values.fullName);
      toast({
        title: "Account Created",
        description: "Your account has been created successfully",
      });
      onClose();
    } catch (error) {
      let message = "Failed to create account";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gradient-bg px-6 py-4 flex justify-between items-center rounded-t-lg -mt-4 -mx-4 mb-4">
          <DialogTitle className="text-white font-medium text-lg">Create Account</DialogTitle>
          <Button variant="ghost" className="text-white hover:text-accent p-1 h-auto" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignup)} className="px-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-mediumgray font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-mediumgray font-medium">Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-mediumgray font-medium">Username</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-mediumgray font-medium">Password</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password"
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-mediumgray mt-1">Must be at least 8 characters long</p>
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-6 rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <p className="text-center text-sm text-mediumgray mt-4">
              Already have an account?{' '}
              <Button 
                variant="link" 
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  onShowLogin();
                }}
                className="text-primary p-0 font-normal"
              >
                Log in
              </Button>
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
