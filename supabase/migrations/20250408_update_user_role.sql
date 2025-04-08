
-- Create a function to update a user's role
CREATE OR REPLACE FUNCTION public.update_user_role(
  user_id_param UUID,
  role_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_roles
  SET role = role_param::user_role
  WHERE user_id = user_id_param;
  
  -- If no row exists (unlikely with our trigger), insert one
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id_param, role_param::user_role);
  END IF;
END;
$$;
