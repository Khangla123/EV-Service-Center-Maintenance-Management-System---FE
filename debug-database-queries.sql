-- SQL Queries để kiểm tra data

-- 1. Kiểm tra tất cả service_appointments
SELECT 
    id,
    customer_id,
    vehicle_id,
    technician_id,
    appointment_date,
    status,
    notes
FROM service_appointments
ORDER BY created_at DESC
LIMIT 10;

-- 2. Kiểm tra appointments có technician_id
SELECT 
    sa.id,
    sa.status,
    sa.appointment_date,
    sa.technician_id,
    s.user_id,
    u.full_name as technician_name
FROM service_appointments sa
LEFT JOIN staff s ON sa.technician_id = s.id
LEFT JOIN users u ON s.user_id = u.id
WHERE sa.technician_id IS NOT NULL;

-- 3. Kiểm tra appointments với status ASSIGNED
SELECT 
    sa.id,
    sa.status,
    sa.appointment_date,
    sa.technician_id,
    s.user_id,
    u.full_name as technician_name,
    c.full_name as customer_name,
    v.license_plate
FROM service_appointments sa
LEFT JOIN staff s ON sa.technician_id = s.id
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN customers c ON sa.customer_id = c.id
LEFT JOIN vehicles v ON sa.vehicle_id = v.id
WHERE sa.status = 'ASSIGNED';

-- 4. Kiểm tra staff records
SELECT 
    s.id as staff_id,
    s.user_id,
    u.full_name,
    u.email,
    u.role
FROM staff s
JOIN users u ON s.user_id = u.id
WHERE u.role IN ('TECHNICIAN', 'STAFF');

-- 5. Kiểm tra có user nào với email technician@evservice.vn không
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.role,
    s.id as staff_id
FROM users u
LEFT JOIN staff s ON u.id = s.user_id
WHERE u.email = 'technician@evservice.vn';

-- 6. Tạo test appointment với status ASSIGNED
INSERT INTO service_appointments (
    id,
    customer_id,
    vehicle_id,
    service_center_id,
    service_package_id,
    technician_id,
    appointment_date,
    status,
    notes,
    created_at,
    updated_at
) VALUES (
    UNHEX(REPLACE(UUID(), '-', '')),
    (SELECT id FROM customers LIMIT 1),
    (SELECT id FROM vehicles LIMIT 1),
    (SELECT id FROM service_centers LIMIT 1),
    (SELECT id FROM service_packages LIMIT 1),
    (SELECT id FROM staff WHERE user_id = (SELECT id FROM users WHERE email = 'technician@evservice.vn') LIMIT 1),
    NOW() + INTERVAL 1 DAY,
    'ASSIGNED',
    'Test appointment với status ASSIGNED cho technician',
    NOW(),
    NOW()
);

-- 7. Update existing appointment to ASSIGNED status
UPDATE service_appointments 
SET status = 'ASSIGNED',
    technician_id = (SELECT id FROM staff WHERE user_id = (SELECT id FROM users WHERE email = 'technician@evservice.vn') LIMIT 1),
    updated_at = NOW()
WHERE id = (SELECT id FROM service_appointments WHERE technician_id IS NOT NULL LIMIT 1);