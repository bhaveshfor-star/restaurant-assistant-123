/*
  # Add Cost of Goods and Operating Expenses columns

  1. Changes
    - Add `cost_of_goods` column to store raw materials/ingredients cost
    - Add `operating_expenses` column to store rent, salaries, utilities, etc.
    - Both columns are optional (nullable) with default value 0
    
  2. Data
    - New columns on profit_reports table
    - Existing reports will have 0 as default value
    
  3. Notes
    - gross_profit and net_profit remain as calculated fields stored in DB
    - cost_of_goods and operating_expenses are now user inputs
*/

ALTER TABLE profit_reports
ADD COLUMN IF NOT EXISTS cost_of_goods numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS operating_expenses numeric DEFAULT 0;
