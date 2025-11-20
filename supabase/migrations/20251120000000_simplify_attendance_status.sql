-- Migration: Simplify attendance status to only 'present' and 'absent'
-- Date: 2025-11-20
-- Description: Removes 'late' and 'excused' statuses, converting existing data

-- Step 1: Convert existing data
-- 'late' becomes 'present' (student was there)
-- 'excused' becomes 'absent' (student was not there)
UPDATE attendance_records
SET status = 'present'
WHERE status = 'late';

UPDATE attendance_records
SET status = 'absent'
WHERE status = 'excused';

-- Step 2: Add CHECK constraint to ensure only 'present' or 'absent'
ALTER TABLE attendance_records
ADD CONSTRAINT attendance_records_status_check
CHECK (status IN ('present', 'absent'));

-- Verify the migration
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM attendance_records
    WHERE status NOT IN ('present', 'absent');

    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: Found % records with invalid status', invalid_count;
    END IF;

    RAISE NOTICE 'Migration successful: All attendance records have valid status values';
END $$;
