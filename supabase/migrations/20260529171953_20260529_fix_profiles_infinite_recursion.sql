/*
  # Fix infinite recursion in profiles RLS policy

  1. Problem
    - "Admins can view all profiles" policy self-references the profiles table
    - This causes infinite recursion when checking if a user is an admin
    - Error: "infinite recursion detected in policy for relation 'profiles'"

  2. Solution
    - Drop the problematic admin SELECT policy on profiles
    - Create helper function to check admin status without self-referencing
    - Recreate admin policy using the helper function
    
  3. Security
    - Maintains same access control: admins can view all profiles, users can view own
    - No changes to other tables or policies
*/

-- Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in their profile
  -- This runs with elevated privileges to avoid recursion
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate the policy using the helper function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin() OR auth.uid() = id);
