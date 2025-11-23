// Recruitment Section Module
(function() {
  'use strict';

  function showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // Recruitment Module
  const RecruitmentModule = {
    allJobs: [],
    currentJob: null,
    searchTerm: '',
    statusFilter: '',
    currentSortField: null,
    currentSortDirection: "asc",

    async loadData() {
      await this.loadJobs();
      this.setupEventListeners();
    },

    async loadJobs() {
      const tableBody = document.getElementById("jobsTableBody");
      if (!tableBody) return;

      tableBody.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải danh sách tin tuyển dụng...</p>
        </div>
      `;

      try {
        const jobs = await window.tutorAPI.getAllJobs();
        this.allJobs = jobs || [];
        this.renderJobs();
      } catch (error) {
        console.error("Error loading jobs:", error);
        tableBody.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Không thể tải danh sách</h3>
            <p>Đã xảy ra lỗi khi tải danh sách tin tuyển dụng. Vui lòng thử lại.</p>
          </div>
        `;
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    renderJobs() {
      const tableBody = document.getElementById("jobsTableBody");
      if (!tableBody) return;

      let filteredJobs = this.allJobs;

      // Apply search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          (job.tieuDe && job.tieuDe.toLowerCase().includes(term)) ||
          (job.viTri && job.viTri.toLowerCase().includes(term)) ||
          (job.moTaNgan && job.moTaNgan.toLowerCase().includes(term))
        );
      }

      // Apply status filter
      if (this.statusFilter) {
        filteredJobs = filteredJobs.filter(job => job.trangThai === this.statusFilter);
      }

      // Apply sorting if exists
      if (this.currentSortField) {
        filteredJobs = this.sortJobsArray(filteredJobs, this.currentSortField, this.currentSortDirection);
      }

      if (filteredJobs.length === 0) {
        tableBody.innerHTML = `
          <div class="table-empty-state">
            <i class="fas fa-briefcase"></i>
            <h3>${this.allJobs.length === 0 ? 'Chưa có tin tuyển dụng' : 'Không tìm thấy'}</h3>
            <p>${this.allJobs.length === 0 ? 'Hãy tạo tin tuyển dụng đầu tiên để bắt đầu!' : 'Không tìm thấy tin tuyển dụng phù hợp với bộ lọc của bạn.'}</p>
            ${this.allJobs.length === 0 ? '<button class="btn btn-primary" onclick="window.recruitmentModule.openJobModal()" style="margin-top: 1.5rem;"><i class="fas fa-plus"></i> Tạo tin đầu tiên</button>' : ''}
          </div>
        `;
        return;
      }

      tableBody.innerHTML = filteredJobs.map(job => this.renderJobRow(job)).join('');
    },

    renderJobRow(job) {
      const statusClass = this.getStatusClass(job.trangThai);
      const deadline = job.hanNop ? new Date(job.hanNop).toLocaleDateString('vi-VN') : 'Không giới hạn';
      const salary = this.formatSalary(job.mucLuongTu, job.mucLuongDen);
      const shortDesc = job.moTaNgan ? (job.moTaNgan.length > 50 ? job.moTaNgan.substring(0, 50) + '...' : job.moTaNgan) : '-';
      
      return `
        <div class="table-row job-row" data-job-id="${job.idTd}">
          <div class="col-title">
            <div class="job-title-main">${job.tieuDe || '-'}</div>
            <div class="job-id">ID: ${job.idTd || '-'}</div>
          </div>
          <div class="col-position">
            <i class="fas fa-map-marker-alt"></i>
            <span>${job.viTri || '-'}</span>
          </div>
          <div class="col-desc">
            <span title="${job.moTaNgan || ''}">${shortDesc}</span>
          </div>
          <div class="col-salary">
            ${salary ? `<i class="fas fa-money-bill-wave"></i> ${salary}` : '-'}
          </div>
          <div class="col-experience">
            ${job.kinhNghiem !== null && job.kinhNghiem !== undefined ? `<i class="fas fa-briefcase"></i> ${job.kinhNghiem} năm` : '-'}
          </div>
          <div class="col-quantity">
            ${job.soLuongTuyen ? `<i class="fas fa-users"></i> ${job.soLuongTuyen} người` : '-'}
          </div>
          <div class="col-deadline">
            <i class="fas fa-calendar-alt"></i>
            <span>${deadline}</span>
          </div>
          <div class="col-status">
            <span class="job-status-badge ${statusClass}">${job.trangThai || 'Chưa xác định'}</span>
          </div>
          <div class="col-actions">
            <button class="btn btn-sm btn-primary view-job-btn" data-job-id="${job.idTd}" title="Xem chi tiết">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-secondary edit-job-btn" data-job-id="${job.idTd}" title="Chỉnh sửa">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-job-btn" data-job-id="${job.idTd}" title="Xóa">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    },

    getStatusClass(status) {
      if (!status) return '';
      if (status.includes('tuyển') || status.includes('Tuyển')) return 'active';
      if (status.includes('dừng') || status.includes('Dừng')) return 'paused';
      if (status.includes('đóng') || status.includes('Đóng')) return 'closed';
      return '';
    },

    formatSalary(from, to) {
      if (!from && !to) return null;
      if (from && to) return `${from} - ${to}`;
      if (from) return `Từ ${from}`;
      if (to) return `Đến ${to}`;
      return null;
    },

    setupEventListeners() {
      // Create job button
      const createBtn = document.getElementById("createJobBtn");
      if (createBtn) {
        createBtn.addEventListener("click", () => this.openJobModal());
      }

      // Search input
      const searchInput = document.getElementById("jobSearchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.searchTerm = e.target.value;
          this.renderJobs();
        });
      }

      // Status filter
      const statusFilter = document.getElementById("statusFilter");
      if (statusFilter) {
        statusFilter.addEventListener("change", (e) => {
          this.statusFilter = e.target.value;
          this.renderJobs();
        });
      }

      // Refresh button
      const refreshBtn = document.getElementById("refreshJobsBtn");
      if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
          this.loadJobs();
          showNotification("Danh sách đã được làm mới!", "success");
        });
      }

      // Job row click handlers (delegated)
      const tableBody = document.getElementById("jobsTableBody");
      if (tableBody) {
        tableBody.addEventListener("click", (e) => {
          const jobRow = e.target.closest(".job-row");
          if (jobRow && !e.target.closest(".col-actions") && !e.target.closest("button")) {
            const jobId = jobRow.dataset.jobId;
            this.viewJobDetails(jobId);
          }

          if (e.target.closest(".view-job-btn")) {
            const jobId = e.target.closest(".view-job-btn").dataset.jobId;
            e.stopPropagation();
            this.viewJobDetails(jobId);
          }

          if (e.target.closest(".edit-job-btn")) {
            const jobId = e.target.closest(".edit-job-btn").dataset.jobId;
            e.stopPropagation();
            this.editJob(jobId);
          }

          if (e.target.closest(".delete-job-btn")) {
            const jobId = e.target.closest(".delete-job-btn").dataset.jobId;
            e.stopPropagation();
            this.deleteJob(jobId);
          }
        });
      }

      // Setup sortable headers
      document.querySelectorAll(".jobs-table-container .sortable").forEach((header) => {
        header.addEventListener("click", () => {
          const field = header.dataset.sort;
          this.sortJobs(field);
        });
      });

      // Modal handlers
      this.setupModalHandlers();
    },

    setupModalHandlers() {
      // Create/Edit Job Modal
      const jobModal = document.getElementById("jobModal");
      const closeJobModal = document.getElementById("closeJobModal");
      const cancelJobBtn = document.getElementById("cancelJobBtn");
      const saveJobBtn = document.getElementById("saveJobBtn");
      const jobForm = document.getElementById("jobForm");

      if (closeJobModal) {
        closeJobModal.addEventListener("click", () => this.closeJobModal());
      }

      if (cancelJobBtn) {
        cancelJobBtn.addEventListener("click", () => this.closeJobModal());
      }

      if (saveJobBtn) {
        saveJobBtn.addEventListener("click", () => this.saveJob());
      }

      if (jobForm) {
        jobForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.saveJob();
        });
      }

      // Job Details Modal
      const jobDetailsModal = document.getElementById("jobDetailsModal");
      const closeJobDetailsModal = document.getElementById("closeJobDetailsModal");
      const closeJobDetailsBtn = document.getElementById("closeJobDetailsBtn");
      const editJobFromDetailsBtn = document.getElementById("editJobFromDetailsBtn");

      if (closeJobDetailsModal) {
        closeJobDetailsModal.addEventListener("click", () => this.closeJobDetailsModal());
      }

      if (closeJobDetailsBtn) {
        closeJobDetailsBtn.addEventListener("click", () => this.closeJobDetailsModal());
      }

      if (editJobFromDetailsBtn) {
        editJobFromDetailsBtn.addEventListener("click", () => {
          if (this.currentJob) {
            this.closeJobDetailsModal();
            this.editJob(this.currentJob.idTd);
          }
        });
      }

      // Close modals on overlay click
      if (jobModal) {
        jobModal.addEventListener("click", (e) => {
          if (e.target === jobModal) {
            this.closeJobModal();
          }
        });
      }

      if (jobDetailsModal) {
        jobDetailsModal.addEventListener("click", (e) => {
          if (e.target === jobDetailsModal) {
            this.closeJobDetailsModal();
          }
        });
      }
    },

    openJobModal(job = null) {
      const modal = document.getElementById("jobModal");
      const form = document.getElementById("jobForm");
      const modalTitle = document.getElementById("jobModalTitle");

      if (!modal || !form) return;

      if (job) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa tin tuyển dụng';
        this.populateJobForm(job);
      } else {
        modalTitle.innerHTML = '<i class="fas fa-briefcase"></i> Tạo tin tuyển dụng mới';
        form.reset();
        document.getElementById("jobId").value = '';
      }

      modal.style.display = "flex";
    },

    populateJobForm(job) {
      document.getElementById("jobId").value = job.idTd || '';
      document.getElementById("jobTitle").value = job.tieuDe || '';
      document.getElementById("jobPosition").value = job.viTri || '';
      document.getElementById("jobShortDesc").value = job.moTaNgan || '';
      document.getElementById("jobDescription").value = job.moTa || '';
      document.getElementById("jobRequirements").value = job.yeuCau || '';
      document.getElementById("jobLevel").value = job.capBac || '';
      document.getElementById("jobWorkType").value = job.hinhThucLamViec || '';
      document.getElementById("jobSalaryFrom").value = job.mucLuongTu || '';
      document.getElementById("jobSalaryTo").value = job.mucLuongDen || '';
      document.getElementById("jobExperience").value = job.kinhNghiem || '';
      document.getElementById("jobQuantity").value = job.soLuongTuyen || '';
      document.getElementById("jobStatus").value = job.trangThai || 'Đang tuyển';
      
      // Format deadline for datetime-local input
      if (job.hanNop) {
        const deadline = new Date(job.hanNop);
        const localDateTime = new Date(deadline.getTime() - deadline.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        document.getElementById("jobDeadline").value = localDateTime;
      } else {
        document.getElementById("jobDeadline").value = '';
      }
    },

    closeJobModal() {
      const modal = document.getElementById("jobModal");
      if (modal) {
        modal.style.display = "none";
        const form = document.getElementById("jobForm");
        if (form) form.reset();
      }
    },

    async saveJob() {
      const form = document.getElementById("jobForm");
      if (!form) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const jobData = {
        idTd: formData.get("idTd") || null,
        tieuDe: formData.get("tieuDe"),
        viTri: formData.get("viTri"),
        moTaNgan: formData.get("moTaNgan") || null,
        moTa: formData.get("moTa"),
        yeuCau: formData.get("yeuCau"),
        capBac: formData.get("capBac") || null,
        hinhThucLamViec: formData.get("hinhThucLamViec") || null,
        mucLuongTu: formData.get("mucLuongTu") || null,
        mucLuongDen: formData.get("mucLuongDen") || null,
        kinhNghiem: formData.get("kinhNghiem") ? parseInt(formData.get("kinhNghiem")) : null,
        soLuongTuyen: formData.get("soLuongTuyen") ? parseInt(formData.get("soLuongTuyen")) : null,
        hanNop: formData.get("hanNop") ? new Date(formData.get("hanNop")).toISOString() : null,
        trangThai: formData.get("trangThai")
      };

      try {
        if (jobData.idTd) {
          await window.tutorAPI.updateJob(jobData.idTd, jobData);
          showNotification("Cập nhật tin tuyển dụng thành công!", "success");
        } else {
          await window.tutorAPI.createJob(jobData);
          showNotification("Tạo tin tuyển dụng thành công!", "success");
        }
        
        this.closeJobModal();
        await this.loadJobs();
      } catch (error) {
        console.error("Error saving job:", error);
        let errorMessage = "Có lỗi xảy ra khi lưu tin tuyển dụng. Vui lòng thử lại.";
        
        if (error.errorData) {
          if (error.errorData.message) {
            errorMessage = error.errorData.message;
          } else if (error.errorData.error) {
            errorMessage = error.errorData.error;
          }
        } else if (error.message && !error.message.includes("HTTP error")) {
          errorMessage = error.message;
        }

        showNotification(errorMessage, "error");
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    async viewJobDetails(jobId) {
      const modal = document.getElementById("jobDetailsModal");
      const body = document.getElementById("jobDetailsBody");
      
      if (!modal || !body) return;

      body.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      `;

      modal.style.display = "flex";

      try {
        const job = await window.tutorAPI.getJobById(jobId);
        this.currentJob = job;
        this.renderJobDetails(job);
      } catch (error) {
        console.error("Error loading job details:", error);
        body.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Không thể tải thông tin</h3>
            <p>Đã xảy ra lỗi khi tải thông tin tin tuyển dụng.</p>
          </div>
        `;
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    renderJobDetails(job) {
      const body = document.getElementById("jobDetailsBody");
      const title = document.getElementById("jobDetailsTitle");
      
      if (!body) return;

      if (title) {
        title.textContent = job.tieuDe || 'Chi tiết tin tuyển dụng';
      }

      const deadline = job.hanNop ? new Date(job.hanNop).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Không giới hạn';

      const requirements = job.yeuCauList && job.yeuCauList.length > 0 
        ? job.yeuCauList 
        : (job.yeuCau ? job.yeuCau.split('\n').filter(r => r.trim()) : []);

      body.innerHTML = `
        <div class="job-details-content">
          <div class="job-details-header">
            <h2 class="job-details-title">${job.tieuDe || '-'}</h2>
            <p class="job-details-position">${job.viTri || '-'}</p>
          </div>

          <div class="job-details-meta">
            ${job.capBac ? `
              <div class="job-details-meta-item">
                <span class="job-details-meta-label">Cấp bậc</span>
                <span class="job-details-meta-value">${job.capBac}</span>
              </div>
            ` : ''}
            ${job.hinhThucLamViec ? `
              <div class="job-details-meta-item">
                <span class="job-details-meta-label">Hình thức</span>
                <span class="job-details-meta-value">${job.hinhThucLamViec}</span>
              </div>
            ` : ''}
            ${job.mucLuongTu || job.mucLuongDen ? `
              <div class="job-details-meta-item">
                <span class="job-details-meta-label">Mức lương</span>
                <span class="job-details-meta-value">${this.formatSalary(job.mucLuongTu, job.mucLuongDen) || '-'}</span>
              </div>
            ` : ''}
            ${job.kinhNghiem !== null && job.kinhNghiem !== undefined ? `
              <div class="job-details-meta-item">
                <span class="job-details-meta-label">Kinh nghiệm</span>
                <span class="job-details-meta-value">${job.kinhNghiem} năm</span>
              </div>
            ` : ''}
            ${job.soLuongTuyen ? `
              <div class="job-details-meta-item">
                <span class="job-details-meta-label">Số lượng tuyển</span>
                <span class="job-details-meta-value">${job.soLuongTuyen} người</span>
              </div>
            ` : ''}
            <div class="job-details-meta-item">
              <span class="job-details-meta-label">Hạn nộp</span>
              <span class="job-details-meta-value">${deadline}</span>
            </div>
            <div class="job-details-meta-item">
              <span class="job-details-meta-label">Trạng thái</span>
              <span class="job-details-meta-value">
                <span class="job-status-badge ${this.getStatusClass(job.trangThai)}">${job.trangThai || 'Chưa xác định'}</span>
              </span>
            </div>
          </div>

          ${job.moTaNgan ? `
            <div class="job-details-section">
              <h4>Mô tả ngắn</h4>
              <p>${job.moTaNgan}</p>
            </div>
          ` : ''}

          ${job.moTa ? `
            <div class="job-details-section">
              <h4>Mô tả công việc</h4>
              <p>${job.moTa}</p>
            </div>
          ` : ''}

          ${requirements.length > 0 ? `
            <div class="job-details-section">
              <h4>Yêu cầu</h4>
              <ul class="job-details-requirements">
                ${requirements.map(req => `<li>${req}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    },

    closeJobDetailsModal() {
      const modal = document.getElementById("jobDetailsModal");
      if (modal) {
        modal.style.display = "none";
        this.currentJob = null;
      }
    },

    async editJob(jobId) {
      try {
        const job = await window.tutorAPI.getJobById(jobId);
        this.openJobModal(job);
      } catch (error) {
        console.error("Error loading job for edit:", error);
        showNotification("Không thể tải thông tin tin tuyển dụng để chỉnh sửa.", "error");
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    async deleteJob(jobId) {
      const job = this.allJobs.find(j => j.idTd === jobId);
      const jobTitle = job ? job.tieuDe : 'tin tuyển dụng này';

      if (!confirm(`Bạn có chắc chắn muốn xóa "${jobTitle}"? Hành động này không thể hoàn tác.`)) {
        return;
      }

      try {
        await window.tutorAPI.deleteJob(jobId);
        showNotification("Xóa tin tuyển dụng thành công!", "success");
        await this.loadJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
        let errorMessage = "Có lỗi xảy ra khi xóa tin tuyển dụng. Vui lòng thử lại.";
        
        if (error.errorData) {
          if (error.errorData.message) {
            errorMessage = error.errorData.message;
          } else if (error.errorData.error) {
            errorMessage = error.errorData.error;
          }
        } else if (error.message && !error.message.includes("HTTP error")) {
          errorMessage = error.message;
        }

        showNotification(errorMessage, "error");
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    sortJobs(field) {
      if (!field) return;
      
      // Toggle sort direction if same field
      if (this.currentSortField === field) {
        this.currentSortDirection = this.currentSortDirection === "asc" ? "desc" : "asc";
      } else {
        this.currentSortField = field;
        this.currentSortDirection = "asc";
      }

      let filteredJobs = this.allJobs;

      // Apply search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          (job.tieuDe && job.tieuDe.toLowerCase().includes(term)) ||
          (job.viTri && job.viTri.toLowerCase().includes(term)) ||
          (job.moTaNgan && job.moTaNgan.toLowerCase().includes(term))
        );
      }

      // Apply status filter
      if (this.statusFilter) {
        filteredJobs = filteredJobs.filter(job => job.trangThai === this.statusFilter);
      }

      // Sort
      filteredJobs = this.sortJobsArray(filteredJobs, field, this.currentSortDirection);

      const tableBody = document.getElementById("jobsTableBody");
      if (tableBody) {
        tableBody.innerHTML = filteredJobs.map(job => this.renderJobRow(job)).join('');
      }
    },

    sortJobsArray(jobs, field, direction) {
      return [...jobs].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === "mucLuongTu" || field === "kinhNghiem" || field === "soLuongTuyen") {
          aVal = aVal || 0;
          bVal = bVal || 0;
        } else if (field === "hanNop") {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        } else {
          aVal = (aVal || "").toString().toLowerCase();
          bVal = (bVal || "").toString().toLowerCase();
        }

        if (direction === "asc") {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }
  };

  // Expose to window
  window.recruitmentModule = RecruitmentModule;

  // Auto-initialize when section is loaded
  if (document.getElementById("recruitment")) {
    setTimeout(() => {
      RecruitmentModule.loadData();
    }, 100);
  }
})();

