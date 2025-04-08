
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, Briefcase, Building2, FileSpreadsheet } from 'lucide-react';

// Define types for our data
interface Employee {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  birthdate: string | null;
  hiredate: string | null;
  gender: string | null;
  sepdate: string | null;
}

interface JobHistory {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
  employee_name?: string;
  job_desc?: string;
  dept_name?: string;
}

interface Department {
  deptcode: string;
  deptname: string | null;
}

interface Job {
  jobcode: string;
  jobdesc: string | null;
}

interface EmployeeWithDetails extends Employee {
  job?: string;
  department?: string;
  salary?: number;
}

const Dashboard = () => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");
      
      // Fetch departments
      const { data: deptData, error: deptError } = await supabase
        .from('department')
        .select('*');
      
      if (deptError) {
        console.error("Department fetch error:", deptError);
        throw deptError;
      }
      console.log("Departments loaded:", deptData?.length);
      setDepartments(deptData || []);
      
      // Fetch jobs
      const { data: jobData, error: jobError } = await supabase
        .from('job')
        .select('*');
      
      if (jobError) {
        console.error("Job fetch error:", jobError);
        throw jobError;
      }
      console.log("Jobs loaded:", jobData?.length);
      setJobs(jobData || []);
      
      // Fetch employees
      const { data: empData, error: empError } = await supabase
        .from('employee')
        .select('*');
      
      if (empError) {
        console.error("Employee fetch error:", empError);
        throw empError;
      }
      console.log("Employees loaded:", empData?.length);
      
      // Fetch job history
      const { data: historyData, error: historyError } = await supabase
        .from('jobhistory')
        .select('*')
        .order('effdate', { ascending: false });
      
      if (historyError) {
        console.error("Job history fetch error:", historyError);
        throw historyError;
      }
      console.log("Job history records loaded:", historyData?.length);
      
      // Combine data to get employees with their current position details
      const employeesWithDetails = empData?.map((emp) => {
        const latestJob = historyData?.find(h => h.empno === emp.empno);
        const jobInfo = jobData?.find(j => j.jobcode === latestJob?.jobcode);
        const deptInfo = deptData?.find(d => d.deptcode === latestJob?.deptcode);
        
        return {
          ...emp,
          job: jobInfo?.jobdesc || 'Not assigned',
          department: deptInfo?.deptname || 'Not assigned',
          salary: latestJob?.salary || 0,
        };
      });
      
      // Add employee, job, and department names to job history records
      const jobHistoryWithDetails = historyData?.map((hist) => {
        const empInfo = empData?.find(e => e.empno === hist.empno);
        const jobInfo = jobData?.find(j => j.jobcode === hist.jobcode);
        const deptInfo = deptData?.find(d => d.deptcode === hist.deptcode);
        
        return {
          ...hist,
          employee_name: empInfo ? `${empInfo.firstname || ''} ${empInfo.lastname || ''}`.trim() : 'Unknown',
          job_desc: jobInfo?.jobdesc || 'Unknown',
          dept_name: deptInfo?.deptname || 'Unknown',
        };
      });
      
      setEmployees(employeesWithDetails || []);
      setJobHistory(jobHistoryWithDetails || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">HR Management Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">
                Active workforce
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Departments
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">
                Company divisions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Job Positions
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <p className="text-xs text-muted-foreground">
                Available roles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Job History Records
              </CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobHistory.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Employment records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Complete list of employees with their current positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <TableRow key={employee.empno}>
                        <TableCell className="font-medium">{employee.empno}</TableCell>
                        <TableCell>{`${employee.firstname || ''} ${employee.lastname || ''}`}</TableCell>
                        <TableCell>{employee.gender || 'N/A'}</TableCell>
                        <TableCell>{formatDate(employee.hiredate)}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.job}</TableCell>
                        <TableCell className="text-right">
                          {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Department Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>
              List of company departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Code</TableHead>
                    <TableHead>Department Name</TableHead>
                    <TableHead className="text-right">Employee Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <TableRow key={dept.deptcode}>
                        <TableCell className="font-medium">{dept.deptcode}</TableCell>
                        <TableCell>{dept.deptname || 'Unnamed'}</TableCell>
                        <TableCell className="text-right">
                          {employees.filter(e => e.department === dept.deptname).length}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No departments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
            <CardDescription>
              List of available job positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Code</TableHead>
                    <TableHead>Job Description</TableHead>
                    <TableHead className="text-right">Employees Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <TableRow key={job.jobcode}>
                        <TableCell className="font-medium">{job.jobcode}</TableCell>
                        <TableCell>{job.jobdesc || 'Unnamed'}</TableCell>
                        <TableCell className="text-right">
                          {employees.filter(e => e.job === job.jobdesc).length}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Job History Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Job History</CardTitle>
            <CardDescription>
              Employment records and position changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobHistory.length > 0 ? (
                    jobHistory.map((history, index) => (
                      <TableRow key={`${history.empno}-${history.jobcode}-${history.effdate}-${index}`}>
                        <TableCell className="font-medium">{history.employee_name} ({history.empno})</TableCell>
                        <TableCell>{history.dept_name}</TableCell>
                        <TableCell>{history.job_desc}</TableCell>
                        <TableCell>{formatDate(history.effdate)}</TableCell>
                        <TableCell className="text-right">
                          {history.salary ? `$${history.salary.toLocaleString()}` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No job history records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
