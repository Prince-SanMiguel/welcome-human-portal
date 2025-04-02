
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormError from '@/components/ui/FormError';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    // Validate form
    if (!formData.email || !formData.password) {
      setFormError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, this would be an API call
      // Simulating a successful login after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Logged in successfully!',
        description: 'Welcome back to HR Management System',
      });
      
      // Navigate to dashboard (would be implemented in a full app)
      console.log('Login successful', formData);
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setFormError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Button 
            variant="link" 
            type="button" 
            className="p-0 h-auto text-sm font-normal text-hr-blue"
            onClick={() => {/* Would implement forgot password flow */}}
          >
            Forgot password?
          </Button>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 h-full px-3"
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      <FormError message={formError || ''} />

      <Button
        type="submit"
        className="w-full bg-hr-blue hover:bg-hr-blue/90"
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
};

export default LoginForm;
