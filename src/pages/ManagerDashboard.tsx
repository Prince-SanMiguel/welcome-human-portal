
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Calendar, ClipboardList, CheckCircle, 
  X, Pencil, Search, CheckCheck, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const ManagerDashboard = () => {
  const { session, signOut, userRole } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('attendance');

  // State for attendance
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editAttendanceDialog, setEditAttendanceDialog] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [deleteAttendanceDialog, setDeleteAttendanceDialog] = useState(false);

  // State for leave requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoadingLeaveRequests, setIsLoadingLeaveRequests] = useState(true);

  // Attendance form schema
  const attendanceSchema = z.object({
    date: z.string().min(1, "Date is required"),
    clock_in: z.string().optional().nullable(),
    clock_out: z.string().optional().nullable(),
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional().nullable(),
  });

  // Setup attendance form
  const attendanceForm = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: "",
      clock_in: "",
      clock_out: "",
      status: "present",
      notes: "",
    },
  });

  // Leave response form schema
  const leaveResponseSchema = z.object({
    status: z.enum(["approved", "declined"]),
    notes: z.string().optional(),
  });

  // Setup leave response form
  const leaveResponseForm = useForm({
    resolver: zodResolver(leaveResponseSchema),
    defaultValues: {
      status: "approved",
      notes: "",
    },
  });

  const [currentLeaveRequest, setCurrentLeaveRequest] = useState(null);
  const [responseDialog, setResponseDialog] = useState(false);

  // Fetch attendance data
  const fetchAttendanceRecords = async () => {
    try {
      setIsLoadingAttendance(true);
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles:user_id (
            username:username,
            email:email
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      // Format the data to handle the profiles join
      const formattedData = data.map(record => ({
        ...record,
        username: record.profiles?.username,
        email: record.profiles?.email,
      }));

      setAttendanceRecords(formattedData);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
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
        .select(`
          *,
          profiles:user_id (
            username:username,
            email:email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format the data to handle the profiles join
      const formattedData = data.map(request => ({
        ...request,
        username: request.profiles?.username,
        email: request.profiles?.email,
      }));

      setLeaveRequests(formattedData);
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

  // Open edit attendance dialog
  const handleEditAttendance = (record) => {
    setCurrentAttendance(record);
    
    // Format dates for the form
    const formattedDate = record.date ? format(new Date(record.date), 'yyyy-MM-dd') : '';
    const formattedClockIn = record.clock_in ? format(new Date(record.clock_in), 'HH:mm') : '';
    const formattedClockOut = record.clock_out ? format(new Date(record.clock_out), 'HH:mm') : '';
    
    attendanceForm.reset({
      date: formattedDate,
      clock_in: formattedClockIn,
      clock_out: formattedClockOut,
      status: record.status || 'present',
      notes: record.notes || '',
    });
    
    setEditAttendanceDialog(true);
  };

  // Handle saving attendance edits
  const handleSaveAttendance = async (values) => {
    try {
      if (!currentAttendance) return;
      
      // Format the date and time values for the database
      const dateValue = values.date;
      
      // For clock_in, combine date and time
      let clockInValue = null;
      if (values.clock_in) {
        const clockInDate = new Date(`${dateValue}T${values.clock_in}`);
        clockInValue = clockInDate.toISOString();
      }
      
      // For clock_out, combine date and time
      let clockOutValue = null;
      if (values.clock_out) {
        const clockOutDate = new Date(`${dateValue}T${values.clock_out}`);
        clockOutValue = clockOutValue = clockOutDate.toISOString();
      }
      
      const { error } = await supabase
        .from('attendance')
        .update({
          date: dateValue,
          clock_in: clockInValue,
          clock_out: clockOutValue,
          status: values.status,
          notes: values.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentAttendance.id);
      
      if (error) throw error;
      
      toast({
        title: 'Attendance Updated',
        description: 'The attendance record has been updated successfully',
      });
      
      setEditAttendanceDialog(false);
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update attendance record',
        variant: 'destructive',
      });
    }
  };

  // Open delete attendance confirmation
  const handleDeleteAttendanceConfirm = (record) => {
    setCurrentAttendance(record);
    setDeleteAttendanceDialog(true);
  };

  // Delete attendance record
  const handleDeleteAttendance = async () => {
    try {
      if (!currentAttendance) return;
      
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', currentAttendance.id);
      
      if (error) throw error;
      
      toast({
        title: 'Attendance Deleted',
        description: 'The attendance record has been deleted successfully',
      });
      
      setDeleteAttendanceDialog(false);
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete attendance record',
        variant: 'destructive',
      });
    }
  };

  // Open response dialog for leave request
  const handleLeaveResponse = (request) => {
    setCurrentLeaveRequest(request);
    
    leaveResponseForm.reset({
      status: "approved",
      notes: "",
    });
    
    setResponseDialog(true);
  };

  // Handle submitting response to leave request
  const handleSubmitResponse = async (values) => {
    try {
      if (!currentLeaveRequest) return;
      
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: values.status,
          reviewer_id: session?.user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentLeaveRequest.id);
      
      if (error) throw error;
      
      toast({
        title: `Leave Request ${values.status === 'approved' ? 'Approved' : 'Declined'}`,
        description: `The leave request has been ${values.status === 'approved' ? 'approved' : 'declined'} successfully`,
      });
      
      setResponseDialog(false);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update leave request',
        variant: 'destructive',
      });
    }
  };

  // Filter attendance records based on search query
  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const email = record.email || '';
    const username = record.username || '';
    const dateStr = record.date ? format(new Date(record.date), 'yyyy-MM-dd') : '';
    
    return (
      email.toLowerCase().includes(searchLower) ||
      username.toLowerCase().includes(searchLower) ||
      dateStr.includes(searchLower)
    );
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return format(new Date(timeString), 'h:mm a');
  };

  // Helper function to display user info
  const getUserDisplay = (record) => {
    const username = record.username;
    const email = record.email;
    
    if (username && email) {
      return (
        <div>
          <div className="font-medium">{username}</div>
          <div className="text-xs text-gray-500">{email}</div>
        </div>
      );
    }
    
    return email || 'Unknown User';
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
      case 'present':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Present</Badge>;
      case 'absent':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Absent</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Late</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Manager Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {session?.user.email}</span>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Review Attendance
            </TabsTrigger>
            <TabsTrigger value="leave-requests" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leave Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Attendance</CardTitle>
                <CardDescription>Review and manage team attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search by name, email, or date..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingAttendance ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                              <p className="text-sm text-gray-500">Loading attendance records...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredAttendanceRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <ClipboardList className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">No attendance records to display</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAttendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{getUserDisplay(record)}</TableCell>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{formatTime(record.clock_in)}</TableCell>
                            <TableCell>{formatTime(record.clock_out)}</TableCell>
                            <TableCell>{renderStatusBadge(record.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAttendance(record)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleDeleteAttendanceConfirm(record)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
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
                <CardTitle>Pending Leave Requests</CardTitle>
                <CardDescription>Review and approve team leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingLeaveRequests ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                              <p className="text-sm text-gray-500">Loading leave requests...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : leaveRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <CheckCircle className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">No pending leave requests</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{getUserDisplay(request)}</TableCell>
                            <TableCell className="capitalize">{request.type}</TableCell>
                            <TableCell>{formatDate(request.start_date)}</TableCell>
                            <TableCell>{formatDate(request.end_date)}</TableCell>
                            <TableCell>{renderStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                    onClick={() => handleLeaveResponse(request)}
                                  >
                                    <CheckCheck className="h-4 w-4" />
                                    <span>Respond</span>
                                  </Button>
                                </div>
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

      {/* Edit Attendance Dialog */}
      <Dialog open={editAttendanceDialog} onOpenChange={setEditAttendanceDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              Update the attendance details for this employee
            </DialogDescription>
          </DialogHeader>
          
          <Form {...attendanceForm}>
            <form onSubmit={attendanceForm.handleSubmit(handleSaveAttendance)} className="space-y-4">
              <FormField
                control={attendanceForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={attendanceForm.control}
                  name="clock_in"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clock In</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={attendanceForm.control}
                  name="clock_out"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clock Out</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={attendanceForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={attendanceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Add any additional notes" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditAttendanceDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Attendance Confirmation */}
      <AlertDialog open={deleteAttendanceDialog} onOpenChange={setDeleteAttendanceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAttendance} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Request Response Dialog */}
      <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Respond to Leave Request</DialogTitle>
            <DialogDescription>
              Review and respond to this leave request
            </DialogDescription>
          </DialogHeader>
          
          {currentLeaveRequest && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Employee:</span> {currentLeaveRequest.email}</div>
                <div><span className="font-medium">Type:</span> <span className="capitalize">{currentLeaveRequest.type}</span></div>
                <div><span className="font-medium">From:</span> {formatDate(currentLeaveRequest.start_date)}</div>
                <div><span className="font-medium">To:</span> {formatDate(currentLeaveRequest.end_date)}</div>
                {currentLeaveRequest.reason && (
                  <div className="col-span-2"><span className="font-medium">Reason:</span> {currentLeaveRequest.reason}</div>
                )}
              </div>
            </div>
          )}
          
          <Form {...leaveResponseForm}>
            <form onSubmit={leaveResponseForm.handleSubmit(handleSubmitResponse)} className="space-y-4">
              <FormField
                control={leaveResponseForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Response</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your response" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="approved">Approve Request</SelectItem>
                        <SelectItem value="declined">Decline Request</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={leaveResponseForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Add any comments or notes" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResponseDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant={leaveResponseForm.getValues("status") === "approved" ? "default" : "destructive"}
                >
                  {leaveResponseForm.getValues("status") === "approved" ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Decline
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
