// Tutor API Service
class TutorAPI {
    constructor() {
        this.baseURL = 'http://localhost:8080/api/portal/tutor';
        this.loadToken();
    }

    // Load token from localStorage (support both old and new format)
    loadToken() {
        // Ưu tiên lấy từ mb_token (format mới từ loginPortal)
        this.token = localStorage.getItem('mb_token') || 
                     localStorage.getItem('authToken');
        
        // Nếu không có token trực tiếp, thử lấy từ mb_auth
        if (!this.token) {
            const authData = localStorage.getItem('mb_auth');
            if (authData) {
                try {
                    const data = JSON.parse(authData);
                    this.token = data.token || data.accessToken;
                } catch (e) {
                    console.error('Error parsing auth data:', e);
                }
            }
        }
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        // Lưu vào cả 2 format để tương thích
        localStorage.setItem('mb_token', token);
        localStorage.setItem('authToken', token);
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Đảm bảo token được load mới nhất
        if (!this.token) {
            this.loadToken();
        }
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                // Try to get error message from response
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                
                const error = new Error(errorMessage);
                error.status = response.status;
                error.response = response;
                throw error;
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Dashboard API Methods
    async getDashboardStats() {
        return await this.request('/dashboard/stats');
    }

    async getRecentStudents() {
        return await this.request('/students/recent');
    }

    async getRecentPayments() {
        return await this.request('/payments/recent');
    }

    async getWeeklySchedule() {
        return await this.request('/schedule/weekly');
    }

    // Student Management API Methods
    async getStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/students?${queryString}` : '/students';
        return await this.request(endpoint);
    }

    async getStudentById(id) {
        return await this.request(`/students/${id}`);
    }

    async createStudent(studentData) {
        return await this.request('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    }

    async updateStudent(id, studentData) {
        return await this.request(`/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
    }

    async deleteStudent(id) {
        return await this.request(`/students/${id}`, {
            method: 'DELETE'
        });
    }

    async getStudentClasses(studentId) {
        return await this.request(`/students/${studentId}/classes`);
    }

    async getStudentProgress(studentId) {
        return await this.request(`/students/${studentId}/progress`);
    }

    // Teacher Management API Methods
    async getTeachers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/teachers?${queryString}` : '/teachers';
        return await this.request(endpoint);
    }

    async getTeacherById(id) {
        return await this.request(`/teachers/${id}`);
    }

    async createTeacher(teacherData) {
        return await this.request('/teachers', {
            method: 'POST',
            body: JSON.stringify(teacherData)
        });
    }

    async updateTeacher(id, teacherData) {
        return await this.request(`/teachers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(teacherData)
        });
    }

    async deleteTeacher(id) {
        return await this.request(`/teachers/${id}`, {
            method: 'DELETE'
        });
    }

    async getTeacherSchedule(teacherId) {
        return await this.request(`/teachers/${teacherId}/schedule`);
    }

    async getTeacherClasses(teacherId) {
        return await this.request(`/teachers/${teacherId}/classes`);
    }

    async getTeacherPerformance(teacherId) {
        return await this.request(`/teachers/${teacherId}/performance`);
    }

    // Class Management API Methods
    async getClasses(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/classes?${queryString}` : '/classes';
        return await this.request(endpoint);
    }

    async getClassById(id) {
        return await this.request(`/classes/${id}`);
    }

    async createClass(classData) {
        return await this.request('/classes', {
            method: 'POST',
            body: JSON.stringify(classData)
        });
    }

    async updateClass(id, classData) {
        return await this.request(`/classes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(classData)
        });
    }

    async deleteClass(id) {
        return await this.request(`/classes/${id}`, {
            method: 'DELETE'
        });
    }

    async getClassStudents(classId) {
        return await this.request(`/classes/${classId}/students`);
    }

    async getClassSchedule(classId) {
        return await this.request(`/classes/${classId}/schedule`);
    }

    async getClassAttendance(classId) {
        return await this.request(`/classes/${classId}/attendance`);
    }

    async getClassGrades(classId) {
        return await this.request(`/classes/${classId}/grades`);
    }

    // Payment Management API Methods
    async getPayments(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/payments?${queryString}` : '/payments';
        return await this.request(endpoint);
    }

    async getPaymentById(id) {
        return await this.request(`/payments/${id}`);
    }

    async createPayment(paymentData) {
        return await this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    async updatePayment(id, paymentData) {
        return await this.request(`/payments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(paymentData)
        });
    }

    async processPayment(id) {
        return await this.request(`/payments/${id}/process`, {
            method: 'POST'
        });
    }

    async cancelPayment(id) {
        return await this.request(`/payments/${id}/cancel`, {
            method: 'POST'
        });
    }

    async getPaymentHistory(studentId) {
        return await this.request(`/payments/student/${studentId}`);
    }

    async generateInvoice(paymentId) {
        return await this.request(`/payments/${paymentId}/invoice`, {
            method: 'POST'
        });
    }

    // Support Management API Methods
    async getSupportRequests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/support?${queryString}` : '/support';
        return await this.request(endpoint);
    }

    async getSupportRequestById(id) {
        return await this.request(`/support/${id}`);
    }

    async createSupportRequest(supportData) {
        return await this.request('/support', {
            method: 'POST',
            body: JSON.stringify(supportData)
        });
    }

    async updateSupportRequest(id, supportData) {
        return await this.request(`/support/${id}`, {
            method: 'PUT',
            body: JSON.stringify(supportData)
        });
    }

    async processSupportRequest(id) {
        return await this.request(`/support/${id}/process`, {
            method: 'POST'
        });
    }

    async closeSupportRequest(id) {
        return await this.request(`/support/${id}/close`, {
            method: 'POST'
        });
    }

    async getSupportCategories() {
        return await this.request('/support/categories');
    }

    async getSupportStats() {
        return await this.request('/support/stats');
    }

    // Message Management API Methods
    async getMessages(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/messages?${queryString}` : '/messages';
        return await this.request(endpoint);
    }

    async getMessageById(id) {
        return await this.request(`/messages/${id}`);
    }

    async sendMessage(messageData) {
        return await this.request('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    async replyToMessage(messageId, replyData) {
        return await this.request(`/messages/${messageId}/reply`, {
            method: 'POST',
            body: JSON.stringify(replyData)
        });
    }

    async markMessageAsRead(messageId) {
        return await this.request(`/messages/${messageId}/read`, {
            method: 'POST'
        });
    }

    async markMessageAsUnread(messageId) {
        return await this.request(`/messages/${messageId}/unread`, {
            method: 'POST'
        });
    }

    async deleteMessage(messageId) {
        return await this.request(`/messages/${messageId}`, {
            method: 'DELETE'
        });
    }

    async getConversation(participantId) {
        return await this.request(`/messages/conversation/${participantId}`);
    }

    async getUnreadMessagesCount() {
        return await this.request('/messages/unread-count');
    }

    // Report API Methods
    async getStudentReport(studentId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/reports/student/${studentId}?${queryString}` : `/reports/student/${studentId}`;
        return await this.request(endpoint);
    }

    async getTeacherReport(teacherId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/reports/teacher/${teacherId}?${queryString}` : `/reports/teacher/${teacherId}`;
        return await this.request(endpoint);
    }

    async getClassReport(classId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/reports/class/${classId}?${queryString}` : `/reports/class/${classId}`;
        return await this.request(endpoint);
    }

    async getPaymentReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/reports/payments?${queryString}` : '/reports/payments';
        return await this.request(endpoint);
    }

    async getSupportReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/reports/support?${queryString}` : '/reports/support';
        return await this.request(endpoint);
    }

    // Notification API Methods
    async getNotifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
        return await this.request(endpoint);
    }

    async markNotificationAsRead(notificationId) {
        return await this.request(`/notifications/${notificationId}/read`, {
            method: 'POST'
        });
    }

    async markAllNotificationsAsRead() {
        return await this.request('/notifications/read-all', {
            method: 'POST'
        });
    }

    async getUnreadNotificationsCount() {
        return await this.request('/notifications/unread-count');
    }

    // Profile API Methods
    async getProfile() {
        return await this.request('/profile');
    }

    async updateProfile(profileData) {
        return await this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(passwordData) {
        return await this.request('/profile/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    }

    // Authentication API Methods
    async login(credentials) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.token) {
            this.setToken(data.token);
        }
        
        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            // Xóa tất cả các token liên quan
            localStorage.removeItem('authToken');
            localStorage.removeItem('mb_token');
            localStorage.removeItem('mb_token_type');
        }
    }

    async refreshToken() {
        const response = await this.request('/auth/refresh', {
            method: 'POST'
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    // Utility Methods
    isAuthenticated() {
        return !!this.token;
    }

    getToken() {
        return this.token;
    }

    // Assigned Students API Methods
    async getAssignedStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/assigned-students?${queryString}` : '/assigned-students';
        return await this.request(endpoint);
    }

    async getStudentDetails(studentId) {
        return await this.request(`/assigned-students/${studentId}`);
    }

    async addStudentNote(studentId, note) {
        return await this.request(`/assigned-students/${studentId}/notes`, {
            method: 'POST',
            body: JSON.stringify({ note })
        });
    }

    async generateStudentReport(studentId) {
        return await this.request(`/assigned-students/${studentId}/report`);
    }

    // Consultation Schedule API Methods
    async getConsultationSchedule(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/consultation-schedule?${queryString}` : '/consultation-schedule';
        return await this.request(endpoint);
    }

    async createConsultation(formData) {
        return await this.request('/consultation-schedule', {
            method: 'POST',
            body: formData
        });
    }

    async updateConsultationContent(consultationId, content) {
        return await this.request(`/consultation-schedule/${consultationId}/content`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
    }

    async getConsultationById(id) {
        return await this.request(`/consultation-schedule/${id}`);
    }

    async cancelConsultation(id) {
        return await this.request(`/consultation-schedule/${id}/cancel`, {
            method: 'POST'
        });
    }

    // Enhanced Payment API Methods for Tutor
    async getUnpaidInvoices() {
        return await this.request('/payments/unpaid');
    }

    async getPaymentDetails(idHoaDon) {
        return await this.request(`/payments/details/${idHoaDon}`);
    }

    async getPaymentMethods() {
        return await this.request('/payments/methods');
    }

    async processPayment(paymentData) {
        return await this.request('/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    async getInvoiceDetails(idHoaDon) {
        return await this.request(`/payments/invoice/${idHoaDon}`);
    }

    async getAllInvoices() {
        return await this.request('/payments/all');
    }

    async createPayment(formData) {
        return await this.request('/payments', {
            method: 'POST',
            body: formData
        });
    }

    async updatePaymentStatus(paymentId, status) {
        return await this.request(`/payments/${paymentId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async getPaymentHistory(studentId) {
        return await this.request(`/payments/student/${studentId}`);
    }

    async getPaymentById(paymentId) {
        return await this.request(`/payments/${paymentId}`);
    }

    async updatePayment(paymentId, formData) {
        return await this.request(`/payments/${paymentId}`, {
            method: 'PUT',
            body: formData
        });
    }

    async generateReceipt(paymentId) {
        return await this.request(`/payments/${paymentId}/receipt`);
    }

    // Enhanced Consultation Schedule API Methods
    async startConsultation(consultationId) {
        return await this.request(`/consultation-schedule/${consultationId}/start`, {
            method: 'POST'
        });
    }

    async exportConsultationSchedule() {
        return await this.request('/consultation-schedule/export');
    }

    async saveConsultationReview(consultationId, reviewData) {
        return await this.request(`/consultation-schedule/${consultationId}/review`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    // Enhanced Message API Methods for Tutor
    async sendMessage(studentId, message) {
        return await this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({ studentId, message })
        });
    }

    async getQuickResponse(type) {
        return await this.request(`/messages/quick-response/${type}`);
    }

    async getConversationHistory(studentId) {
        return await this.request(`/messages/conversation/${studentId}`);
    }

    async markMessageAsRead(messageId) {
        return await this.request(`/messages/${messageId}/read`, {
            method: 'POST'
        });
    }

    // Study Guidance API Methods
    async getStudyGuidance(program) {
        return await this.request(`/study-guidance/${program}`);
    }

    async getProgramGuidance() {
        return await this.request('/study-guidance/programs');
    }

    // Error handling
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.message.includes('401')) {
            // Unauthorized - redirect to login
            this.logout();
            window.location.href = '/login';
        } else if (error.message.includes('403')) {
            // Forbidden - show access denied message
            alert('Bạn không có quyền truy cập vào tài nguyên này.');
        } else if (error.message.includes('404')) {
            // Not found
            alert('Không tìm thấy dữ liệu yêu cầu.');
        } else if (error.message.includes('500')) {
            // Server error
            alert('Lỗi máy chủ. Vui lòng thử lại sau.');
        } else {
            // Generic error
            alert('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    }
}

// Create global instance
window.tutorAPI = new TutorAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorAPI;
}
