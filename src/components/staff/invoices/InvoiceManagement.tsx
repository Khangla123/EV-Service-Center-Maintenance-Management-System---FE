import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, DollarSign, 
  CheckCircle, Clock, XCircle, AlertCircle,
  Eye, Edit, Download, RefreshCw, Plus, Wrench
} from 'lucide-react';
import invoiceService, { InvoiceResponse, CreateInvoiceRequest } from '../../../services/invoiceService';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import serviceOrderService from '../../../services/serviceOrderService';
import servicePackageService from '../../../services/servicePackageService';
import api from '../../../services/api';
import './InvoiceManagement.css';

type InvoiceStatus = 'ALL' | 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
type ViewMode = 'invoices' | 'pending-appointments';

const InvoiceManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('pending-appointments');
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [creatingInvoiceFor, setCreatingInvoiceFor] = useState<string | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedAppointmentForInvoice, setSelectedAppointmentForInvoice] = useState<Appointment | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [packagePrice, setPackagePrice] = useState<number>(0);
  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [loadingPackagePrice, setLoadingPackagePrice] = useState(false);
  const [partsCount, setPartsCount] = useState<number>(0);
  const [partsTotal, setPartsTotal] = useState<number>(0);
  const [suggestionsCount, setSuggestionsCount] = useState<number>(0);
  const [suggestionsTotal, setSuggestionsTotal] = useState<number>(0);
  const [partsList, setPartsList] = useState<any[]>([]);
  const [suggestionsList, setSuggestionsList] = useState<any[]>([]);
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [issuesCount, setIssuesCount] = useState<number>(0);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]); // Selected service packages
  const [issuesTotal, setIssuesTotal] = useState<number>(0);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);

  useEffect(() => {
    console.log('🎯 InvoiceManagement mounted, viewMode:', viewMode);
    loadData();
  }, [viewMode]);

  useEffect(() => {
    console.log('🔄 Filtering invoices, total:', invoices.length, 'searchTerm:', searchTerm, 'statusFilter:', statusFilter);
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  // Create invoice for a completed appointment
  const createInvoiceForAppointment = async (appointmentId: string, amount?: number) => {
    try {
      console.log('🔨 Creating invoice for appointment:', appointmentId, 'amount:', amount);
      console.trace('📍 Function called from:');
      setCreatingInvoiceFor(appointmentId);

      // Get the appointment details
      const appointment = pendingAppointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        alert('Không tìm thấy thông tin lịch hẹn!');
        return;
      }

      // If no amount provided, show price input modal
      if (!amount) {
        setSelectedAppointmentForInvoice(appointment);
        setAdditionalFee(0);
        setShowPriceModal(true);
        
        // DEBUG: Check appointment object structure
        console.log('🔍 Full appointment object:', appointment);
        console.log('🔍 Appointment keys:', Object.keys(appointment));
        
        // Load service package price
        setLoadingPackagePrice(true);
        try {
          const servicePackage = await servicePackageService.getServicePackageById(appointment.servicePackageId);
          setPackagePrice(servicePackage.price);
          setInvoiceAmount(servicePackage.price); // Set initial amount = package price
          console.log('📦 Loaded service package:', servicePackage);
          console.log('📦 Service package keys:', Object.keys(servicePackage || {}));
          console.log('📦 Service package services:', (servicePackage as any)?.services || (servicePackage as any)?.includedServices);
          
          // Parse selected packages from appointment.selectedPackageNames
          let selectedPackagesData: any[] = [];
          try {
            console.log('📦 Parsing selected packages from appointment...');
            console.log('📦 selectedPackageNames:', appointment.selectedPackageNames);
            console.log('📦 selectedPackages JSON:', appointment.selectedPackages);
            
            if (appointment.selectedPackages) {
              // Parse JSON array of package IDs
              const packageIds = JSON.parse(appointment.selectedPackages);
              console.log('📦 Parsed package IDs:', packageIds);
              
              // Fetch each package details
              const packagesPromises = packageIds.map((id: string) => 
                servicePackageService.getServicePackageById(id)
              );
              selectedPackagesData = await Promise.all(packagesPromises);
              
              console.log('✅ Selected packages loaded:', selectedPackagesData);
              setSelectedPackages(selectedPackagesData);
            } else {
              console.warn('⚠️ No selected_packages, using single package fallback');
              selectedPackagesData = [servicePackage];
              setSelectedPackages(selectedPackagesData);
            }
          } catch (error) {
            console.error('❌ Error parsing selected packages:', error);
            selectedPackagesData = [servicePackage];
            setSelectedPackages(selectedPackagesData);
          }
          
          // Load summary info (counts and totals) from backend
          let totalPartsAmount = 0;
          let totalSuggestionsAmount = 0;
          let totalIssuesAmount = 0;
          
          try {
            console.log('🔍 Looking for service order by appointment ID:', appointmentId);
            const serviceOrder = await serviceOrderService.getServiceOrderByAppointmentId(appointmentId);
            console.log('📦 Found service order:', serviceOrder);
            console.log('📦 Service order keys:', Object.keys(serviceOrder || {}));
            console.log('📦 Service order checklist:', (serviceOrder as any)?.checklist);
            console.log('📦 Service order workPerformed:', (serviceOrder as any)?.workPerformed);
            
            // Parse checklist (services included in the package)
            try {
              const checklistJson = (serviceOrder as any)?.checklist;
              if (checklistJson) {
                let parsedChecklist = [];
                if (typeof checklistJson === 'string') {
                  parsedChecklist = JSON.parse(checklistJson);
                } else if (Array.isArray(checklistJson)) {
                  parsedChecklist = checklistJson;
                }
                setChecklistItems(parsedChecklist);
                console.log('✅ Parsed checklist items:', parsedChecklist);
              }
            } catch (error) {
              console.warn('Failed to parse checklist:', error);
              setChecklistItems([]);
            }
            
            if (!serviceOrder || !serviceOrder.id) {
              console.warn('⚠️ No service order found for this appointment. Skipping parts/suggestions/issues loading.');
              console.log('❌ RESET: Setting parts to 0 (no service order)');
              setPartsList([]);
              setPartsCount(0);
              setPartsTotal(0);
              setSuggestionsList([]);
              setSuggestionsCount(0);
              setSuggestionsTotal(0);
              setIssuesList([]);
              setIssuesCount(0);
              setIssuesTotal(0);
              return; // Skip loading if no service order
            }
            
            if (serviceOrder && serviceOrder.id) {
              // Get parts list (detailed) from backend
              try {
                console.log('🔍 Loading parts for service order:', serviceOrder.id);
                console.log('🔍 Service order ID type:', typeof serviceOrder.id);
                console.log('🔍 Full URL:', `/service-orders/${serviceOrder.id}/parts`);
                const partsResponse = await api.get(`/service-orders/${serviceOrder.id}/parts`);
                console.log('📦 Parts response:', partsResponse.data);
                const partsData = partsResponse.data.result || [];
                console.log('🔧 Parts detailed list:', partsData);
                console.log('🔧 Parts count:', partsData.length);
                
                totalPartsAmount = partsData.reduce((sum: number, part: any) => sum + (part.totalPrice || 0), 0);
                console.log('💰 Total parts amount:', totalPartsAmount);
                
                setPartsList(partsData);
                setPartsCount(partsData.length);
                setPartsTotal(totalPartsAmount);
              } catch (error: any) {
                console.error('❌ Parts load error:', error);
                console.error('❌ Error response:', error.response?.data);
                console.error('❌ Error status:', error.response?.status);
                console.error('❌ Request URL:', error.config?.url);
                console.log('❌ RESET: Setting parts to 0 (parts load error)');
                setPartsList([]);
                setPartsCount(0);
                setPartsTotal(0);
              }

              // Get suggestions list (detailed) from backend
              try {
                const suggestionsResponse = await serviceOrderService.getServiceSuggestions(serviceOrder.id);
                const approvedSuggestions = suggestionsResponse.filter((s: any) => s.status === 'APPROVED');
                setSuggestionsList(approvedSuggestions);
                setSuggestionsCount(approvedSuggestions.length);
                
                // Calculate total of approved suggestions
                totalSuggestionsAmount = approvedSuggestions.reduce((sum: number, s: any) => sum + (s.estimatedCost || 0), 0);
                setSuggestionsTotal(totalSuggestionsAmount);
                console.log('💡 Suggestions detailed list:', approvedSuggestions);
              } catch (error) {
                console.warn('Suggestions not available:', error);
                setSuggestionsList([]);
                setSuggestionsCount(0);
                setSuggestionsTotal(0);
              }

              // Get issues list with pricing from backend
              try {
                const issuesJson = serviceOrder.issues;
                if (issuesJson && issuesJson.trim() !== '') {
                  const issuesData = JSON.parse(issuesJson);
                  // Filter only issues that have price set by staff
                  const pricedIssues = issuesData.filter((issue: any) => issue.price && issue.price > 0);
                  setIssuesList(pricedIssues);
                  setIssuesCount(pricedIssues.length);
                  
                  // Calculate total of priced issues
                  totalIssuesAmount = pricedIssues.reduce((sum: number, issue: any) => sum + (issue.price || 0), 0);
                  setIssuesTotal(totalIssuesAmount);
                  console.log('🔍 Issues with pricing:', pricedIssues);
                } else {
                  setIssuesList([]);
                  setIssuesCount(0);
                  setIssuesTotal(0);
                }
              } catch (error) {
                console.warn('Issues not available:', error);
                setIssuesList([]);
                setIssuesCount(0);
                setIssuesTotal(0);
              }
            }
          } catch (error) {
            console.error('Error loading service order info:', error);
            console.log('❌ RESET: Setting parts to 0 (service order load error)');
            setPartsCount(0);
            setPartsTotal(0);
            setSuggestionsCount(0);
            setSuggestionsTotal(0);
            setIssuesCount(0);
            setIssuesTotal(0);
          }
          
          // Update invoice amount with all costs
          // Calculate total package price from ALL selected packages (use the fetched data, not state)
          const totalPackagePrice = selectedPackagesData.length > 0
            ? selectedPackagesData.reduce((sum, pkg) => sum + (pkg.price || 0), 0)
            : servicePackage.price;
          
          const finalAmount = totalPackagePrice + totalPartsAmount + totalSuggestionsAmount + totalIssuesAmount;
          setInvoiceAmount(finalAmount);
          setPackagePrice(totalPackagePrice); // Update package price to reflect all packages
          console.log('💰 Final invoice amount:', { 
            packagesCount: selectedPackagesData.length,
            packagePrice: totalPackagePrice, 
            parts: totalPartsAmount, 
            suggestions: totalSuggestionsAmount, 
            issues: totalIssuesAmount, 
            total: finalAmount 
          });
          
          // Set loading false AFTER all state updates to avoid race condition
          setLoadingPackagePrice(false);
        } catch (error) {
          console.error('Error loading service package:', error);
          console.log('❌ RESET: Setting parts to 0 (package load error)');
          setPackagePrice(0);
          setInvoiceAmount(0);
          setPartsCount(0);
          setLoadingPackagePrice(false);
        }
        
        setCreatingInvoiceFor(null);
        return;
      }

      // Get service order by appointment ID (direct lookup instead of filtering all orders)
      let serviceOrder;
      try {
        console.log('� Looking for service order by appointmentId:', appointmentId);
        serviceOrder = await serviceOrderService.getServiceOrderByAppointmentId(appointmentId);
        console.log('✅ Found service order:', serviceOrder);
      } catch (error: any) {
        console.error('❌ No service order found for appointment:', appointmentId);
        console.error('Error details:', error.response?.data);
        
        // Nếu lỗi 404 = chưa có service order
        if (error.response?.status === 404) {
          alert('⚠️ Chưa có phiếu dịch vụ cho lịch hẹn này!\n\nVui lòng đảm bảo:\n1. Đã phân công kỹ thuật viên cho lịch hẹn\n2. Kỹ thuật viên đã hoàn thành công việc');
        } else {
          alert(`Lỗi khi tìm phiếu dịch vụ: ${error.response?.data?.message || error.message}`);
        }
        return;
      }
      
      // Use provided amount (backend will check for duplicates)
      const subtotal = amount;
      const discountAmount = 0; // No discount
      
      // Create invoice with correct request format
      const createRequest: CreateInvoiceRequest = {
        serviceOrderId: serviceOrder.id,
        subtotal: subtotal,
        taxAmount: 0,
        discountAmount: discountAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      console.log('📤 Sending create invoice request:', JSON.stringify(createRequest, null, 2));
      console.log('🔍 Request details:', {
        serviceOrderId: serviceOrder.id,
        subtotalType: typeof subtotal,
        subtotalValue: subtotal,
        discountAmountType: typeof discountAmount,
        discountAmountValue: discountAmount,
        dueDateType: typeof createRequest.dueDate,
        dueDateValue: createRequest.dueDate
      });

      const newInvoice = await invoiceService.createInvoice(createRequest);
      console.log('✅ Invoice created successfully:', newInvoice);

      alert('✅ Tạo hóa đơn thành công!');
      
      // Refresh both invoices and pending appointments (to remove from list)
      await loadInvoices();
      await loadPendingAppointments();
      
      // Switch to invoices tab to show newly created invoice
      setViewMode('invoices');
      setShowPriceModal(false);
      setSelectedAppointmentForInvoice(null);
      
    } catch (error: any) {
      console.error('❌ Error creating invoice:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi tạo hóa đơn';
      alert(`❌ ${errorMsg}\n\nChi tiết: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setCreatingInvoiceFor(null);
      setPartsCount(0);
      setPartsTotal(0);
      setSuggestionsCount(0);
      setSuggestionsTotal(0);
      setIssuesCount(0);
      setIssuesTotal(0);
    }
  };

  const loadData = async () => {
    if (viewMode === 'invoices') {
      await loadInvoices();
    } else {
      await loadPendingAppointments();
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      console.log('📄 Loading invoices...');
      
      const data = await invoiceService.getAllInvoices();
      
      console.log('✅ Invoices loaded:', data);
      console.log('✅ Invoices type:', typeof data);
      console.log('✅ Is array?', Array.isArray(data));
      console.log('✅ Number of invoices:', data?.length || 0);
      
      // Backend có thể trả về array trực tiếp hoặc object {result: [...]}
      const invoicesList = Array.isArray(data) ? data : ((data as any)?.result || []);
      console.log('✅ Processed invoices list:', invoicesList);
      
      // Sort by issue date - newest first
      const sortedInvoices = [...invoicesList].sort((a, b) => {
        const dateA = new Date(a.issueDate).getTime();
        const dateB = new Date(b.issueDate).getTime();
        return dateB - dateA; // Mới nhất trước
      });
      
      setInvoices(sortedInvoices || []);
    } catch (error: any) {
      console.error('❌ Error loading invoices:', error);
      console.error('❌ Error response:', error?.response);
      console.error('❌ Error data:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      console.error('❌ Error message:', error?.message);
      
      // Set empty array để không crash UI
      setInvoices([]);
      
      // Hiển thị thông báo lỗi cụ thể
      if (error?.response?.status === 400) {
        console.warn('⚠️ Bad Request khi load invoices. Có thể backend yêu cầu params hoặc permissions');
      } else if (error?.response?.status === 404) {
        console.warn('⚠️ Endpoint /invoices không tồn tại');
      } else if (error?.response?.status === 403) {
        console.warn('⚠️ Không có quyền xem invoices');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAppointments = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading completed appointments...');
      
      // Lấy tất cả appointments
      const response = await appointmentService.getAllAppointments({});
      console.log('API Response:', response);
      
      // Backend có thể trả về trực tiếp array hoặc object {appointments: [...]}
      const allAppointments = Array.isArray(response) 
        ? response 
        : ((response as any).appointments || []);
      
      console.log('All appointments loaded:', allAppointments.length);
      console.log('📦 Sample appointment:', allAppointments[0]);
      
      // Lấy tất cả invoices để check xem appointment nào đã có invoice
      let existingInvoices: any[] = [];
      try {
        existingInvoices = await invoiceService.getAllInvoices();
        console.log('📄 Existing invoices loaded:', existingInvoices.length);
      } catch (err) {
        console.warn('Could not load invoices for filtering, continuing...');
      }
      
      // Tạo Set các appointmentId đã có invoice (để check nhanh hơn)
      const appointmentIdsWithInvoice = new Set(
        existingInvoices
          .map((inv: any) => inv.appointmentId) // Lấy appointmentId trực tiếp từ invoice response
          .filter(Boolean) // Loại bỏ undefined/null
      );
      
      console.log('📋 Appointments already have invoices:', appointmentIdsWithInvoice.size);
      console.log('📋 AppointmentIds with invoice:', Array.from(appointmentIdsWithInvoice));
      
      // Lọc ra các appointment đã COMPLETED và CHƯA có invoice
      const completedAppointmentsWithoutInvoice = allAppointments.filter((apt: Appointment) => {
        const isCompleted = apt.status === 'COMPLETED';
        const hasNoInvoice = !appointmentIdsWithInvoice.has(apt.id);
        
        if (isCompleted && !hasNoInvoice) {
          console.log(`⏭️ Skipping appointment ${apt.id.substring(0, 8)} - already has invoice`);
        }
        
        return isCompleted && hasNoInvoice;
      });
      
      console.log('✅ Completed appointments WITHOUT invoice:', completedAppointmentsWithoutInvoice.length);
      console.log('Completed appointments data:', completedAppointmentsWithoutInvoice);
      
      setPendingAppointments(completedAppointmentsWithoutInvoice);
    } catch (error) {
      console.error('❌ Error loading pending appointments:', error);
      console.error('Error details:', error);
      setPendingAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.customerName?.toLowerCase().includes(term) ||
        invoice.vehicleLicensePlate?.toLowerCase().includes(term) ||
        invoice.id.toLowerCase().includes(term)
      );
    }

    setFilteredInvoices(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { icon: <Clock size={14} />, label: 'Chờ thanh toán', class: 'warning' },
      PAID: { icon: <CheckCircle size={14} />, label: 'Đã thanh toán', class: 'success' },
      CANCELLED: { icon: <XCircle size={14} />, label: 'Đã hủy', class: 'danger' },
      OVERDUE: { icon: <AlertCircle size={14} />, label: 'Quá hạn', class: 'danger' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleViewDetail = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  // Sort appointments by date - always newest first
  const getSortedAppointments = () => {
    const sorted = [...pendingAppointments].sort((a, b) => {
      const dateA = new Date(a.actualCompletion || a.appointmentDate).getTime();
      const dateB = new Date(b.actualCompletion || b.appointmentDate).getTime();
      return dateB - dateA; // Mới nhất trước
    });
    return sorted;
  };

  const renderPendingOrders = () => {
    console.log('🎨 Rendering pending orders, count:', pendingAppointments.length, 'loading:', loading);
    
    return (
    <div className="invoice-table-container">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : pendingAppointments.length === 0 ? (
        <div className="no-data">
          <Wrench size={48} />
          <p>Không có công việc hoàn thành nào</p>
          <p className="hint">
            Danh sách appointments đã hoàn thành sẽ hiển thị ở đây
          </p>
        </div>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Biển số xe</th>
              <th>Gói dịch vụ</th>
              <th>Ngày hoàn thành</th>
              <th>Kỹ thuật viên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {getSortedAppointments().map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.customerName || 'N/A'}</td>
                <td>
                  <span className="license-plate">
                    {appointment.vehicleLicensePlate || 'N/A'}
                  </span>
                </td>
                <td>
                  {appointment.selectedPackageNames ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {appointment.selectedPackageNames.split(', ').map((name, idx) => (
                        <span key={idx} style={{ fontSize: '0.9em' }}>• {name}</span>
                      ))}
                    </div>
                  ) : (
                    appointment.servicePackageName || 'N/A'
                  )}
                </td>
                <td>
                  {appointment.actualCompletion 
                    ? formatDate(new Date(appointment.actualCompletion).toISOString())
                    : formatDate(new Date(appointment.appointmentDate).toISOString())
                  }
                </td>
                <td>{appointment.technicianName || 'Chưa phân công'}</td>
                <td>
                  <span className="status-badge success">
                    <CheckCircle size={14} />
                    Đã hoàn thành
                  </span>
                </td>
                <td>
                  <div className="action-buttons" style={{ gap: '8px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      className="action-btn primary"
                      onClick={() => createInvoiceForAppointment(appointment.id)}
                      disabled={creatingInvoiceFor === appointment.id}
                      title="Tạo hóa đơn cho lịch hẹn này"
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: creatingInvoiceFor === appointment.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        opacity: creatingInvoiceFor === appointment.id ? 0.6 : 1,
                        minWidth: '160px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {creatingInvoiceFor === appointment.id ? (
                        <>
                          <RefreshCw size={20} className="spinning" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          Tạo hóa đơn
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    );
  };

  const renderInvoices = () => (
    <div className="invoice-table-container">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="no-data">
          <FileText size={48} />
          {searchTerm || statusFilter !== 'ALL' ? (
            <>
              <p>Không tìm thấy hóa đơn nào</p>
              <p className="hint">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </>
          ) : (
            <>
              <p>Chưa có hóa đơn nào trong hệ thống</p>
              <p className="hint">
                Tạo hóa đơn từ các công việc đã hoàn thành
              </p>
            </>
          )}
        </div>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Biển số xe</th>
              <th>Ngày lập</th>
              <th>Hạn thanh toán</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.customerName || 'N/A'}</td>
                <td>
                  <span className="license-plate">
                    {invoice.vehicleLicensePlate || 'N/A'}
                  </span>
                </td>
                <td>{formatDate(invoice.issueDate)}</td>
                <td>{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</td>
                <td>
                  <span className="amount">
                    {formatCurrency(invoice.finalAmount || invoice.totalAmount)}
                  </span>
                </td>
                <td>{getStatusBadge(invoice.status)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewDetail(invoice)}
                      title="Xem chi tiết hóa đơn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        borderRadius: '5px',
                        minWidth: 'auto',
                        width: 'auto',
                        height: 'auto'
                      }}
                    >
                      <Eye size={13} />
                      <span>Xem chi tiết</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const stats = [
    {
      icon: <Wrench />,
      label: 'Đã hoàn thành',
      value: pendingAppointments.length,
      color: 'orange'
    },
    {
      icon: <FileText />,
      label: 'Tổng hóa đơn',
      value: invoices.length,
      color: 'blue'
    },
    {
      icon: <Clock />,
      label: 'Chờ thanh toán',
      value: invoices.filter(i => i.status === 'PENDING').length,
      color: 'orange'
    },
    {
      icon: <CheckCircle />,
      label: 'Đã thanh toán',
      value: invoices.filter(i => i.status === 'PAID').length,
      color: 'green'
    }
  ];

  return (
    <div className="invoice-management">
      {/* Statistics Cards */}
      <div className="invoice-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View Mode Tabs */}
      <div className="view-tabs">
        <button
          className={`tab-btn ${viewMode === 'pending-appointments' ? 'active' : ''}`}
          onClick={() => setViewMode('pending-appointments')}
        >
          <Wrench size={18} />
          Công việc hoàn thành ({pendingAppointments.length})
        </button>
        <button
          className={`tab-btn ${viewMode === 'invoices' ? 'active' : ''}`}
          onClick={() => setViewMode('invoices')}
        >
          <FileText size={18} />
          Hóa đơn đã tạo ({invoices.length})
        </button>
        
        <button
          className="refresh-btn"
          onClick={() => {
            console.log('🔄 Refreshing all data...');
            loadData();
          }}
          style={{ marginLeft: 'auto' }}
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {/* Filters and Search - Only for invoices view */}
      {viewMode === 'invoices' && (
        <div className="invoice-controls">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách hàng, biển số xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Filter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="OVERDUE">Quá hạn</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'pending-appointments' ? renderPendingOrders() : renderInvoices()}

      {/* Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết hóa đơn</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-detail">
                <div className="detail-row">
                  <span className="label">Mã hóa đơn:</span>
                  <span className="value">#{selectedInvoice.id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{selectedInvoice.customerName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Biển số xe:</span>
                  <span className="value">{selectedInvoice.vehicleLicensePlate || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ngày lập:</span>
                  <span className="value">{formatDate(selectedInvoice.issueDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Hạn thanh toán:</span>
                  <span className="value">
                    {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Tổng tiền:</span>
                  <span className="value amount">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
                {selectedInvoice.discount && selectedInvoice.discount > 0 && (
                  <div className="detail-row">
                    <span className="label">Giảm giá:</span>
                    <span className="value discount">
                      -{formatCurrency(selectedInvoice.discount)}
                    </span>
                  </div>
                )}
                <div className="detail-row highlight">
                  <span className="label">Thành tiền:</span>
                  <span className="value amount">
                    {formatCurrency(selectedInvoice.finalAmount || selectedInvoice.totalAmount)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Trạng thái:</span>
                  <span className="value">{getStatusBadge(selectedInvoice.status)}</span>
                </div>
                {selectedInvoice.notes && (
                  <div className="detail-row full-width">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{selectedInvoice.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Input Modal */}
      {showPriceModal && selectedAppointmentForInvoice && (
        <div className="modal-overlay" onClick={() => {
          setShowPriceModal(false);
          setSelectedAppointmentForInvoice(null);
          setInvoiceAmount(0);
          setPackagePrice(0);
          setAdditionalFee(0);
          setPartsCount(0);
          setIssuesCount(0);
          setSuggestionsCount(0);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Tạo hóa đơn dịch vụ</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowPriceModal(false);
                  setSelectedAppointmentForInvoice(null);
                  setInvoiceAmount(0);
                  setPackagePrice(0);
                  setAdditionalFee(0);
                  setPartsCount(0);
                  setIssuesCount(0);
                  setSuggestionsCount(0);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-detail">
                <div className="detail-row">
                  <span className="label">Mã lịch hẹn:</span>
                  <span className="value">#{selectedAppointmentForInvoice.id.substring(0, 8)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{selectedAppointmentForInvoice.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Biển số xe:</span>
                  <span className="value">
                    <span className="license-plate">{selectedAppointmentForInvoice.vehicleLicensePlate}</span>
                  </span>
                </div>
                {/* Display all selected services */}
                {(() => {
                  const notesText = selectedAppointmentForInvoice.notes || '';
                  const servicesMatch = notesText.match(/📋 Các dịch vụ đã chọn \((\d+)\): (.+?)(?:\n|$)/);
                  
                  if (servicesMatch) {
                    const serviceCount = servicesMatch[1];
                    const servicesList = servicesMatch[2].split(', ').map((s: string) => s.trim());
                    
                    return (
                      <div style={{
                        backgroundColor: '#f0f9ff',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd',
                        marginBottom: '12px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          marginBottom: '8px',
                          color: '#0369a1',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          📋 Các dịch vụ đã đặt ({serviceCount})
                        </div>
                        <div style={{ paddingLeft: '8px' }}>
                          {servicesList.map((serviceName: string, index: number) => (
                            <div key={index} style={{
                              padding: '4px 0',
                              borderBottom: index < servicesList.length - 1 ? '1px dashed #bae6fd' : 'none',
                              color: '#0c4a6e',
                              fontSize: '13px'
                            }}>
                              {index + 1}. {serviceName}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="detail-row">
                        <span className="label">Gói dịch vụ:</span>
                        <span className="value">
                          {selectedAppointmentForInvoice.selectedPackageNames || selectedAppointmentForInvoice.servicePackageName}
                        </span>
                      </div>
                    );
                  }
                })()}
                
                {/* Display selected service packages */}
                {selectedPackages.length > 0 && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#495057' }}>
                      📦 Các gói dịch vụ đã chọn ({selectedPackages.length} gói):
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedPackages.map((pkg: any, index: number) => (
                        <div key={index} style={{ 
                          padding: '12px', 
                          backgroundColor: '#ffffff', 
                          borderRadius: '6px', 
                          border: '1px solid #e9ecef',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#212529', fontSize: '14px' }}>
                              {pkg.name || pkg.packageName || 'Gói dịch vụ'}
                            </div>
                            {pkg.description && (
                              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                                {pkg.description}
                              </div>
                            )}
                          </div>
                          <div style={{ fontWeight: 600, color: '#28a745', fontSize: '16px', whiteSpace: 'nowrap', marginLeft: '20px' }}>
                            {formatCurrency(pkg.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#495057' }}>Tổng giá trị các gói:</span>
                      <span style={{ fontWeight: 700, color: '#28a745', fontSize: '18px' }}>
                        {formatCurrency(selectedPackages.reduce((sum: number, pkg: any) => sum + (pkg.price || 0), 0))}
                      </span>
                    </div>
                  </div>
                )}
                
                <>
                  {/* DEBUG: Log state values at render time */}
                  {(() => {
                    console.log('🎨 RENDER TIME STATE:', {
                      partsCount,
                      partsTotal,
                      partsList,
                      suggestionsCount,
                      suggestionsTotal,
                      suggestionsList,
                      issuesCount,
                      issuesTotal,
                      issuesList,
                      selectedPackagesCount: selectedPackages.length
                    });
                    return null;
                  })()}
                  
                  <div style={{ margin: '24px 0', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                      💵 Chi phí dịch vụ
                    </h3>
                  
                  {/* Package Price - Hide this if selectedPackages is displayed */}
                  {selectedPackages.length === 0 && (
                    <div className="detail-row" style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '8px' }}>
                      <span className="label" style={{ fontSize: '14px' }}>Giá gói dịch vụ:</span>
                      <span className="value" style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                        {loadingPackagePrice ? 'Đang tải...' : formatCurrency(packagePrice)}
                      </span>
                    </div>
                  )}
                  
                  {/* Issue Pricing (Staff định giá) */}
                  {issuesList.length > 0 && (
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <AlertCircle size={16} color="#b45309" />
                        <span style={{ fontWeight: '600', color: '#b45309', fontSize: '14px' }}>
                          💰 Định giá vấn đề ({issuesList.length} vấn đề)
                        </span>
                      </div>
                      <div style={{ paddingLeft: '24px' }}>
                        {issuesList.map((issue: any, index: number) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: '4px 0',
                            fontSize: '12px',
                            color: '#92400e',
                            borderBottom: index < issuesList.length - 1 ? '1px dashed #fde68a' : 'none'
                          }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: '600' }}>• {issue.issue}</span>
                              {issue.severity && (
                                <span style={{ 
                                  marginLeft: '8px', 
                                  padding: '2px 6px', 
                                  backgroundColor: issue.severity === 'HIGH' ? '#fecaca' : issue.severity === 'MEDIUM' ? '#fed7aa' : '#fef3c7',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '600'
                                }}>
                                  {issue.severity}
                                </span>
                              )}
                            </div>
                            <span style={{ fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                              {issue.price?.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 24px 0 24px', fontSize: '13px', fontWeight: '600', color: '#b45309' }}>
                        <span>Tổng định giá vấn đề:</span>
                        <span>+{issuesTotal.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  )}

                  {/* Detailed list of added costs */}
                  {(partsList.length > 0 || suggestionsList.length > 0) && (
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #22c55e' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Wrench size={16} color="#15803d" />
                        <span style={{ fontWeight: '600', color: '#15803d', fontSize: '14px' }}>
                          Chi phí đã thêm bởi kỹ thuật viên
                        </span>
                      </div>
                      
                      {/* Parts detailed list */}
                      {partsList.length > 0 && (
                        <div style={{ marginBottom: suggestionsList.length > 0 ? '12px' : '0' }}>
                          <div style={{ fontWeight: '600', color: '#166534', fontSize: '13px', marginBottom: '8px', paddingLeft: '8px' }}>
                            🔧 Phụ tùng đã sử dụng ({partsList.length} loại):
                          </div>
                          <div style={{ paddingLeft: '24px' }}>
                            {partsList.map((part: any, index: number) => (
                              <div key={index} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '4px 0',
                                fontSize: '12px',
                                color: '#166534',
                                borderBottom: index < partsList.length - 1 ? '1px dashed #d1fae5' : 'none'
                              }}>
                                <span>• {part.partName} (x{part.quantity})</span>
                                <span style={{ fontWeight: '600' }}>{part.totalPrice?.toLocaleString('vi-VN')} đ</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 24px 0 24px', fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
                            <span>Tổng phụ tùng:</span>
                            <span>+{partsTotal.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Suggestions detailed list */}
                      {suggestionsList.length > 0 && (
                        <div>
                          <div style={{ fontWeight: '600', color: '#166534', fontSize: '13px', marginBottom: '8px', paddingLeft: '8px' }}>
                            💡 Dịch vụ bổ sung đã duyệt ({suggestionsList.length} dịch vụ):
                          </div>
                          <div style={{ paddingLeft: '24px' }}>
                            {suggestionsList.map((suggestion: any, index: number) => (
                              <div key={index} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '4px 0',
                                fontSize: '12px',
                                color: '#166534',
                                borderBottom: index < suggestionsList.length - 1 ? '1px dashed #d1fae5' : 'none'
                              }}>
                                <span>• {suggestion.serviceName}</span>
                                <span style={{ fontWeight: '600' }}>{suggestion.estimatedCost?.toLocaleString('vi-VN')} đ</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 24px 0 24px', fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
                            <span>Tổng dịch vụ bổ sung:</span>
                            <span>+{suggestionsTotal.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      )}
                      
                      <p style={{ margin: '12px 0 0 8px', fontSize: '12px', color: '#166534', fontStyle: 'italic' }}>
                        * Đã tính vào tổng tiền hóa đơn bên dưới
                      </p>
                    </div>
                  )}

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                      Phí phát sinh khác (nếu có):
                    </label>
                    <input
                      type="number"
                      value={additionalFee}
                      onChange={(e) => {
                        const fee = Number(e.target.value);
                        setAdditionalFee(fee);
                        // Calculate from arrays instead of state
                        const calculatedPartsTotal = partsList.reduce((sum, part) => sum + (part.totalPrice || 0), 0);
                        const calculatedSuggestionsTotal = suggestionsList.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);
                        const calculatedIssuesTotal = issuesList.reduce((sum, issue) => sum + (issue.price || 0), 0);
                        setInvoiceAmount(packagePrice + calculatedPartsTotal + calculatedSuggestionsTotal + calculatedIssuesTotal + fee);
                      }}
                      placeholder="Nhập phí phát sinh khác..."
                      min="0"
                      step="10000"
                      disabled={loadingPackagePrice}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '15px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontWeight: '600',
                        backgroundColor: loadingPackagePrice ? '#f1f5f9' : 'white'
                      }}
                    />
                    <p style={{ marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                      💡 VD: Chi phí vận chuyển, lưu xe qua đêm, phí tiện ích khác...
                    </p>
                  </div>
                </div>

                {/* Calculation Summary */}
                {!loadingPackagePrice && (
                  <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>
                      📊 Tổng kết chi phí
                    </h3>
                    
                    <div className="detail-row" style={{ marginBottom: '8px' }}>
                      <span className="label">Giá gói dịch vụ:</span>
                      <span className="value">{formatCurrency(packagePrice)}</span>
                    </div>
                    
                    {(() => {
                      // Calculate totals from arrays (more reliable than state)
                      const calculatedIssuesTotal = issuesList.reduce((sum, issue) => sum + (issue.price || 0), 0);
                      const calculatedPartsTotal = partsList.reduce((sum, part) => sum + (part.totalPrice || 0), 0);
                      const calculatedSuggestionsTotal = suggestionsList.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);
                      
                      return (
                        <>
                          {calculatedIssuesTotal > 0 && (
                            <div className="detail-row" style={{ marginBottom: '8px' }}>
                              <span className="label">Định giá vấn đề:</span>
                              <span className="value" style={{ color: '#f59e0b' }}>+{formatCurrency(calculatedIssuesTotal)}</span>
                            </div>
                          )}
                          
                          {calculatedPartsTotal > 0 && (
                            <div className="detail-row" style={{ marginBottom: '8px' }}>
                              <span className="label">Chi phí phụ tùng:</span>
                              <span className="value" style={{ color: '#22c55e' }}>+{formatCurrency(calculatedPartsTotal)}</span>
                            </div>
                          )}
                          
                          {calculatedSuggestionsTotal > 0 && (
                            <div className="detail-row" style={{ marginBottom: '8px' }}>
                              <span className="label">Dịch vụ bổ sung:</span>
                              <span className="value" style={{ color: '#22c55e' }}>+{formatCurrency(calculatedSuggestionsTotal)}</span>
                            </div>
                          )}
                          
                          {additionalFee > 0 && (
                            <div className="detail-row" style={{ marginBottom: '8px' }}>
                              <span className="label">Phí phát sinh khác:</span>
                              <span className="value" style={{ color: '#ea580c' }}>+{formatCurrency(additionalFee)}</span>
                            </div>
                          )}
                          
                          <div className="detail-row highlight" style={{ fontSize: '18px', fontWeight: '800', paddingTop: '12px', borderTop: '2px solid #3b82f6' }}>
                            <span className="label" style={{ color: '#1e40af' }}>TỔNG THANH TOÁN:</span>
                            <span className="value amount" style={{ fontSize: '20px' }}>{formatCurrency(packagePrice + calculatedIssuesTotal + calculatedPartsTotal + calculatedSuggestionsTotal + additionalFee)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
                </>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPriceModal(false);
                  setSelectedAppointmentForInvoice(null);
                  setInvoiceAmount(0);
                  setPackagePrice(0);
                  setAdditionalFee(0);
                  setPartsCount(0);
                  setIssuesCount(0);
                  setSuggestionsCount(0);
                  setChecklistItems([]);
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (invoiceAmount <= 0) {
                    alert('Số tiền không hợp lệ!');
                    return;
                  }
                  createInvoiceForAppointment(selectedAppointmentForInvoice.id, invoiceAmount);
                }}
                disabled={loadingPackagePrice || invoiceAmount <= 0}
                style={{
                  opacity: loadingPackagePrice || invoiceAmount <= 0 ? 0.5 : 1,
                  cursor: loadingPackagePrice || invoiceAmount <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <Plus size={16} />
                {loadingPackagePrice ? 'Đang tải...' : 'Tạo hóa đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
