
/**
 * Custom TypeScript declaration file for Supabase tables
 */

// Attendance table types
export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  username?: string | null;
  email?: string | null;
}

// Leave requests table types
export interface LeaveRequest {
  id: string;
  user_id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  reviewer_id: string | null;
  reviewed_at: string | null;
  username?: string | null;
  email?: string | null;
}

// Declare module augmentation for Supabase client
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from<T>(table: 'attendance'): PostgrestQueryBuilder<T, AttendanceRecord>;
    from<T>(table: 'leave_requests'): PostgrestQueryBuilder<T, LeaveRequest>;
  }
}
