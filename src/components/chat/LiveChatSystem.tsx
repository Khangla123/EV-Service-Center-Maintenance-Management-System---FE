import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  Image, 
  Smile,
  MoreVertical,
  Search,
  Users,
  Clock,
  CheckCheck,
  Circle,
  AlertCircle,
  Settings,
  Archive,
  Star
} from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'staff' | 'admin';
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  replyTo?: string;
  attachments?: MessageAttachment[];
}

interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video';
  size: number;
  url: string;
}

interface ChatConversation {
  id: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  status: 'active' | 'archived' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'appointment' | 'complaint';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  tags?: string[];
  customerSatisfaction?: number;
}

interface ChatParticipant {
  id: string;
  name: string;
  role: 'customer' | 'staff' | 'admin';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface QuickReply {
  id: string;
  text: string;
  category: string;
  isActive: boolean;
}

const LiveChatSystem: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unread' | 'assigned'>('all');
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ChatParticipant[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  useEffect(() => {
    const mockParticipants: ChatParticipant[] = [
      {
        id: 'cust1',
        name: 'Nguyễn Văn A',
        role: 'customer',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        id: 'staff1',
        name: 'Trần Thị B - Tư vấn viên',
        role: 'staff',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        id: 'cust2',
        name: 'Lê Văn C',
        role: 'customer',
        isOnline: false,
        lastSeen: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: 'staff2',
        name: 'Phạm Văn D - Kỹ thuật viên',
        role: 'staff',
        isOnline: true,
        lastSeen: new Date()
      }
    ];

    const mockConversations: ChatConversation[] = [
      {
        id: 'chat1',
        participants: [mockParticipants[0], mockParticipants[1]],
        unreadCount: 2,
        status: 'active',
        priority: 'high',
        category: 'technical',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000),
        assignedTo: 'staff1',
        tags: ['VF8', 'phanh', 'khẩn cấp'],
        customerSatisfaction: 4.5
      },
      {
        id: 'chat2',
        participants: [mockParticipants[2], mockParticipants[3]],
        unreadCount: 0,
        status: 'active',
        priority: 'normal',
        category: 'appointment',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        assignedTo: 'staff2',
        tags: ['đặt lịch', 'bảo dưỡng'],
        customerSatisfaction: 5.0
      },
      {
        id: 'chat3',
        participants: [
          { id: 'cust3', name: 'Hoàng Thị E', role: 'customer', isOnline: false, lastSeen: new Date(Date.now() - 60 * 60 * 1000) },
          mockParticipants[1]
        ],
        unreadCount: 1,
        status: 'active',
        priority: 'urgent',
        category: 'complaint',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
        assignedTo: 'staff1',
        tags: ['khiếu nại', 'hoàn tiền'],
        customerSatisfaction: 2.0
      }
    ];

    const mockMessages: Message[] = [
      {
        id: 'msg1',
        chatId: 'chat1',
        senderId: 'cust1',
        senderName: 'Nguyễn Văn A',
        senderRole: 'customer',
        content: 'Chào anh/chị, xe VF8 của em bị vấn đề về hệ thống phanh, có thể hỗ trợ em được không?',
        type: 'text',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg2',
        chatId: 'chat1',
        senderId: 'staff1',
        senderName: 'Trần Thị B',
        senderRole: 'staff',
        content: 'Chào anh Nguyễn! Em có thể mô tả cụ thể hơn về triệu chứng xe anh gặp phải không?',
        type: 'text',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg3',
        chatId: 'chat1',
        senderId: 'cust1',
        senderName: 'Nguyễn Văn A',
        senderRole: 'customer',
        content: 'Khi phanh xe có tiếng kêu lạ và cảm giác phanh không hiệu quả. Em đính kèm video cho chị xem.',
        type: 'text',
        timestamp: new Date(Date.now() - 6 * 60 * 1000),
        status: 'read',
        attachments: [
          {
            id: 'att1',
            name: 'video_phanh_xe.mp4',
            type: 'video',
            size: 15000000,
            url: '/uploads/video_phanh_xe.mp4'
          }
        ]
      },
      {
        id: 'msg4',
        chatId: 'chat1',
        senderId: 'staff1',
        senderName: 'Trần Thị B',
        senderRole: 'staff',
        content: 'Cảm ơn anh đã gửi video. Qua mô tả và video, có vẻ như má phanh của xe anh cần được thay thế. Em sẽ đặt lịch hẹn cho anh kiểm tra chi tiết nhé.',
        type: 'text',
        timestamp: new Date(Date.now() - 4 * 60 * 1000),
        status: 'delivered'
      },
      {
        id: 'msg5',
        chatId: 'chat1',
        senderId: 'cust1',
        senderName: 'Nguyễn Văn A',
        senderRole: 'customer',
        content: 'Được rồi chị, khi nào có thể đến được? Chi phí khoảng bao nhiêu vậy?',
        type: 'text',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: 'sent'
      }
    ];

    const mockQuickReplies: QuickReply[] = [
      { id: 'qr1', text: 'Cảm ơn bạn đã liên hệ với chúng tôi!', category: 'greeting', isActive: true },
      { id: 'qr2', text: 'Tôi sẽ kiểm tra và phản hồi bạn ngay.', category: 'response', isActive: true },
      { id: 'qr3', text: 'Bạn có thể đặt lịch hẹn qua website hoặc hotline.', category: 'appointment', isActive: true },
      { id: 'qr4', text: 'Thời gian bảo hành là 2 năm hoặc 40.000km.', category: 'warranty', isActive: true },
      { id: 'qr5', text: 'Trung tâm mở cửa từ 8:00 - 17:30 hàng ngày.', category: 'hours', isActive: true }
    ];

    setConversations(mockConversations);
    setMessages(mockMessages);
    setQuickReplies(mockQuickReplies);
    setOnlineUsers(mockParticipants.filter(p => p.isOnline));
    
    // Set first conversation as active
    setActiveChat(mockConversations[0]);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || conversation.tags?.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'unread' && conversation.unreadCount > 0) ||
      (filterStatus === 'active' && conversation.status === 'active') ||
      (filterStatus === 'assigned' && conversation.assignedTo);
    
    return matchesSearch && matchesFilter;
  });

  const activeChatMessages = messages.filter(msg => msg.chatId === activeChat?.id);

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      chatId: activeChat.id,
      senderId: 'current_staff', // In real app, get from auth context
      senderName: 'Nhân viên hỗ trợ',
      senderRole: 'staff',
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeChat.id
          ? { ...conv, updatedAt: new Date(), lastMessage: message }
          : conv
      )
    );

    // Simulate message delivery status update
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    }, 1000);
  };

  const handleQuickReply = (text: string) => {
    setNewMessage(text);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeChat) return;

    // In real app, upload file and get URL
    const attachment: MessageAttachment = {
      id: `att_${Date.now()}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      size: file.size,
      url: URL.createObjectURL(file)
    };

    const message: Message = {
      id: `msg_${Date.now()}`,
      chatId: activeChat.id,
      senderId: 'current_staff',
      senderName: 'Nhân viên hỗ trợ',
      senderRole: 'staff',
      content: `Đã gửi file: ${file.name}`,
      type: 'file',
      timestamp: new Date(),
      status: 'sent',
      attachments: [attachment]
    };

    setMessages(prev => [...prev, message]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'normal': return 'text-blue-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return '🔧';
      case 'billing': return '💰';
      case 'appointment': return '📅';
      case 'complaint': return '😞';
      default: return '💬';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="live-chat-system h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
            <div className="flex space-x-2">
              <MDButton size="small" variant="outlined">
                <Settings className="h-4 w-4" />
              </MDButton>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc hội thoại..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'unread', label: 'Chưa đọc' },
              { id: 'active', label: 'Đang hoạt động' },
              { id: 'assigned', label: 'Được phân công' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterStatus(id as typeof filterStatus)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filterStatus === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const customer = conversation.participants.find(p => p.role === 'customer');
            const isActive = activeChat?.id === conversation.id;
            
            return (
              <div
                key={conversation.id}
                onClick={() => setActiveChat(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="relative">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {customer?.name?.charAt(0) || 'U'}
                        </div>
                        {customer?.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {customer?.name || 'Unknown User'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs">{getCategoryIcon(conversation.category)}</span>
                          <span className={`text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                            {conversation.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {conversation.updatedAt.toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {conversation.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-2 flex flex-col items-end space-y-1">
                    {conversation.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                        {conversation.unreadCount}
                      </div>
                    )}
                    
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                      {conversation.status === 'active' && 'Hoạt động'}
                      {conversation.status === 'archived' && 'Lưu trữ'}
                      {conversation.status === 'closed' && 'Đã đóng'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {activeChat.participants.find(p => p.role === 'customer')?.name?.charAt(0) || 'U'}
                    </div>
                    {activeChat.participants.find(p => p.role === 'customer')?.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeChat.participants.find(p => p.role === 'customer')?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{getCategoryIcon(activeChat.category)} {activeChat.category}</span>
                      {activeChat.customerSatisfaction && (
                        <span className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          {activeChat.customerSatisfaction}/5.0
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MDButton size="small" variant="outlined">
                    <Phone className="h-4 w-4" />
                  </MDButton>
                  <MDButton size="small" variant="outlined">
                    <Video className="h-4 w-4" />
                  </MDButton>
                  <MDButton size="small" variant="outlined">
                    <MoreVertical className="h-4 w-4" />
                  </MDButton>
                </div>
              </div>
              
              {/* Tags */}
              {activeChat.tags && activeChat.tags.length > 0 && (
                <div className="flex items-center space-x-2 mt-2">
                  {activeChat.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChatMessages.map((message) => {
                const isFromCustomer = message.senderRole === 'customer';
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromCustomer ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      isFromCustomer 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-blue-500 text-white'
                    } rounded-lg px-4 py-2`}>
                      {!isFromCustomer && (
                        <p className="text-xs text-blue-100 mb-1">{message.senderName}</p>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className={`p-2 rounded border ${
                                isFromCustomer 
                                  ? 'bg-white border-gray-200' 
                                  : 'bg-blue-400 border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {attachment.type === 'image' && <Image className="h-4 w-4" />}
                                {attachment.type === 'video' && <Video className="h-4 w-4" />}
                                {attachment.type === 'document' && <Paperclip className="h-4 w-4" />}
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{attachment.name}</p>
                                  <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        isFromCustomer ? 'text-gray-500' : 'text-blue-100'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {!isFromCustomer && (
                          <div className="flex items-center space-x-1">
                            {message.status === 'sent' && <Circle className="h-3 w-3" />}
                            {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                            {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-200" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">Đang soạn tin...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex space-x-2 overflow-x-auto">
                {quickReplies.slice(0, 4).map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReply(reply.text)}
                    className="flex-shrink-0 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <MDButton
                  size="small"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </MDButton>
                
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{ minHeight: '40px', maxHeight: '100px' }}
                  />
                </div>
                
                <MDButton
                  size="small"
                  variant="outlined"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </MDButton>
                
                <MDButton
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                >
                  <Send className="h-4 w-4" />
                </MDButton>
              </div>
            </div>
          </>
        ) : (
          // No chat selected
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn cuộc hội thoại</h3>
              <p className="text-gray-600">Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu chat</p>
            </div>
          </div>
        )}
      </div>

      {/* Online Users Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <Users className="h-5 w-5 inline mr-2" />
          Đang trực tuyến ({onlineUsers.length})
        </h3>
        
        <div className="space-y-3">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Chat Statistics */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Thống kê hôm nay</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Cuộc hội thoại:</span>
              <span className="font-medium">{conversations.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Tin nhắn:</span>
              <span className="font-medium">{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Phản hồi TB:</span>
              <span className="font-medium">3.2 phút</span>
            </div>
            <div className="flex justify-between">
              <span>Hài lòng:</span>
              <span className="font-medium text-green-600">94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatSystem;