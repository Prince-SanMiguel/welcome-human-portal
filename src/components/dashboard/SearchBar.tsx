
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export type FilterOptions = {
  searchQuery: string;
  department: string;
  job: string;
  gender: string;
  table: string;
};

type SearchBarProps = {
  departments: Array<{ deptcode: string; deptname: string | null }>;
  jobs: Array<{ jobcode: string; jobdesc: string | null }>;
  onFilterChange: (filters: FilterOptions) => void;
};

const SearchBar = ({ departments, jobs, onFilterChange }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    department: '',
    job: '',
    gender: '',
    table: 'all',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Update filters and propagate changes
    const newFilters = { ...filters, searchQuery: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (key: keyof Omit<FilterOptions, 'searchQuery'>, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      searchQuery: searchQuery,
      department: '',
      job: '',
      gender: '',
      table: 'all',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all tables..."
                value={searchQuery}
                onChange={handleInputChange}
                className="pl-8"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Table Filter */}
            <div>
              <Select
                value={filters.table}
                onValueChange={(value) => handleFilterChange('table', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  <SelectItem value="employees">Employees</SelectItem>
                  <SelectItem value="departments">Departments</SelectItem>
                  <SelectItem value="jobs">Jobs</SelectItem>
                  <SelectItem value="jobHistory">Job History</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.department}
                onValueChange={(value) => handleFilterChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.deptcode} value={dept.deptname || ''}>
                      {dept.deptname || 'Unnamed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.job}
                onValueChange={(value) => handleFilterChange('job', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Positions</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.jobcode} value={job.jobdesc || ''}>
                      {job.jobdesc || 'Unnamed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.gender}
                onValueChange={(value) => handleFilterChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genders</SelectItem>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 sm:col-span-4 flex justify-end">
              <Button variant="ghost" onClick={resetFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchBar;
