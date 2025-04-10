
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Calendar, Clock, FileText, PenLine, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
