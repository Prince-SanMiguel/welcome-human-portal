
-- Create a function to get a user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role::TEXT INTO user_role
    FROM public.user_roles
    WHERE user_id = user_id_param;
    
    RETURN user_role;
END;
$$;
