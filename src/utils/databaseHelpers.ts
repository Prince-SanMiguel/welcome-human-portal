
import { supabase } from '@/integrations/supabase/client';
import { AttendanceRecord, LeaveRequest } from '@/types/database';

/**
 * Utility functions for working with the attendance and leave_requests tables
 */

// Attendance related functions
export const fetchAttendanceRecords = async (userId?: string) => {
  let query = supabase
    .from('attendance')
    .select('*')
    .order('date', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as AttendanceRecord[];
};

export const fetchAttendanceRecordsWithUserInfo = async () => {
  // We don't have user profile info in the attendance table directly,
  // so we'll need to fetch user profiles separately
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
  
  console.log('Fetched attendance records:', data);
  return data as AttendanceRecord[];
};

export const createAttendanceRecord = async (record: Partial<AttendanceRecord>) => {
  console.log('Creating attendance record:', record);
  const { data, error } = await supabase
    .from('attendance')
    .insert(record)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating attendance record:', error);
    throw error;
  }
  
  console.log('Created attendance record:', data);
  return data as AttendanceRecord;
};

export const updateAttendanceRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
  console.log('Updating attendance record:', id, updates);
  const { data, error } = await supabase
    .from('attendance')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating attendance record:', error);
    throw error;
  }
  
  console.log('Updated attendance record:', data);
  return data as AttendanceRecord;
};

export const deleteAttendanceRecord = async (id: string) => {
  console.log('Deleting attendance record:', id);
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting attendance record:', error);
    throw error;
  }
  
  console.log('Deleted attendance record:', id);
  return true;
};

// Leave request related functions
export const fetchLeaveRequests = async (userId?: string) => {
  let query = supabase
    .from('leave_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching leave requests:', error);
    throw error;
  }
  
  console.log('Fetched leave requests:', data);
  return data as LeaveRequest[];
};

export const fetchLeaveRequestsWithUserInfo = async () => {
  // We don't have user profile info in the leave_requests table directly,
  // so we'll need to fetch user profiles separately
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching leave requests with user info:', error);
    throw error;
  }
  
  console.log('Fetched leave requests with user info:', data);
  return data as LeaveRequest[];
};

export const createLeaveRequest = async (request: Partial<LeaveRequest>) => {
  console.log('Creating leave request:', request);
  const { data, error } = await supabase
    .from('leave_requests')
    .insert(request)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating leave request:', error);
    throw error;
  }
  
  console.log('Created leave request:', data);
  return data as LeaveRequest;
};

export const updateLeaveRequest = async (id: string, updates: Partial<LeaveRequest>) => {
  console.log('Updating leave request:', id, updates);
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating leave request:', error);
    throw error;
  }
  
  console.log('Updated leave request:', data);
  return data as LeaveRequest;
};
