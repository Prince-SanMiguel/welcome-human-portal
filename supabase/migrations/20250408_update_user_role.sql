
-- Create a function to update a user's role
CREATE OR REPLACE FUNCTION public.update_user_role(user_id_param UUID, role_param TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_roles
    SET role = role_param::user_role
    WHERE user_id = user_id_param;
END;
$$;
