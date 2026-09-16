SELECT
  table_name,
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE column_name = 'updatedAt'
ORDER BY table_name;
