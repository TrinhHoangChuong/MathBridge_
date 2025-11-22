// portal/admin/js/pages/tuyendung.pages.js
import {
  apiGetAllJobs,
  apiGetJobDetail,
  apiCreateJob,
  apiUpdateJob,
  apiDeleteJob,
  apiGetAllCandidates,
  apiGetCandidateDetail,
  apiUpdateCandidate,
  apiDeleteCandidate,
  apiGetCandidatesOfJob,
  apiAddCandidatesToJob,
  apiRemoveCandidateFromJob,
} from "../api/tuyendung.api.js";

let jobListCache = [];
let candidateListCache = [];

let jobFormMode = "create"; // "create" | "edit"

/* ======================================================
   ENTRY
   ====================================================== */

export async function initTuyenDungPage() {
  const root = document.getElementById("tuyendung-panel");
  if (!root) {
    console.warn("Không tìm thấy #tuyendung-panel");
    return;
  }

  setupTabs(root);
  setupJobFilterEvents(root);
  setupCandidateFilterEvents(root);
  setupAddButtons(root);
  setupJobModal(root);
  setupJobDetailModal(root);
  setupCandidateModal(root);

  await loadJobs(root);
  await loadCandidates(root);
}

/* ======================================================
   TABS
   ====================================================== */

function setupTabs(root) {
  const tabs = root.querySelectorAll(".td-main-tab");
  const views = root.querySelectorAll(".td-main-view");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      views.forEach((view) => {
        view.classList.toggle(
          "is-active",
          view.getAttribute("data-view") === target
        );
      });
    });
  });
}

/* ======================================================
   JOBS (TIN TUYỂN DỤNG)
   ====================================================== */

async function loadJobs(root) {
  try {
    const jobs = await apiGetAllJobs();
    jobListCache = Array.isArray(jobs) ? jobs : [];
    populateJobFilterOptions(root);
    renderJobTable(root, jobListCache);
  } catch (err) {
    console.error(err);
    const tbody = root.querySelector("#td-job-tbody");
    const pill = root.querySelector("#td-job-count-pill");
    if (pill) pill.textContent = "Lỗi tải dữ liệu";
    if (tbody) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="11">Không thể tải dữ liệu tin tuyển dụng.</td>
        </tr>`;
    }
  }
}

function renderJobTable(root, list) {
  const tbody = root.querySelector("#td-job-tbody");
  const pill = root.querySelector("#td-job-count-pill");
  if (!tbody) return;

  if (pill) pill.textContent = `Hiện ${list.length} tin`;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="11">
          Chưa có dữ liệu tin tuyển dụng. Nhấn <strong>“Thêm tin tuyển dụng”</strong> để tạo mới.
        </td>
      </tr>`;
    return;
  }

  // set trạng thái dùng cho dropdown
  const statusOptions = Array.from(
    new Set(jobListCache.map((j) => j.trangThai).filter(Boolean))
  );

  tbody.innerHTML = "";
  list.forEach((job) => {
    const tr = document.createElement("tr");

    const hanNopStr = job.hanNop ? formatDate(job.hanNop) : "—";
    const mucLuongStr =
      job.mucLuongTu || job.mucLuongDen
        ? `${job.mucLuongTu || ""}${
            job.mucLuongTu && job.mucLuongDen ? " - " : ""
          }${job.mucLuongDen || ""}`
        : "—";
    const soUngVien = job.soUngVien != null ? job.soUngVien : 0;

    const statusSelectHtml = (() => {
      const opts = [];
      opts.push(
        `<option value="">(Không đặt)</option>`
      );
      statusOptions.forEach((st) => {
        const selected = st === job.trangThai ? "selected" : "";
        opts.push(
          `<option value="${st}" ${selected}>${st}</option>`
        );
      });
    // nếu job.trangThai hiện tại không nằm trong list (hiếm), vẫn add
      if (job.trangThai && !statusOptions.includes(job.trangThai)) {
        opts.push(
          `<option value="${job.trangThai}" selected>${job.trangThai}</option>`
        );
      }
      return `<select class="td-job-status-select" data-job-id="${job.idTd || ""}">
                ${opts.join("")}
              </select>`;
    })();

    tr.innerHTML = `
      <td>${job.idTd || ""}</td>
      <td>${job.tieuDe || ""}</td>
      <td>${job.viTri || ""}</td>
      <td>${job.capBac || ""}</td>
      <td>${mucLuongStr}</td>
      <td>${job.kinhNghiem != null ? job.kinhNghiem : ""}</td>
      <td>${job.soLuongTuyen != null ? job.soLuongTuyen : ""}</td>
      <td>${hanNopStr}</td>
      <td>${statusSelectHtml}</td>
      <td>${soUngVien}</td>
      <td class="td-actions-cell">
        <button type="button"
                class="td-link-btn td-job-detail-btn"
                data-job-id="${job.idTd}">Chi tiết</button>
        <button type="button"
                class="td-link-btn td-job-edit-btn"
                data-job-id="${job.idTd}">Sửa</button>
        <button type="button"
                class="td-link-btn td-job-delete-btn"
                data-job-id="${job.idTd}">Xóa</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // đổi trạng thái inline
  tbody.querySelectorAll(".td-job-status-select").forEach((select) => {
    select.addEventListener("change", async () => {
      const idTd = select.getAttribute("data-job-id");
      if (!idTd) return;
      const newStatus = select.value || "";

      const job = jobListCache.find((j) => j.idTd === idTd);
      if (!job) return;

      const payload = buildJobPayloadFromCache(job, { trangThai: newStatus });

      try {
        await apiUpdateJob(idTd, payload);
        job.trangThai = newStatus; // cập nhật cache
        const detailStatus = root.querySelector("#td-detail-trangThai");
        if (detailStatus && detailStatus.textContent.trim() === job.trangThai) {
          detailStatus.textContent = newStatus || "—";
        }
      } catch (e) {
        console.error(e);
        alert("Không thể cập nhật trạng thái tin tuyển dụng");
      }
    });
  });

  // Chi tiết
  tbody.querySelectorAll(".td-job-detail-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idTd = btn.getAttribute("data-job-id");
      if (!idTd) return;
      try {
        await showJobDetailModal(root, idTd);
      } catch (e) {
        console.error(e);
        alert("Không thể tải chi tiết tin tuyển dụng");
      }
    });
  });

  // Sửa
  tbody.querySelectorAll(".td-job-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idTd = btn.getAttribute("data-job-id");
      if (!idTd) return;

      const job = jobListCache.find((j) => j.idTd === idTd);
      if (!job) {
        alert("Không tìm thấy dữ liệu tin tuyển dụng để sửa");
        return;
      }

      openJobModal(root, "edit", job);
    });
  });

  // Xóa
  tbody.querySelectorAll(".td-job-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idTd = btn.getAttribute("data-job-id");
      if (!idTd) return;
      if (!confirm(`Xóa tin tuyển dụng ${idTd}?`)) return;
      try {
        await apiDeleteJob(idTd);
        await loadJobs(root);
      } catch (e) {
        console.error(e);
        alert("Không thể xóa tin tuyển dụng");
      }
    });
  });
}

/* ---------- JOB FILTER ---------- */

function setupJobFilterEvents(root) {
  const filterBtn = root.querySelector("#td-job-filter-btn");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => applyJobFilters(root));
  }
}

function applyJobFilters(root) {
  let filtered = [...jobListCache];

  const keyword = root
    .querySelector("#td-job-keyword")
    ?.value.trim()
    .toLowerCase();
  const position = root.querySelector("#td-job-position")?.value || "";
  const level = root.querySelector("#td-job-level")?.value || "";
  const type = root.querySelector("#td-job-type")?.value || "";
  const status = root.querySelector("#td-job-status")?.value || "";
  const deadlineVal = root.querySelector("#td-job-deadline")?.value || "";

  if (keyword) {
    filtered = filtered.filter((j) => {
      const tieuDe = (j.tieuDe || "").toLowerCase();
      const viTri = (j.viTri || "").toLowerCase();
      const moTaNgan = (j.moTaNgan || "").toLowerCase();
      return (
        tieuDe.includes(keyword) ||
        viTri.includes(keyword) ||
        moTaNgan.includes(keyword)
      );
    });
  }

  if (position) filtered = filtered.filter((j) => (j.viTri || "") === position);
  if (level) filtered = filtered.filter((j) => (j.capBac || "") === level);
  if (type)
    filtered = filtered.filter(
      (j) => (j.hinhThucLamViec || "") === type
    );
  if (status)
    filtered = filtered.filter((j) => (j.trangThai || "") === status);

  if (deadlineVal) {
    const deadlineDate = new Date(deadlineVal);
    if (!Number.isNaN(deadlineDate.getTime())) {
      filtered = filtered.filter((j) => {
        if (!j.hanNop) return false;
        const hanNopDate = new Date(j.hanNop);
        if (Number.isNaN(hanNopDate.getTime())) return false;
        return hanNopDate <= deadlineDate;
      });
    }
  }

  renderJobTable(root, filtered);
}

function populateJobFilterOptions(root) {
  const positionSelect = root.querySelector("#td-job-position");
  const levelSelect = root.querySelector("#td-job-level");
  const typeSelect = root.querySelector("#td-job-type");
  const statusSelect = root.querySelector("#td-job-status");

  const positions = new Set();
  const levels = new Set();
  const types = new Set();
  const statuses = new Set();

  jobListCache.forEach((j) => {
    if (j.viTri) positions.add(j.viTri);
    if (j.capBac) levels.add(j.capBac);
    if (j.hinhThucLamViec) types.add(j.hinhThucLamViec);
    if (j.trangThai) statuses.add(j.trangThai);
  });

  if (positionSelect) {
    const current = positionSelect.value;
    positionSelect.innerHTML = `<option value="">Tất cả vị trí</option>`;
    positions.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      positionSelect.appendChild(opt);
    });
    if (current && positions.has(current)) positionSelect.value = current;
  }

  if (levelSelect) {
    const current = levelSelect.value;
    levelSelect.innerHTML = `<option value="">Tất cả cấp bậc</option>`;
    levels.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      levelSelect.appendChild(opt);
    });
    if (current && levels.has(current)) levelSelect.value = current;
  }

  if (typeSelect) {
    const current = typeSelect.value;
    typeSelect.innerHTML = `<option value="">Tất cả hình thức</option>`;
    types.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      typeSelect.appendChild(opt);
    });
    if (current && types.has(current)) typeSelect.value = current;
  }

  if (statusSelect) {
    const current = statusSelect.value;
    statusSelect.innerHTML = `<option value="">Tất cả trạng thái</option>`;
    statuses.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      statusSelect.appendChild(opt);
    });
    if (current && statuses.has(current)) statusSelect.value = current;
  }
}

/* ======================================================
   CANDIDATES (ỨNG VIÊN APPLY)
   ====================================================== */

async function loadCandidates(root) {
  try {
    const candidates = await apiGetAllCandidates();
    candidateListCache = Array.isArray(candidates) ? candidates : [];
    populateCandidateFilterOptions(root);
    renderCandidateTable(root, candidateListCache);
  } catch (err) {
    console.error(err);
    const tbody = root.querySelector("#td-candidate-tbody");
    const pill = root.querySelector("#td-candidate-count-pill");
    if (pill) pill.textContent = "Lỗi tải dữ liệu";
    if (tbody) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="10">Không thể tải dữ liệu ứng viên.</td>
        </tr>`;
    }
  }
}

function renderCandidateTable(root, list) {
  const tbody = root.querySelector("#td-candidate-tbody");
  const pill = root.querySelector("#td-candidate-count-pill");
  if (!tbody) return;

  if (pill) pill.textContent = `Hiện ${list.length} ứng viên`;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="10">
          Chưa có dữ liệu ứng viên (chờ ứng viên apply).
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = "";
  list.forEach((c) => {
    const soTin = c.soTinDaUngTuyen != null ? c.soTinDaUngTuyen : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.idUv || ""}</td>
      <td>${c.hoTen || ""}</td>
      <td>${c.email || ""}</td>
      <td>${c.sdt || ""}</td>
      <td>${
        c.cvUrl
          ? `<a href="${c.cvUrl}" target="_blank" rel="noopener" class="td-link">Xem CV</a>`
          : "—"
      }</td>
      <td>${
        c.linkProfile
          ? `<a href="${c.linkProfile}" target="_blank" rel="noopener" class="td-link">Profile</a>`
          : "—"
      }</td>
      <td>${c.trangThaiHoSo || ""}</td>
      <td>${c.ghiChu || ""}</td>
      <td>${soTin}</td>
      <td class="td-actions-cell">
        <button type="button" class="td-link-btn td-candidate-edit-btn" data-candidate-id="${
          c.idUv
        }">Sửa</button>
        <button type="button" class="td-link-btn td-candidate-delete-btn" data-candidate-id="${
          c.idUv
        }">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".td-candidate-edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idUv = btn.getAttribute("data-candidate-id");
      if (!idUv) return;

      let candidate = candidateListCache.find((c) => c.idUv === idUv);
      if (!candidate) {
        try {
          candidate = await apiGetCandidateDetail(idUv);
        } catch (e) {
          console.error(e);
          alert("Không thể tải chi tiết ứng viên");
          return;
        }
      }

      openCandidateModal(root, candidate);
    });
  });

  tbody.querySelectorAll(".td-candidate-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idUv = btn.getAttribute("data-candidate-id");
      if (!idUv) return;
      if (!confirm(`Xóa ứng viên ${idUv}?`)) return;
      try {
        await apiDeleteCandidate(idUv);
        await loadCandidates(root);
      } catch (e) {
        console.error(e);
        alert("Không thể xóa ứng viên");
      }
    });
  });
}

/* ---------- CANDIDATE FILTER ---------- */

function setupCandidateFilterEvents(root) {
  const filterBtn = root.querySelector("#td-candidate-filter-btn");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => applyCandidateFilters(root));
  }
}

function applyCandidateFilters(root) {
  let filtered = [...candidateListCache];

  const keyword =
    root.querySelector("#td-candidate-keyword")?.value.trim().toLowerCase() ||
    "";
  const status = root.querySelector("#td-candidate-status")?.value || "";
  const linkVal = root.querySelector("#td-candidate-link")?.value || "";

  if (keyword) {
    filtered = filtered.filter((c) => {
      const name = (c.hoTen || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const sdt = (c.sdt || "").toLowerCase();
      return (
        name.includes(keyword) || email.includes(keyword) || sdt.includes(keyword)
      );
    });
  }

  if (status) {
    filtered = filtered.filter((c) => (c.trangThaiHoSo || "") === status);
  }

  if (linkVal === "linked") {
    filtered = filtered.filter((c) => (c.soTinDaUngTuyen || 0) > 0);
  } else if (linkVal === "unlinked") {
    filtered = filtered.filter(
      (c) => !c.soTinDaUngTuyen || c.soTinDaUngTuyen === 0
    );
  }

  renderCandidateTable(root, filtered);
}

function populateCandidateFilterOptions(root) {
  const statusSelect = root.querySelector("#td-candidate-status");
  if (!statusSelect) return;

  const statuses = new Set();
  candidateListCache.forEach((c) => {
    if (c.trangThaiHoSo) statuses.add(c.trangThaiHoSo);
  });

  const current = statusSelect.value;
  statusSelect.innerHTML = `<option value="">Tất cả trạng thái</option>`;
  statuses.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    statusSelect.appendChild(opt);
  });
  if (current && statuses.has(current)) statusSelect.value = current;
}

/* ======================================================
   ADD BUTTONS
   ====================================================== */

function setupAddButtons(root) {
  const btnAddJob = root.querySelector("#td-btn-add-job");
  if (btnAddJob) {
    btnAddJob.addEventListener("click", () => openJobModal(root, "create", null));
  }
}

/* ======================================================
   JOB MODAL (CREATE / EDIT)
   ====================================================== */

function setupJobModal(root) {
  const backdrop = root.querySelector("#td-job-modal-backdrop");
  if (!backdrop) return;

  const closeBtn = root.querySelector("#td-job-modal-close");
  const cancelBtn = root.querySelector("#td-job-modal-cancel");
  const form = root.querySelector("#td-job-form");

  closeBtn?.addEventListener("click", () => closeJobModal(root));
  cancelBtn?.addEventListener("click", () => closeJobModal(root));

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeJobModal(root);
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSubmitJobForm(root);
  });
}

function openJobModal(root, mode = "create", job = null) {
  jobFormMode = mode || "create";

  const backdrop = root.querySelector("#td-job-modal-backdrop");
  if (!backdrop) return;
  const modal = backdrop;

  const titleEl = modal.querySelector("#td-job-modal-title");

  const idInput = modal.querySelector("#td-job-id");
  const tieuDeInput = modal.querySelector("#td-job-title");
  const viTriInput = modal.querySelector("#td-job-position-input");
  const capBacInput = modal.querySelector("#td-job-level-input");
  const hinhThucInput = modal.querySelector("#td-job-type-input");
  const trangThaiInput = modal.querySelector("#td-job-status-input");
  const salaryFromInput = modal.querySelector("#td-job-salary-from");
  const salaryToInput = modal.querySelector("#td-job-salary-to");
  const kinhNghiemInput = modal.querySelector("#td-job-experience");
  const headcountInput = modal.querySelector("#td-job-headcount");
  const deadlineInput = modal.querySelector("#td-job-deadline-input");
  const shortDescInput = modal.querySelector("#td-job-shortdesc");
  const descInput = modal.querySelector("#td-job-desc");
  const reqInput = modal.querySelector("#td-job-requirements");

  if (titleEl) {
    titleEl.textContent =
      jobFormMode === "edit" ? "Chỉnh sửa tin tuyển dụng" : "Thêm tin tuyển dụng";
  }

  if (jobFormMode === "edit" && job) {
    if (idInput) {
      idInput.value = job.idTd || "";
      idInput.disabled = true;
    }
    if (tieuDeInput) tieuDeInput.value = job.tieuDe || "";
    if (viTriInput) viTriInput.value = job.viTri || "";
    if (capBacInput) capBacInput.value = job.capBac || "";
    if (hinhThucInput) hinhThucInput.value = job.hinhThucLamViec || "";
    if (trangThaiInput) trangThaiInput.value = job.trangThai || "";
    if (salaryFromInput) salaryFromInput.value = job.mucLuongTu || "";
    if (salaryToInput) salaryToInput.value = job.mucLuongDen || "";
    if (kinhNghiemInput)
      kinhNghiemInput.value =
        job.kinhNghiem != null && !Number.isNaN(job.kinhNghiem)
          ? job.kinhNghiem
          : "";
    if (headcountInput)
      headcountInput.value =
        job.soLuongTuyen != null && !Number.isNaN(job.soLuongTuyen)
          ? job.soLuongTuyen
          : "";
    if (deadlineInput) {
      if (job.hanNop) {
        const d = new Date(job.hanNop);
        if (!Number.isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          deadlineInput.value = `${yyyy}-${mm}-${dd}`;
        } else {
          deadlineInput.value = "";
        }
      } else {
        deadlineInput.value = "";
      }
    }
    if (shortDescInput) shortDescInput.value = job.moTaNgan || "";
    if (descInput) descInput.value = job.moTa || "";
    if (reqInput) reqInput.value = job.yeuCau || "";
  } else {
    if (idInput) {
      idInput.value = "";
      idInput.disabled = false;
    }
    [
      tieuDeInput,
      viTriInput,
      capBacInput,
      hinhThucInput,
      trangThaiInput,
      salaryFromInput,
      salaryToInput,
      kinhNghiemInput,
      headcountInput,
      deadlineInput,
      shortDescInput,
      descInput,
      reqInput,
    ].forEach((el) => el && (el.value = ""));
  }

  backdrop.removeAttribute("hidden");
}

function closeJobModal(root) {
  const backdrop = root.querySelector("#td-job-modal-backdrop");
  if (!backdrop) return;

  const modal = backdrop;
  const form = modal.querySelector("#td-job-form");
  const idInput = modal.querySelector("#td-job-id");

  form?.reset();
  if (idInput) idInput.disabled = false;

  jobFormMode = "create";
  backdrop.setAttribute("hidden", "true");
}

async function handleSubmitJobForm(root) {
  const backdrop = root.querySelector("#td-job-modal-backdrop");
  if (!backdrop) return;
  const modal = backdrop;

  const idInput = modal.querySelector("#td-job-id");
  const tieuDeInput = modal.querySelector("#td-job-title");
  const viTriInput = modal.querySelector("#td-job-position-input");
  const capBacInput = modal.querySelector("#td-job-level-input");
  const hinhThucInput = modal.querySelector("#td-job-type-input");
  const trangThaiInput = modal.querySelector("#td-job-status-input");
  const salaryFromInput = modal.querySelector("#td-job-salary-from");
  const salaryToInput = modal.querySelector("#td-job-salary-to");
  const kinhNghiemInput = modal.querySelector("#td-job-experience");
  const headcountInput = modal.querySelector("#td-job-headcount");
  const deadlineInput = modal.querySelector("#td-job-deadline-input");
  const shortDescInput = modal.querySelector("#td-job-shortdesc");
  const descInput = modal.querySelector("#td-job-desc");
  const reqInput = modal.querySelector("#td-job-requirements");

  const idTd = idInput?.value.trim();
  const tieuDe = tieuDeInput?.value.trim();
  if (!idTd) {
    alert("Mã tin (ID_TD) không được trống");
    return;
  }
  if (!tieuDe) {
    alert("Tiêu đề không được trống");
    return;
  }

  const viTri = viTriInput?.value.trim() || "";
  const capBac = capBacInput?.value.trim() || "";
  const hinhThucLamViec = hinhThucInput?.value.trim() || "";
  const trangThai = trangThaiInput?.value.trim() || "";
  const mucLuongTu = salaryFromInput?.value.trim() || "";
  const mucLuongDen = salaryToInput?.value.trim() || "";
  const moTaNgan = shortDescInput?.value.trim() || "";
  const moTa = descInput?.value.trim() || "";
  const yeuCau = reqInput?.value.trim() || "";

  const kinhNghiemStr = kinhNghiemInput?.value.trim() || "";
  const soLuongTuyenStr = headcountInput?.value.trim() || "";
  const deadlineVal = deadlineInput?.value || "";

  const kinhNghiem = kinhNghiemStr ? parseInt(kinhNghiemStr, 10) : null;
  const soLuongTuyen = soLuongTuyenStr ? parseInt(soLuongTuyenStr, 10) : null;

  let hanNop = null;
  if (deadlineVal) {
    hanNop = `${deadlineVal}T00:00:00`;
  }

  const payload = {
    idTd,
    tieuDe,
    viTri,
    moTaNgan,
    moTa,
    yeuCau,
    capBac,
    hinhThucLamViec,
    mucLuongTu,
    mucLuongDen,
    kinhNghiem: Number.isNaN(kinhNghiem) ? null : kinhNghiem,
    soLuongTuyen: Number.isNaN(soLuongTuyen) ? null : soLuongTuyen,
    hanNop,
    trangThai,
  };

  try {
    if (jobFormMode === "edit") {
      await apiUpdateJob(idTd, payload);
      alert("Cập nhật tin tuyển dụng thành công");
    } else {
      await apiCreateJob(payload);
      alert("Tạo tin tuyển dụng thành công");
    }

    closeJobModal(root);
    await loadJobs(root);
  } catch (e) {
    console.error(e);
    alert("Không thể lưu tin tuyển dụng");
  }
}

/* helper build payload từ cache + patch một số field (vd: trangThai) */
function buildJobPayloadFromCache(job, patch = {}) {
  return {
    idTd: job.idTd,
    tieuDe: job.tieuDe,
    viTri: job.viTri,
    moTaNgan: job.moTaNgan,
    moTa: job.moTa,
    yeuCau: job.yeuCau,
    capBac: job.capBac,
    hinhThucLamViec: job.hinhThucLamViec,
    mucLuongTu: job.mucLuongTu,
    mucLuongDen: job.mucLuongDen,
    kinhNghiem:
      job.kinhNghiem != null && !Number.isNaN(job.kinhNghiem)
        ? job.kinhNghiem
        : null,
    soLuongTuyen:
      job.soLuongTuyen != null && !Number.isNaN(job.soLuongTuyen)
        ? job.soLuongTuyen
        : null,
    hanNop: job.hanNop || null,
    trangThai: job.trangThai || "",
    ...patch,
  };
}

/* ======================================================
   MODAL CHI TIẾT TIN + GHÉP ỨNG VIÊN TỪ LIST CÓ SẴN
   ====================================================== */

function setupJobDetailModal(root) {
  const backdrop = root.querySelector("#td-job-detail-backdrop");
  if (!backdrop) return;

  const closeTopBtn = root.querySelector("#td-job-detail-close-btn");
  const closeBottomBtn = root.querySelector("#td-job-detail-close-btn-bottom");

  closeTopBtn?.addEventListener("click", () => closeJobDetailModal(root));
  closeBottomBtn?.addEventListener("click", () => closeJobDetailModal(root));

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeJobDetailModal(root);
  });

  const addMappingBtn = root.querySelector("#td-detail-add-mapping");
  if (addMappingBtn) {
    addMappingBtn.addEventListener("click", async () => {
      const idEl = root.querySelector("#td-detail-idTd");
      const jobId = idEl?.textContent?.trim();
      if (!jobId || jobId === "—") {
        alert("Chưa xác định được mã tin tuyển dụng.");
        return;
      }
      try {
        await handleAddMappingForJob(jobId);
        await showJobDetailModal(root, jobId);
        await loadCandidates(root);
      } catch (e) {
        console.error(e);
        alert("Không thể gán ứng viên vào tin tuyển dụng");
      }
    });
  }
}

function openJobDetailModal(root) {
  const backdrop = root.querySelector("#td-job-detail-backdrop");
  if (!backdrop) return;
  backdrop.removeAttribute("hidden");
}

function closeJobDetailModal(root) {
  const backdrop = root.querySelector("#td-job-detail-backdrop");
  if (!backdrop) return;

  const modal = backdrop;
  const idsToClear = [
    "#td-detail-idTd",
    "#td-detail-title",
    "#td-detail-viTri",
    "#td-detail-capBac",
    "#td-detail-hinhThuc",
    "#td-detail-mucLuong",
    "#td-detail-kinhNghiem",
    "#td-detail-soLuongTuyen",
    "#td-detail-hanNop",
    "#td-detail-trangThai",
    "#td-detail-soUngVien",
    "#td-detail-moTaNgan",
    "#td-detail-moTa",
    "#td-detail-yeuCau",
  ];
  idsToClear.forEach((sel) => {
    const el = modal.querySelector(sel);
    if (el) el.textContent = sel === "#td-detail-soUngVien" ? "0" : "—";
  });

  const tbody = modal.querySelector("#td-detail-candidate-tbody");
  if (tbody) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">Chưa có ứng viên nào apply tin này.</td>
      </tr>`;
  }

  backdrop.setAttribute("hidden", "true");
}

async function showJobDetailModal(root, idTd) {
  const backdrop = root.querySelector("#td-job-detail-backdrop");
  if (!backdrop) return;
  const modal = backdrop;

  try {
    const [detail, candidates] = await Promise.all([
      apiGetJobDetail(idTd),
      apiGetCandidatesOfJob(idTd),
    ]);

    const mucLuongStr =
      detail.mucLuongTu || detail.mucLuongDen
        ? `${detail.mucLuongTu || ""}${
            detail.mucLuongTu && detail.mucLuongDen ? " - " : ""
          }${detail.mucLuongDen || ""}`
        : "—";

    const idEl = modal.querySelector("#td-detail-idTd");
    const titleEl = modal.querySelector("#td-detail-title");
    const viTriEl = modal.querySelector("#td-detail-viTri");
    const capBacEl = modal.querySelector("#td-detail-capBac");
    const hinhThucEl = modal.querySelector("#td-detail-hinhThuc");
    const mucLuongEl = modal.querySelector("#td-detail-mucLuong");
    const kinhNghiemEl = modal.querySelector("#td-detail-kinhNghiem");
    const soLuongTuyenEl = modal.querySelector("#td-detail-soLuongTuyen");
    const hanNopEl = modal.querySelector("#td-detail-hanNop");
    const trangThaiEl = modal.querySelector("#td-detail-trangThai");
    const soUngVienEl = modal.querySelector("#td-detail-soUngVien");
    const moTaNganEl = modal.querySelector("#td-detail-moTaNgan");
    const moTaEl = modal.querySelector("#td-detail-moTa");
    const yeuCauEl = modal.querySelector("#td-detail-yeuCau");
    const tableBody = modal.querySelector("#td-detail-candidate-tbody");

    if (idEl) idEl.textContent = detail.idTd || "—";
    if (titleEl) titleEl.textContent = detail.tieuDe || "—";
    if (viTriEl) viTriEl.textContent = detail.viTri || "—";
    if (capBacEl) capBacEl.textContent = detail.capBac || "—";
    if (hinhThucEl) hinhThucEl.textContent = detail.hinhThucLamViec || "—";
    if (mucLuongEl) mucLuongEl.textContent = mucLuongStr;
    if (kinhNghiemEl)
      kinhNghiemEl.textContent =
        detail.kinhNghiem != null && !Number.isNaN(detail.kinhNghiem)
          ? `${detail.kinhNghiem} năm`
          : "—";
    if (soLuongTuyenEl)
      soLuongTuyenEl.textContent =
        detail.soLuongTuyen != null && !Number.isNaN(detail.soLuongTuyen)
          ? String(detail.soLuongTuyen)
          : "—";
    if (hanNopEl)
      hanNopEl.textContent = detail.hanNop ? formatDate(detail.hanNop) : "—";
    if (trangThaiEl) trangThaiEl.textContent = detail.trangThai || "—";
    if (moTaNganEl) moTaNganEl.textContent = detail.moTaNgan || "—";
    if (moTaEl) moTaEl.textContent = detail.moTa || "—";
    if (yeuCauEl) yeuCauEl.textContent = detail.yeuCau || "—";

    const list = Array.isArray(candidates) ? candidates : [];
    if (soUngVienEl)
      soUngVienEl.textContent = list.length ? String(list.length) : "0";

    if (tableBody) {
      if (list.length === 0) {
        tableBody.innerHTML = `
          <tr class="empty-row">
            <td colspan="6">Chưa có ứng viên nào apply tin này.</td>
          </tr>`;
      } else {
        tableBody.innerHTML = "";
        list.forEach((c) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${c.idUv || ""}</td>
            <td>${c.hoTen || ""}</td>
            <td>${c.email || ""}</td>
            <td>${c.sdt || ""}</td>
            <td>${c.trangThaiHoSo || ""}</td>
            <td class="td-actions-cell">
              <button type="button"
                      class="td-link-btn td-remove-mapping-btn"
                      data-id-td="${detail.idTd}"
                      data-id-uv="${c.idUv}">
                Bỏ gán
              </button>
            </td>
          `;
          tableBody.appendChild(tr);
        });

        tableBody
          .querySelectorAll(".td-remove-mapping-btn")
          .forEach((btn) => {
            btn.addEventListener("click", async () => {
              const jobId = btn.getAttribute("data-id-td");
              const uvId = btn.getAttribute("data-id-uv");
              if (!jobId || !uvId) return;

              if (!confirm("Bạn có chắc muốn bỏ gán ứng viên này khỏi tin?"))
                return;

              try {
                await apiRemoveCandidateFromJob(jobId, uvId);
                await showJobDetailModal(root, jobId);
                await loadCandidates(root);
              } catch (e) {
                console.error(e);
                alert("Không thể bỏ gán ứng viên khỏi tin tuyển dụng");
              }
            });
          });
      }
    }

    openJobDetailModal(root);
  } catch (e) {
    console.error(e);
    alert("Không thể tải chi tiết tin tuyển dụng");
  }
}

/* ======================================================
   CANDIDATE MODAL (CHỈ SỬA)
   ====================================================== */

function setupCandidateModal(root) {
  const backdrop = root.querySelector("#td-candidate-modal-backdrop");
  if (!backdrop) return;

  const closeBtn = root.querySelector("#td-candidate-modal-close");
  const cancelBtn = root.querySelector("#td-candidate-modal-cancel");
  const form = root.querySelector("#td-candidate-form");

  closeBtn?.addEventListener("click", () => closeCandidateModal(root));
  cancelBtn?.addEventListener("click", () => closeCandidateModal(root));

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeCandidateModal(root);
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSubmitCandidateForm(root);
  });
}

function openCandidateModal(root, candidate) {
  const backdrop = root.querySelector("#td-candidate-modal-backdrop");
  if (!backdrop) return;
  const modal = backdrop;

  const titleEl = modal.querySelector("#td-candidate-modal-title");

  const idInput = modal.querySelector("#td-candidate-id");
  const nameInput = modal.querySelector("#td-candidate-name");
  const emailInput = modal.querySelector("#td-candidate-email");
  const phoneInput = modal.querySelector("#td-candidate-phone");
  const cvInput = modal.querySelector("#td-candidate-cv");
  const profileInput = modal.querySelector("#td-candidate-profile");
  const statusInput = modal.querySelector("#td-candidate-status");
  const noteInput = modal.querySelector("#td-candidate-note");

  if (titleEl) {
    titleEl.textContent = "Chỉnh sửa ứng viên";
  }

  if (candidate) {
    if (idInput) {
      idInput.value = candidate.idUv || "";
      idInput.disabled = true;
    }
    if (nameInput) nameInput.value = candidate.hoTen || "";
    if (emailInput) emailInput.value = candidate.email || "";
    if (phoneInput) phoneInput.value = candidate.sdt || "";
    if (cvInput) cvInput.value = candidate.cvUrl || "";
    if (profileInput) profileInput.value = candidate.linkProfile || "";
    if (statusInput) statusInput.value = candidate.trangThaiHoSo || "";
    if (noteInput) noteInput.value = candidate.ghiChu || "";
  }

  backdrop.removeAttribute("hidden");
}

function closeCandidateModal(root) {
  const backdrop = root.querySelector("#td-candidate-modal-backdrop");
  if (!backdrop) return;

  const modal = backdrop;
  const form = modal.querySelector("#td-candidate-form");
  const idInput = modal.querySelector("#td-candidate-id");

  form?.reset();
  if (idInput) idInput.disabled = true;

  backdrop.setAttribute("hidden", "true");
}

async function handleSubmitCandidateForm(root) {
  const backdrop = root.querySelector("#td-candidate-modal-backdrop");
  if (!backdrop) return;
  const modal = backdrop;

  const idInput = modal.querySelector("#td-candidate-id");
  const nameInput = modal.querySelector("#td-candidate-name");
  const emailInput = modal.querySelector("#td-candidate-email");
  const phoneInput = modal.querySelector("#td-candidate-phone");
  const cvInput = modal.querySelector("#td-candidate-cv");
  const profileInput = modal.querySelector("#td-candidate-profile");
  const statusInput = modal.querySelector("#td-candidate-status");
  const noteInput = modal.querySelector("#td-candidate-note");

  const idUv = idInput?.value.trim();
  if (!idUv) {
    alert("Thiếu ID_UV ứng viên");
    return;
  }

  const payload = {
    idUv,
    hoTen: nameInput?.value.trim() || "",
    email: emailInput?.value.trim() || "",
    sdt: phoneInput?.value.trim() || "",
    cvUrl: cvInput?.value.trim() || "",
    linkProfile: profileInput?.value.trim() || "",
    trangThaiHoSo: statusInput?.value.trim() || "",
    ghiChu: noteInput?.value.trim() || "",
  };

  try {
    await apiUpdateCandidate(idUv, payload);
    alert("Cập nhật ứng viên thành công");
    closeCandidateModal(root);
    await loadCandidates(root);
  } catch (e) {
    console.error(e);
    alert("Không thể lưu ứng viên");
  }
}

/* ======================================================
   MAPPING ỨNG VIÊN <-> TIN (chỉ gán có sẵn, không tạo mới)
   ====================================================== */

async function handleAddMappingForJob(jobId) {
  try {
    const currentMapped = await apiGetCandidatesOfJob(jobId);
    const mappedIds = new Set(
      (currentMapped || []).map((c) => c.idUv).filter(Boolean)
    );

    const available = candidateListCache.filter(
      (c) => c.idUv && !mappedIds.has(c.idUv)
    );

    if (available.length === 0) {
      alert("Hiện không còn ứng viên nào chưa gán cho tin này.");
      return;
    }

    const listStr = available
      .map((c) => `${c.idUv} - ${c.hoTen || ""}`)
      .join("\n");

    const input = prompt(
      `Các ứng viên có thể gán (đã apply ở nơi khác hoặc mới thêm từ public site):\n\n${listStr}\n\nNhập danh sách ID_UV cần gán, phân tách bởi dấu phẩy:`
    );
    if (!input) return;

    const ids = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const validSet = new Set(available.map((c) => c.idUv));
    const selectedIds = ids.filter((id) => validSet.has(id));

    if (selectedIds.length === 0) {
      alert("Không có ID_UV hợp lệ được nhập.");
      return;
    }

    await apiAddCandidatesToJob(jobId, selectedIds);
    alert("Gán ứng viên vào tin thành công");
  } catch (e) {
    console.error(e);
    alert("Không thể gán ứng viên vào tin tuyển dụng");
  }
}

/* ======================================================
   UTILS
   ====================================================== */

function formatDate(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
}
