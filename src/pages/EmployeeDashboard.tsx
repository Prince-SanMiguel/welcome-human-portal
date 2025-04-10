
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  User, Calendar, Clock, FileText, PenLine, Save, X,
  CheckCircle, AlertCircle, CalendarPlus, ClockCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const EmployeeDashboard = () => {
  const { session, signOut, userRole } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal-info');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    email: session?.user.email || '',
    fullName: session?.user.user_metadata?.full_name || '',
    username: session?.user.user_metadata?.username || ''
  });

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // State for attendance
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

  // State for leave requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoadingLeaveRequests, setIsLoadingLeaveRequests] = useState(true);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // Determine the display name (username or first part of email)
  const displayName = userData.username || 
    (session?.user.email?.split('@')[0] || 'User');

  // Form validation schema for new leave request
  const leaveRequestSchema = z.object({
    type: z.string({ required_error: "Please select a leave type" }),
    startDate: z.string({ required_error: "Start date is required" }),
    endDate: z.string({ required_error: "End date is required" }),
    reason: z.string().optional(),
  });

  // Create form
  const leaveForm = useForm({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      type: "",
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      reason: "",
    },
  });

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    try {
      setIsLoadingAttendance(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;

      setAttendanceRecords(data || []);

      // Check if user is already clocked in today
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = data?.find(record => 
        format(new Date(record.date), 'yyyy-MM-dd') === today
      );
      
      setTodayAttendance(todayRecord);
      setIsClockedIn(todayRecord && todayRecord.clock_in && !todayRecord.clock_out);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance records',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    try {
      setIsLoadingLeaveRequests(true);
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leave requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLeaveRequests(false);
    }
  };

  useEffect(() => {
    if (session) {
      if (activeTab === 'attendance') {
        fetchAttendanceRecords();
      } else if (activeTab === 'leave-requests') {
        fetchLeaveRequests();
      }
    }
  }, [session, activeTab]);

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

  const handleEditToggle = () => {
    if (isEditing) {
      // If we're canceling editing, reset the form data
      setUserData({
        email: session?.user.email || '',
        fullName: session?.user.user_metadata?.full_name || '',
        username: session?.user.user_metadata?.username || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Update user_metadata
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          full_name: userData.fullName,
          username: userData.username
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your information has been updated',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user info:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your information',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUsername = async () => {
    try {
      // Update user_metadata, removing the username field
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          username: null
        }
      });

      if (error) throw error;

      // Update local state
      setUserData({
        ...userData,
        username: ''
      });

      toast({
        title: 'Success',
        description: 'Username has been removed',
      });

      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting username:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove username',
        variant: 'destructive',
      });
    }
  };

  // Clock in/out functions
  const handleClockIn = async () => {
    try {
      const now = new Date().toISOString();
      
      if (todayAttendance) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ 
            clock_in: now, 
            updated_at: now 
          })
          .eq('id', todayAttendance.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert({
            clock_in: now,
            date: format(new Date(), 'yyyy-MM-dd'),
            status: 'present'
          });
        
        if (error) throw error;
      }
      
      toast({
        title: 'Clocked In',
        description: `You clocked in at ${format(new Date(), 'h:mm a')}`,
      });
      
      setIsClockedIn(true);
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Error',
        description: 'Failed to clock in',
        variant: 'destructive',
      });
    }
  };

  const handleClockOut = async () => {
    try {
      if (!todayAttendance) {
        throw new Error('No clock-in record found for today');
      }
      
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('attendance')
        .update({
          clock_out: now,
          updated_at: now
        })
        .eq('id', todayAttendance.id);
      
      if (error) throw error;
      
      toast({
        title: 'Clocked Out',
        description: `You clocked out at ${format(new Date(), 'h:mm a')}`,
      });
      
      setIsClockedIn(false);
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        title: 'Error',
        description: 'Failed to clock out',
        variant: 'destructive',
      });
    }
  };

  // Leave request functions
  const onSubmitLeaveRequest = async (values) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          type: values.type,
          start_date: values.startDate,
          end_date: values.endDate,
          reason: values.reason,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Leave Request Submitted',
        description: 'Your leave request has been submitted for approval',
      });

      setIsLeaveDialogOpen(false);
      fetchLeaveRequests();
      leaveForm.reset();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit leave request',
        variant: 'destructive',
      });
    }
  };

  const handleCancelLeaveRequest = async (id) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Leave Request Cancelled',
        description: 'Your leave request has been cancelled',
      });

      fetchLeaveRequests();
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel leave request',
        variant: 'destructive',
      });
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return format(new Date(timeString), 'h:mm a');
  };

  // Status badge rendering
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Employee Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {displayName}</span>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="personal-info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave-requests" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leave Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>View and update your personal details</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditToggle}
                  className="flex items-center gap-1"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" /> Cancel
                    </>
                  ) : (
                    <>
                      <PenLine className="h-4 w-4" /> Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Email</h3>
                    <Input 
                      type="email"
                      value={userData.email}
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Your email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Full Name</h3>
                    <Input 
                      name="fullName"
                      value={userData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Username</h3>
                      {isEditing && userData.username && (
                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">Delete Username</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete your username? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                              <Button variant="destructive" onClick={handleDeleteUsername}>Delete</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <Input 
                      name="username"
                      value={userData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={!isEditing && !userData.username ? "No username set" : isEditing && !userData.username ? "Add a username" : ""}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Role</h3>
                    <p className="text-sm px-3 py-2 border rounded-md bg-gray-50 capitalize">{userRole}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">User ID</h3>
                    <p className="text-sm px-3 py-2 border rounded-md bg-gray-50 overflow-auto font-mono">{session?.user.id}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Last Sign In</h3>
                    <p className="text-sm px-3 py-2 border rounded-md bg-gray-50">{new Date(session?.user.last_sign_in_at || '').toLocaleString()}</p>
                  </div>
                  
                  {isEditing && (
                    <Button 
                      onClick={handleSaveChanges} 
                      className="w-full md:w-auto md:ml-auto flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>View and manage your attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200">
                  <h3 className="text-lg font-medium mb-2 text-blue-700">Today's Attendance</h3>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <p className="text-sm text-blue-700">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
                      {todayAttendance && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Clock In:</span> {todayAttendance?.clock_in ? formatTime(todayAttendance.clock_in) : '-'}
                          </div>
                          <div>
                            <span className="font-medium">Clock Out:</span> {todayAttendance?.clock_out ? formatTime(todayAttendance.clock_out) : '-'}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {!isClockedIn ? (
                        <Button 
                          onClick={handleClockIn}
                          className="flex items-center gap-2"
                          disabled={isLoadingAttendance}
                        >
                          <Clock className="h-4 w-4" /> Clock In
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleClockOut}
                          variant="outline"
                          className="flex items-center gap-2"
                          disabled={isLoadingAttendance}
                        >
                          <ClockCheck className="h-4 w-4" /> Clock Out
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingAttendance ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                              <p className="text-sm text-gray-500">Loading attendance records...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : attendanceRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <Clock className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">No attendance records found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{formatTime(record.clock_in)}</TableCell>
                            <TableCell>{formatTime(record.clock_out)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {record.status || 'present'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Manage your leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2">
                        <CalendarPlus className="h-4 w-4" /> New Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Leave Request</DialogTitle>
                        <DialogDescription>
                          Submit a new leave request for approval
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...leaveForm}>
                        <form onSubmit={leaveForm.handleSubmit(onSubmitLeaveRequest)} className="space-y-4">
                          <FormField
                            control={leaveForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Leave Type</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="vacation">Vacation</SelectItem>
                                    <SelectItem value="sick">Sick Leave</SelectItem>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="bereavement">Bereavement</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={leaveForm.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={leaveForm.control}
                              name="endDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={leaveForm.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reason (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Provide a reason for your leave request" rows={3} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Submit Request</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingLeaveRequests ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                              <p className="text-sm text-gray-500">Loading leave requests...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : leaveRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <FileText className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">No leave requests found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="capitalize">{request.type}</TableCell>
                            <TableCell>
                              {formatDate(request.start_date)}
                              {request.start_date !== request.end_date && ` to ${formatDate(request.end_date)}`}
                            </TableCell>
                            <TableCell>{renderStatusBadge(request.status)}</TableCell>
                            <TableCell>{formatDate(request.created_at)}</TableCell>
                            <TableCell>
                              {request.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelLeaveRequest(request.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
