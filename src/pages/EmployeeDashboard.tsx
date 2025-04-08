
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Calendar, Clock, FileText } from 'lucide-react';

const EmployeeDashboard = () => {
  const { session, signOut, userRole } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal-info');

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Employee Dashboard</h1>
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
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>View and update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Email</h3>
                    <p className="text-sm">{session?.user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Role</h3>
                    <p className="text-sm capitalize">{userRole}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">User ID</h3>
                    <p className="text-sm">{session?.user.id}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Last Sign In</h3>
                    <p className="text-sm">{new Date(session?.user.last_sign_in_at || '').toLocaleString()}</p>
                  </div>
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
                <div className="rounded-md border p-4 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="font-medium">No Attendance Records</h3>
                  <p className="text-sm text-gray-500 mt-1">Your attendance records will appear here</p>
                  <Button size="sm" className="mt-4">Clock In</Button>
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
                  <Button size="sm">New Request</Button>
                </div>
                <div className="rounded-md border p-4 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="font-medium">No Leave Requests</h3>
                  <p className="text-sm text-gray-500 mt-1">Your leave requests will appear here</p>
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
