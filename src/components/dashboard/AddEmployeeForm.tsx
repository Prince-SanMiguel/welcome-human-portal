
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddEmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
}

const AddEmployeeForm = ({ open, onOpenChange, onEmployeeAdded }: AddEmployeeFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    empno: '',
    firstname: '',
    lastname: '',
    birthdate: '',
    hiredate: new Date().toISOString().split('T')[0],
    gender: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert employee record
      const { data: employee, error: employeeError } = await supabase
        .from('employee')
        .insert([formData])
        .select()
        .single();

      if (employeeError) throw employeeError;

      // Insert initial job history if needed
      if (formData.empno) {
        const { error: jobHistoryError } = await supabase
          .from('jobhistory')
          .insert([{
            empno: formData.empno,
            jobcode: 'NEW', // Default job code
            deptcode: 'TRAIN', // Default department code
            effdate: formData.hiredate,
            salary: 0 // Default salary
          }]);

        if (jobHistoryError) {
          console.error('Error adding job history:', jobHistoryError);
          // Continue anyway as the employee was added successfully
        }
      }

      toast({
        title: 'Employee Added',
        description: `Successfully added ${formData.firstname} ${formData.lastname}`,
      });

      // Reset form
      setFormData({
        empno: '',
        firstname: '',
        lastname: '',
        birthdate: '',
        hiredate: new Date().toISOString().split('T')[0],
        gender: ''
      });

      // Close modal and refresh data
      onOpenChange(false);
      onEmployeeAdded();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add employee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the details of the new employee below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="empno">Employee ID</Label>
              <Input 
                id="empno" 
                name="empno" 
                value={formData.empno} 
                onChange={handleChange} 
                placeholder="e.g. EMP001" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input 
                id="firstname" 
                name="firstname" 
                value={formData.firstname} 
                onChange={handleChange} 
                placeholder="First Name" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input 
                id="lastname" 
                name="lastname" 
                value={formData.lastname} 
                onChange={handleChange} 
                placeholder="Last Name" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input 
                id="gender" 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                placeholder="M or F" 
                maxLength={1} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate">Birth Date</Label>
              <Input 
                id="birthdate" 
                name="birthdate" 
                type="date" 
                value={formData.birthdate} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiredate">Hire Date</Label>
              <Input 
                id="hiredate" 
                name="hiredate" 
                type="date" 
                value={formData.hiredate} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeForm;
