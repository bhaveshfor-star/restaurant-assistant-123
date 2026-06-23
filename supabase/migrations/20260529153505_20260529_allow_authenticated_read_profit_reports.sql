/*
  # Allow authenticated users to view profit reports
  
  1. Changes
    - Add SELECT policy for all authenticated users on profit_reports
    - Analytics dashboard is accessible to authenticated users, not just admins
    - Maintains admin-only for INSERT, UPDATE, DELETE operations
    
  2. Security
    - All authenticated users can VIEW profit reports (read-only)
    - Only admins can INSERT, UPDATE, DELETE profit reports
    - Maintains principle of least privilege for write operations
*/

CREATE POLICY "Authenticated users can view profit reports"
  ON profit_reports FOR SELECT
  TO authenticated
  USING (true);
