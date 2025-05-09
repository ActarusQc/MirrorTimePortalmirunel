import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSignup: () => void;
}

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long"
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long"
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginModal({ isOpen, onClose, onShowSignup }: LoginModalProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.username, values.password);
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      });
      onClose();
    } catch (error) {
      let message = "Invalid credentials";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Login Failed",
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
          <DialogTitle className="text-white font-medium text-lg">Log In</DialogTitle>
          <Button variant="ghost" className="text-white hover:text-accent p-1 h-auto" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="px-2">
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
                  <div className="flex justify-end mt-1">
                    <Button variant="link" className="text-sm text-primary p-0 h-auto">Forgot password?</Button>
                  </div>
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-6 rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            
            <p className="text-center text-sm text-mediumgray mt-4">
              Don't have an account?{' '}
              <Button 
                variant="link" 
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  onShowSignup();
                }}
                className="text-primary p-0 font-normal"
              >
                Sign up
              </Button>
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
