import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddEmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
}

interface Department {
  deptcode: string;
  deptname: string | null;
}

const AddEmployeeForm = ({ open, onOpenChange, onEmployeeAdded }: AddEmployeeFormProps) => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lastEmpNo, setLastEmpNo] = useState<string>('EMP000');
  const [formData, setFormData] = useState({
    empno: '',
    firstname: '',
    lastname: '',
    birthdate: '',
    hiredate: new Date().toISOString().split('T')[0],
    gender: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDepartments();
      generateEmployeeId();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('department')
        .select('*')
        .order('deptname');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load departments',
        variant: 'destructive',
      });
    }
  };

  const generateEmployeeId = async () => {
    try {
      const { data, error } = await supabase
        .from('employee')
        .select('empno')
        .order('empno', { ascending: false })
        .limit(1);

      if (error) throw error;

      let newEmpNo = 'EMP001';
      
      if (data && data.length > 0) {
        const lastId = data[0].empno;
        if (lastId && lastId.startsWith('EMP')) {
          const numPart = parseInt(lastId.substring(3), 10);
          if (!isNaN(numPart)) {
            const newNum = numPart + 2;
            newEmpNo = `EMP${newNum.toString().padStart(3, '0')}`;
          }
        }
      }
      
      setFormData(prev => ({ ...prev, empno: newEmpNo }));
      setLastEmpNo(newEmpNo);
    } catch (error: any) {
      console.error('Error generating employee ID:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate employee ID',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, department: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: employee, error: employeeError } = await supabase
        .from('employee')
        .insert([{
          empno: formData.empno,
          firstname: formData.firstname,
          lastname: formData.lastname,
          birthdate: formData.birthdate,
          hiredate: formData.hiredate,
          gender: formData.gender
        }])
        .select()
        .single();

      if (employeeError) throw employeeError;

      if (formData.empno) {
        const { error: jobHistoryError } = await supabase
          .from('jobhistory')
          .insert([{
            empno: formData.empno,
            jobcode: 'NEW',
            deptcode: formData.department || 'TRAIN',
            effdate: formData.hiredate,
            salary: 0
          }]);

        if (jobHistoryError) {
          console.error('Error adding job history:', jobHistoryError);
        }
      }

      toast({
        title: 'Employee Added',
        description: `Successfully added ${formData.firstname} ${formData.lastname}`,
      });

      setFormData({
        empno: lastEmpNo,
        firstname: '',
        lastname: '',
        birthdate: '',
        hiredate: new Date().toISOString().split('T')[0],
        gender: '',
        department: ''
      });

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
              <Label htmlFor="empno">Employee ID (Auto-generated)</Label>
              <Input 
                id="empno" 
                name="empno" 
                value={formData.empno} 
                readOnly 
                className="bg-gray-100"
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
            <div className="space-y-2 col-span-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department} 
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.deptcode} value={dept.deptcode}>
                      {dept.deptname || dept.deptcode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
