
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import FormError from '@/components/ui/FormError';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, UserIcon, BriefcaseIcon, ShieldCheckIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/context/AuthContext';

const departments = [
  'Human Resources',
  'Finance',
  'IT',
  'Marketing',
  'Operations',
  'Sales',
  'Customer Support',
  'Executive',
];

const SignupForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobTitle: '',
    department: '',
    companyName: '',
    role: 'employee' as UserRole,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDepartmentChange = (value: string) => {
    setFormData({
      ...formData,
      department: value,
    });
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    // Validate form
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setFormError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Create user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            job_title: formData.jobTitle,
            department: formData.department,
            company_name: formData.companyName,
            role: formData.role, // Store the role in user metadata
          },
        },
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: 'Account created successfully!',
        description: 'Welcome to HR Management System',
      });
      
      console.log('Registration successful', data);
      navigate('/login');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setFormError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Work Email *</Label>
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
        <Label htmlFor="password">Password *</Label>
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
        <p className="text-xs text-gray-500">
          Must be at least 8 characters
        </p>
      </div>
      
      <div className="space-y-3">
        <Label>Select Your Role *</Label>
        <RadioGroup 
          defaultValue="employee" 
          value={formData.role}
          onValueChange={(value) => handleRoleChange(value as UserRole)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        >
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="employee" id="employee" />
            <Label htmlFor="employee" className="flex items-center cursor-pointer w-full">
              <BriefcaseIcon className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <div>Employee</div>
                <div className="text-xs text-gray-500">Regular staff member</div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="manager" id="manager" />
            <Label htmlFor="manager" className="flex items-center cursor-pointer w-full">
              <UserIcon className="h-4 w-4 mr-2 text-green-500" />
              <div>
                <div>Manager</div>
                <div className="text-xs text-gray-500">Team leader access</div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="admin" id="admin" />
            <Label htmlFor="admin" className="flex items-center cursor-pointer w-full">
              <ShieldCheckIcon className="h-4 w-4 mr-2 text-purple-500" />
              <div>
                <div>Admin</div>
                <div className="text-xs text-gray-500">Full system access</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select 
            value={formData.department} 
            onValueChange={handleDepartmentChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormError message={formError || ''} />

      <div className="space-y-4">
        <Button
          type="submit"
          className="w-full bg-hr-blue hover:bg-hr-blue/90"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
        
        <p className="text-xs text-center text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </form>
  );
};

export default SignupForm;
