// Temporary fix - thêm vào TechnicianTasks.tsx trong loadTasks()
// Sau dòng: console.log('=== Starting loadTasks ===');

// TEMPORARY: Mock data for testing
if (window.location.search.includes('mock=true')) {
    console.log('🧪 USING MOCK DATA FOR TESTING');
    const mockTasks = [
        {
            id: 'mock-1',
            vehicle: 'VinFast VF8',
            vehicleModel: 'VF8',
            licensePlate: '30A-12345',
            customer: 'Nguyễn Văn A',
            customerPhone: '0123456789',
            service: 'Bảo dưỡng định kỳ',
            serviceDetails: ['Thay dầu máy', 'Kiểm tra phanh'],
            priority: 'Normal',
            status: 'ASSIGNED',
            assignedDate: new Date().toLocaleString('vi-VN'),
            notes: 'Khách hàng yêu cầu kiểm tra kỹ'
        },
        {
            id: 'mock-2', 
            vehicle: 'VinFast VF9',
            vehicleModel: 'VF9',
            licensePlate: '30B-67890',
            customer: 'Trần Thị B',
            customerPhone: '0987654321',
            service: 'Sửa chữa',
            serviceDetails: ['Thay pin', 'Kiểm tra hệ thống điện'],
            priority: 'High',
            status: 'IN_PROGRESS',
            assignedDate: new Date(Date.now() - 2*60*60*1000).toLocaleString('vi-VN'),
            startedAt: new Date(Date.now() - 1*60*60*1000).toLocaleString('vi-VN'),
            timeSpent: '1 giờ 30 phút'
        }
    ];
    
    setTasks(mockTasks);
    setLoading(false);
    return;
}
// END TEMPORARY MOCK DATA

// Tiếp tục code bình thường...