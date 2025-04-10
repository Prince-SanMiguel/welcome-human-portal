
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
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data as AttendanceRecord[];
};

export const createAttendanceRecord = async (record: Partial<AttendanceRecord>) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert(record)
    .select()
    .single();
  
  if (error) throw error;
  return data as AttendanceRecord;
};

export const updateAttendanceRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
  const { data, error } = await supabase
    .from('attendance')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as AttendanceRecord;
};

export const deleteAttendanceRecord = async (id: string) => {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
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
  
  if (error) throw error;
  return data as LeaveRequest[];
};

export const fetchLeaveRequestsWithUserInfo = async () => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as LeaveRequest[];
};

export const createLeaveRequest = async (request: Partial<LeaveRequest>) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert(request)
    .select()
    .single();
  
  if (error) throw error;
  return data as LeaveRequest;
};

export const updateLeaveRequest = async (id: string, updates: Partial<LeaveRequest>) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as LeaveRequest;
};
