
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
}

const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 text-sm text-red-500 mt-2">
      <AlertCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};

export default FormError;
