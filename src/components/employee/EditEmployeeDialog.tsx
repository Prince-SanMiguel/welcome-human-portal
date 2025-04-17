
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface Employee {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  birthdate: string | null;
  hiredate: string | null;
  gender: string | null;
  sepdate: string | null;
}

interface EditEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeUpdated: () => void;
}

const EditEmployeeDialog = ({ 
  employee, 
  open, 
  onOpenChange,
  onEmployeeUpdated 
}: EditEmployeeDialogProps) => {
  const [formData, setFormData] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({...employee});
    }
  }, [employee]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && employee) {
      setFormData({...employee});
    }
  }, [open, employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('employee')
        .update({
          firstname: formData.firstname,
          lastname: formData.lastname,
          birthdate: formData.birthdate,
          hiredate: formData.hiredate,
          gender: formData.gender,
          sepdate: formData.sepdate,
        })
        .eq('empno', formData.empno);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      
      onEmployeeUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employee',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="empno" className="text-right">
                ID
              </Label>
              <Input
                id="empno"
                name="empno"
                value={formData.empno}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstname" className="text-right">
                First Name
              </Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastname" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <Input
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleInputChange}
                className="col-span-3"
                maxLength={1}
                placeholder="M or F"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthdate" className="text-right">
                Birth Date
              </Label>
              <Input
                id="birthdate"
                name="birthdate"
                type="date"
                value={formData.birthdate || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hiredate" className="text-right">
                Hire Date
              </Label>
              <Input
                id="hiredate"
                name="hiredate"
                type="date"
                value={formData.hiredate || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sepdate" className="text-right">
                Separation Date
              </Label>
              <Input
                id="sepdate"
                name="sepdate"
                type="date"
                value={formData.sepdate || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
