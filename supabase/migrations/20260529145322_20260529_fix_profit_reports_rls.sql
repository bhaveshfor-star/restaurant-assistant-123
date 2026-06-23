/*
  # Fix profit_reports RLS policies
  
  1. Changes
    - Add missing DELETE policy for admins on profit_reports
    - Ensure admins can perform all CRUD operations on profit_reports
    
  2. Security
    - Only admins (role = 'admin') can view, insert, update, and delete reports
    - Maintains principle of least privilege
*/

-- Add missing DELETE policy for profit_reports
CREATE POLICY "Admins can delete profit reports"
  ON profit_reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
