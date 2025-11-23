// Consultations Section Module
(function() {
  'use strict';

  // Helper functions
  function getInitials(name) {
    if (!name) return "CV";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
  }

  function getTimeAgo(dateTime) {
    if (!dateTime) return "Không xác định";
    try {
      const date = new Date(dateTime);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      return "Không xác định";
    }
  }

  function showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // Consultations Module
  const ConsultationsModule = {
    allConsultations: [],

    async loadData() {
      const container = document.getElementById("consultationsContainer");
      const loadingState = document.getElementById("consultationsLoading");

      if (!container) return;

      try {
        if (loadingState) loadingState.style.display = "block";

        const consultations = await window.tutorAPI.getConsultations();

        if (loadingState) loadingState.style.display = "none";

        if (!consultations || consultations.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Chưa có yêu cầu tư vấn nào</p>
            </div>
          `;
          this.updateStats([]);
          return;
        }

        // Update statistics
        if (consultations && consultations.length > 0) {
          this.updateStats(consultations);
        } else {
          this.updateStats([]);
        }

        // Sort by date (newest first) - default
        consultations.sort((a, b) => {
          const dateA = new Date(a.thoiDiemTao);
          const dateB = new Date(b.thoiDiemTao);
          return dateB - dateA;
        });

        // Render consultations
        this.render(consultations);

        // Setup search and filter
        this.setupFilters(consultations);
      } catch (error) {
        console.error("Error loading consultations:", error);
        if (loadingState) loadingState.style.display = "none";
        container.innerHTML = `
          <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Có lỗi xảy ra khi tải yêu cầu tư vấn</p>
            <button class="btn btn-primary" onclick="window.consultationsModule.loadData()">
              Thử lại
            </button>
          </div>
        `;
      }
    },

    updateStats(consultations) {
      const statPendingEl = document.getElementById("statPendingConsultations");
      const statProcessingEl = document.getElementById("statProcessingConsultations");
      const statCompletedEl = document.getElementById("statCompletedConsultations");
      const statTotalEl = document.getElementById("statTotalConsultations");

      if (!statPendingEl || !statProcessingEl || !statCompletedEl || !statTotalEl) {
        console.warn("Consultation stat elements not found");
        return;
      }

      if (!consultations || consultations.length === 0) {
        statPendingEl.textContent = "0";
        statProcessingEl.textContent = "0";
        statCompletedEl.textContent = "0";
        statTotalEl.textContent = "0";
        return;
      }

      let pending = 0;
      let processing = 0;
      let completed = 0;

      consultations.forEach((c) => {
        if (!c) return;
        
        let status = "";
        if (c.trangThai !== null && c.trangThai !== undefined) {
          status = String(c.trangThai).trim();
        }
        
        // Direct comparison first
        if (status === "Chưa xử lý") {
          pending++;
        } else if (status === "Đang xử lý") {
          processing++;
        } else if (status === "Đã xử lý") {
          completed++;
        } else if (status.length > 0) {
          // Fallback: normalize and compare
          const normalized = status.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
          
          if (normalized.includes("chua") && normalized.includes("xu ly")) {
            pending++;
          } else if (normalized.includes("dang") && normalized.includes("xu ly")) {
            processing++;
          } else if (normalized.includes("da") && normalized.includes("xu ly")) {
            completed++;
          }
        }
      });

      const total = consultations.length;

      statPendingEl.textContent = pending;
      statProcessingEl.textContent = processing;
      statCompletedEl.textContent = completed;
      statTotalEl.textContent = total;
    },

    render(consultations) {
      const container = document.getElementById("consultationsContainer");
      if (!container) return;

      if (!consultations || consultations.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Chưa có yêu cầu tư vấn nào</p>
          </div>
        `;
        return;
      }

      container.innerHTML = consultations
        .map((consultation) => {
          const date = new Date(consultation.thoiDiemTao);
          const formattedDate = date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const timeAgo = getTimeAgo(consultation.thoiDiemTao);

          const name = consultation.hoTen || "N/A";
          const initials = getInitials(name);

          const status = (consultation.trangThai || "").trim();
          
          let statusBadgeClass = "completed";
          let normalizedStatus = "";
          
          if (status === "Chưa xử lý") {
            statusBadgeClass = "pending";
            normalizedStatus = "chua xu ly";
          } else if (status === "Đang xử lý") {
            statusBadgeClass = "processing";
            normalizedStatus = "dang xu ly";
          } else if (status === "Đã xử lý") {
            statusBadgeClass = "completed";
            normalizedStatus = "da xu ly";
          } else {
            normalizedStatus = status.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, " ");
            
            if (normalizedStatus.includes("chua") && normalizedStatus.includes("xu ly")) {
              statusBadgeClass = "pending";
            } else if (normalizedStatus.includes("dang") && normalizedStatus.includes("xu ly")) {
              statusBadgeClass = "processing";
            } else {
              statusBadgeClass = "completed";
            }
          }

          return `
            <div class="consultation-card-modern ${
              (normalizedStatus === "chua xu ly" || 
               (normalizedStatus.includes("chua") && normalizedStatus.includes("xu ly"))) ? "unread" : ""
            }">
              <div class="consultation-time-modern">
                <i class="fas fa-clock"></i>
                ${timeAgo}
              </div>
              <div class="consultation-card-header">
                <div class="consultation-avatar-modern">
                  <span class="avatar-initials">${initials}</span>
                </div>
                <div class="consultation-main-info">
                  <div class="consultation-name-row">
                    <h3 class="consultation-name">${name}</h3>
                    <span class="consultation-status-badge ${statusBadgeClass}">
                      ${consultation.trangThai}
                    </span>
                  </div>
                  <div class="consultation-meta-row">
                    ${consultation.email ? `
                      <div class="consultation-meta-item">
                        <i class="fas fa-envelope"></i>
                        <span>${consultation.email}</span>
                      </div>
                    ` : ''}
                    ${consultation.sdt ? `
                      <div class="consultation-meta-item">
                        <i class="fas fa-phone"></i>
                        <span>${consultation.sdt}</span>
                      </div>
                    ` : ''}
                  </div>
                  <div class="consultation-title">
                    <i class="fas fa-comment-dots"></i>
                    ${consultation.tieuDe || "Yêu cầu tư vấn"}
                  </div>
                  ${consultation.hinhThucTuVan ? `
                    <div class="consultation-type-badge">
                      <i class="fas fa-tag"></i>
                      ${consultation.hinhThucTuVan}
                    </div>
                  ` : ''}
                  ${consultation.noiDung ? `
                    <div class="consultation-content-preview">
                      ${consultation.noiDung}
                    </div>
                  ` : ''}
                  <div class="consultation-actions-modern">
                    <div class="status-update-dropdown">
                      <label class="status-label" for="statusSelect_${consultation.idTv}">Cập nhật trạng thái:</label>
                      <select class="status-select" id="statusSelect_${consultation.idTv}" 
                              onchange="window.consultationsModule.updateStatus('${consultation.idTv}', this.value)"
                              data-current-status="${consultation.trangThai}">
                        <option value="Chưa xử lý" ${status === "Chưa xử lý" ? "selected" : ""}>Chưa xử lý</option>
                        <option value="Đang xử lý" ${status === "Đang xử lý" ? "selected" : ""}>Đang xử lý</option>
                        <option value="Đã xử lý" ${status === "Đã xử lý" ? "selected" : ""}>Đã xử lý</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    },

    setupFilters(allConsultations) {
      const searchInput = document.getElementById("consultationSearch");
      const statusFilter = document.getElementById("consultationStatusFilter");
      const sortSelect = document.getElementById("consultationSort");
      const clearSearchBtn = document.getElementById("clearConsultationSearch");
      const container = document.getElementById("consultationsContainer");

      this.allConsultations = allConsultations;

      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const value = e.target.value;
          if (clearSearchBtn) {
            clearSearchBtn.style.display = value ? "flex" : "none";
          }
          this.filter(allConsultations, value, statusFilter?.value, sortSelect?.value);
        });
      }

      if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
          if (searchInput) {
            searchInput.value = "";
            clearSearchBtn.style.display = "none";
          }
          this.filter(allConsultations, "", statusFilter?.value, sortSelect?.value);
        });
      }

      if (statusFilter) {
        statusFilter.addEventListener("change", (e) => {
          this.filter(allConsultations, searchInput?.value || "", e.target.value, sortSelect?.value);
        });
      }

      if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
          this.filter(allConsultations, searchInput?.value || "", statusFilter?.value, e.target.value);
        });
      }
    },

    filter(allConsultations, searchTerm, statusFilter, sortBy = "newest") {
      const container = document.getElementById("consultationsContainer");
      if (!container) return;

      let filtered = [...allConsultations];

      // Filter by status
      if (statusFilter) {
        filtered = filtered.filter((c) => {
          const status = (c.trangThai || "").trim();
          if (status === statusFilter) {
            return true;
          }
          const normalizeStatus = (s) => {
            if (!s) return "";
            return s.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, " ");
          };
          const normalizedFilter = normalizeStatus(statusFilter);
          const normalizedStatus = normalizeStatus(status);
          return normalizedStatus === normalizedFilter;
        });
      }

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.hoTen?.toLowerCase().includes(term) ||
            c.email?.toLowerCase().includes(term) ||
            c.sdt?.includes(term) ||
            c.tieuDe?.toLowerCase().includes(term) ||
            c.noiDung?.toLowerCase().includes(term)
        );
      }

      // Re-render filtered results
      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <p>Không tìm thấy yêu cầu tư vấn nào</p>
          </div>
        `;
        return;
      }

      // Sort
      filtered.sort((a, b) => {
        if (sortBy === "oldest") {
          const dateA = new Date(a.thoiDiemTao);
          const dateB = new Date(b.thoiDiemTao);
          return dateA - dateB;
        } else if (sortBy === "name") {
          return (a.hoTen || "").localeCompare(b.hoTen || "");
        } else if (sortBy === "status") {
          const statusOrder = { "Chưa xử lý": 1, "Đang xử lý": 2, "Đã xử lý": 3 };
          return (statusOrder[a.trangThai] || 0) - (statusOrder[b.trangThai] || 0);
        } else {
          const dateA = new Date(a.thoiDiemTao);
          const dateB = new Date(b.thoiDiemTao);
          return dateB - dateA;
        }
      });

      // Update stats with ALL consultations (not filtered)
      if (this.allConsultations) {
        this.updateStats(this.allConsultations);
      } else {
        this.updateStats(filtered);
      }

      // Render filtered results
      this.render(filtered);
    },

    async updateStatus(idTv, trangThai) {
      const selectElement = document.getElementById(`statusSelect_${idTv}`);
      if (selectElement) {
        const currentStatus = selectElement.getAttribute("data-current-status");
        if (currentStatus === trangThai) {
          return;
        }
      }
      
      try {
        const statusToSend = trangThai.trim();
        await window.tutorAPI.updateConsultationStatus(idTv, statusToSend);
        showNotification(`Đã cập nhật trạng thái thành "${statusToSend}"`, "success");
        await this.loadData();
      } catch (error) {
        console.error("Error updating consultation status:", error);
        showNotification("Có lỗi xảy ra khi cập nhật trạng thái", "error");
        await this.loadData();
      }
    }
  };

  // Expose to window
  window.consultationsModule = ConsultationsModule;

  // Auto-initialize when section is loaded
  if (document.getElementById("consultationsContainer")) {
    ConsultationsModule.loadData();
  }
})();

