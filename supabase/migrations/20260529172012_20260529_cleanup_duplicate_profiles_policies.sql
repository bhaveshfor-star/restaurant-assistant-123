/*
  # Clean up duplicate SELECT policies on profiles

  1. Changes
    - Remove redundant "Users can view own profile" policy
    - The "Admins can view all profiles" policy already covers both cases:
      * Admins can view all (is_admin() returns true)
      * Users can view their own (auth.uid() = id)
    
  2. Security
    - Same access control maintained
    - Cleaner policy structure
*/

-- Remove redundant policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
