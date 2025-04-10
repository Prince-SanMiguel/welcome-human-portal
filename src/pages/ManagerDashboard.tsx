import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Users, Calendar, Clock, FileText, PenLine, Save, CheckCheck, XCircle,
  CheckCircle, AlertCircle, CalendarPlus, FolderSearch
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  fetchAttendanceRecordsWithUserInfo,
  fetchLeaveRequestsWithUserInfo,
  updateAttendanceRecord,
  updateLeaveRequest
} from '@/utils/databaseHelpers';
import { AttendanceRecord, LeaveRequest } from '@/types/database';
import { useProfilesJoin } from '@/hooks/useProfilesJoin';
import { supabase } from '@/integrations/supabase/client';

const ManagerDashboard = () => {
  const { session, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('attendance');
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoadingLeaveRequests, setIsLoadingLeaveRequests] = useState(true);
  
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  
  // Extract unique user IDs from records for loading profile information
  const userIds = [
    ...new Set([
      ...attendanceRecords.map(record => record.user_id),
      ...leaveRequests.map(request => request.user_id),
    ]),
  ];
  
  const { profiles, isLoading: isLoadingProfiles } = useProfilesJoin(userIds);

  const loadAttendanceRecords = async () => {
    try {
      setIsLoadingAttendance(true);
      
      const data = await fetchAttendanceRecordsWithUserInfo();
      setAttendanceRecords(data || []);
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

  const loadLeaveRequests = async () => {
    try {
      setIsLoadingLeaveRequests(true);
      
      const data = await fetchLeaveRequestsWithUserInfo();
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
        loadAttendanceRecords();
      } else if (activeTab === 'leave-requests') {
        loadLeaveRequests();
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

  const handleEditAttendance = (record: AttendanceRecord) => {
    setSelectedAttendanceRecord(record);
    setIsAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedAttendanceRecord) return;
    
    try {
      await updateAttendanceRecord(selectedAttendanceRecord.id, {
        date: selectedAttendanceRecord.date,
        status: selectedAttendanceRecord.status,
        notes: selectedAttendanceRecord.notes
      });
      
      toast({
        title: 'Success',
        description: 'Attendance record updated successfully',
      });
      
      setIsAttendanceDialogOpen(false);
      loadAttendanceRecords();
    } catch (error) {
      console.error('Error updating attendance record:', error);
      toast({
        title: 'Error',
        description: 'Failed to update attendance record',
        variant: 'destructive',
      });
    }
  };

  const handleReviewLeave = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request);
    setIsLeaveDialogOpen(true);
  };

  const handleLeaveAction = async (status: 'approved' | 'declined') => {
    if (!selectedLeaveRequest || !session?.user.id) return;
    
    try {
      await updateLeaveRequest(selectedLeaveRequest.id, {
        status,
        reviewer_id: session.user.id,
        reviewed_at: new Date().toISOString()
      });
      
      toast({
        title: `Leave Request ${status === 'approved' ? 'Approved' : 'Declined'}`,
        description: `The leave request has been ${status}`,
      });
      
      setIsLeaveDialogOpen(false);
      loadLeaveRequests();
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update leave request',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return format(new Date(timeString), 'h:mm a');
  };

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

  const getUserDisplayName = (userId) => {
    const profile = profiles[userId];
    if (profile) {
      return profile.username || profile.email || profile.full_name || 'Unknown User';
    }
    return 'Loading...';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FolderSearch className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Manager Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, Manager</span>
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
              <Clock className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave-requests" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leave Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Attendance</CardTitle>
                <CardDescription>View and manage employee attendance records</CardDescription>
              </CardHeader>
              <CardContent>
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
                      ) : attendanceRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <Clock className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">No attendance records found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{getUserDisplayName(record.user_id)}</TableCell>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{formatTime(record.clock_in)}</TableCell>
                            <TableCell>{formatTime(record.clock_out)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {record.status || 'present'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAttendance(record)}
                              >
                                Edit
                              </Button>
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
                <CardTitle>Employee Leave Requests</CardTitle>
                <CardDescription>Review and manage employee leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
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
                              <FileText className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">No leave requests found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{getUserDisplayName(request.user_id)}</TableCell>
                            <TableCell className="capitalize">{request.type}</TableCell>
                            <TableCell>
                              {formatDate(request.start_date)}
                              {request.start_date !== request.end_date && ` to ${formatDate(request.end_date)}`}
                            </TableCell>
                            <TableCell>{renderStatusBadge(request.status)}</TableCell>
                            <TableCell>{formatDate(request.created_at)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReviewLeave(request)}
                              >
                                Review
                              </Button>
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

      {/* Attendance Edit Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              Update the attendance record for the selected employee.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right font-medium">
                Date
              </label>
              <Input
                type="date"
                id="date"
                value={selectedAttendanceRecord?.date || ''}
                onChange={(e) =>
                  setSelectedAttendanceRecord({
                    ...selectedAttendanceRecord,
                    date: e.target.value,
                  } as AttendanceRecord)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right font-medium">
                Status
              </label>
              <Select
                onValueChange={(value) =>
                  setSelectedAttendanceRecord({
                    ...selectedAttendanceRecord,
                    status: value,
                  } as AttendanceRecord)
                }
                defaultValue={selectedAttendanceRecord?.status || ''}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="notes" className="text-right font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                value={selectedAttendanceRecord?.notes || ''}
                onChange={(e) =>
                  setSelectedAttendanceRecord({
                    ...selectedAttendanceRecord,
                    notes: e.target.value,
                  } as AttendanceRecord)
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAttendanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveAttendance}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Request Review Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>
              Review and take action on the employee's leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Employee</p>
                <p>{selectedLeaveRequest ? getUserDisplayName(selectedLeaveRequest.user_id) : '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="capitalize">{selectedLeaveRequest?.type || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p>{formatDate(selectedLeaveRequest?.start_date || '')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p>{formatDate(selectedLeaveRequest?.end_date || '')}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Reason</p>
              <Textarea
                readOnly
                value={selectedLeaveRequest?.reason || ''}
                className="bg-gray-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => handleLeaveAction('approved')}>
              Approve
            </Button>
            <Button type="submit" variant="destructive" onClick={() => handleLeaveAction('declined')}>
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
