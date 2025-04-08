
import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/context/AuthContext";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (value: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <RadioGroup 
      value={value}
      onValueChange={(value) => onChange(value as UserRole)}
      className="flex flex-col sm:flex-row gap-6 pt-2"
      disabled={disabled}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="employee" id="employee" />
        <Label htmlFor="employee" className="cursor-pointer">
          Employee
          <p className="text-xs text-gray-500 font-normal mt-1">
            Can manage personal info and attendance
          </p>
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="manager" id="manager" />
        <Label htmlFor="manager" className="cursor-pointer">
          Manager
          <p className="text-xs text-gray-500 font-normal mt-1">
            Can review and approve team attendance and leave
          </p>
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="admin" id="admin" />
        <Label htmlFor="admin" className="cursor-pointer">
          Admin
          <p className="text-xs text-gray-500 font-normal mt-1">
            Full access to manage users, payroll, and reports
          </p>
        </Label>
      </div>
    </RadioGroup>
  );
}
