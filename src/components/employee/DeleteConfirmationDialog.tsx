
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface DeleteConfirmationDialogProps {
  employeeId: string | null;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeDeleted: () => void;
}

const DeleteConfirmationDialog = ({ 
  employeeId, 
  employeeName,
  open, 
  onOpenChange,
  onEmployeeDeleted
}: DeleteConfirmationDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!employeeId) return;
    
    setIsDeleting(true);
    try {
      // Delete employee job history first (due to potential foreign key constraints)
      const { error: historyError } = await supabase
        .from('jobhistory')
        .delete()
        .eq('empno', employeeId);

      if (historyError) throw historyError;

      // Then delete the employee
      const { error } = await supabase
        .from('employee')
        .delete()
        .eq('empno', employeeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      
      onEmployeeDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {employeeName}'s record and all associated job history. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
