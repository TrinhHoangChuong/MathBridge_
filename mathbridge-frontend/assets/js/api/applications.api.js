// Các hàm hỗ trợ API quản lý hồ sơ ứng tuyển
// Mục đích: Dành cho admin quản lý hồ sơ ứng tuyển
// Tính năng: Xem, cập nhật trạng thái, lọc, tìm kiếm hồ sơ

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api/public/jobs';

/**
 * Cập nhật trạng thái hồ sơ ứng tuyển
 * @param {string} idUv - ID hồ sơ ứng tuyển
 * @param {string} status - Trạng thái mới
 * @returns {Promise<Object>} Dữ liệu phản hồi từ server
 */
export async function updateApplicationStatus(idUv, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${idUv}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! mã trạng thái: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái hồ sơ:', error);
    throw error;
  }
}

/**
 * Lấy thông tin hồ sơ ứng tuyển theo ID
 * @param {string} idUv - ID hồ sơ ứng tuyển
 * @returns {Promise<Object>} Dữ liệu hồ sơ ứng tuyển
 */
export async function getApplication(idUv) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${idUv}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! mã trạng thái: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy thông tin hồ sơ:', error);
    throw error;
  }
}

/**
 * Các hằng số trạng thái hồ sơ ứng tuyển
 */
export const APPLICATION_STATUS = {
  PENDING: 'Đang chờ duyệt',
  REVIEWING: 'Đang xem xét',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  INTERVIEW_SCHEDULED: 'Đã lên lịch phỏng vấn',
  INTERVIEWED: 'Đã phỏng vấn',
  HIRED: 'Đã tuyển dụng',
  NOT_SELECTED: 'Không được chọn'
};

/**
 * Lấy thông tin hiển thị trạng thái với styling phù hợp
 * @param {string} status - Giá trị trạng thái
 * @returns {Object} Thông tin hiển thị trạng thái
 */
export function getStatusDisplay(status) {
  const statusMap = {
    [APPLICATION_STATUS.PENDING]: {
      text: 'Đang chờ duyệt',
      class: 'status-pending',
      color: '#f59e0b'
    },
    [APPLICATION_STATUS.REVIEWING]: {
      text: 'Đang xem xét',
      class: 'status-reviewing',
      color: '#3b82f6'
    },
    [APPLICATION_STATUS.APPROVED]: {
      text: 'Đã duyệt',
      class: 'status-approved',
      color: '#10b981'
    },
    [APPLICATION_STATUS.REJECTED]: {
      text: 'Đã từ chối',
      class: 'status-rejected',
      color: '#ef4444'
    },
    [APPLICATION_STATUS.INTERVIEW_SCHEDULED]: {
      text: 'Đã lên lịch phỏng vấn',
      class: 'status-interview-scheduled',
      color: '#8b5cf6'
    },
    [APPLICATION_STATUS.INTERVIEWED]: {
      text: 'Đã phỏng vấn',
      class: 'status-interviewed',
      color: '#06b6d4'
    },
    [APPLICATION_STATUS.HIRED]: {
      text: 'Đã tuyển dụng',
      class: 'status-hired',
      color: '#059669'
    },
    [APPLICATION_STATUS.NOT_SELECTED]: {
      text: 'Không được chọn',
      class: 'status-not-selected',
      color: '#6b7280'
    }
  };

  return statusMap[status] || {
    text: status || 'Chưa xác định',
    class: 'status-unknown',
    color: '#6b7280'
  };
}

// Làm cho các hàm có thể sử dụng toàn cục để tương thích ngược
window.updateApplicationStatus = updateApplicationStatus;
window.getApplication = getApplication;
window.APPLICATION_STATUS = APPLICATION_STATUS;
window.getStatusDisplay = getStatusDisplay;
