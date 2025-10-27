// assets/js/pages/TeacherDetailClass.page.js
//
// Trang chi tiết giáo viên + các lớp họ phụ trách
//   GET /api/public/nhanvien/{idNv}
//   GET /api/public/nhanvien/{idNv}/lophoc

import { CONFIG } from "../config.js";
// dd/MM/yyyy
function formatDate(isoLike) {
  if (!isoLike) return "—";
  const d = new Date(isoLike);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${mon}/${year}`;
}

// tiền VNĐ / tháng
function formatFee(v) {
  if (v == null) return "Liên hệ";
  try {
    return (
      Intl.NumberFormat("vi-VN").format(v) +
      "đ / tháng"
    );
  } catch {
    return v + "đ / tháng";
  }
}

/* ----------------- call API ----------------- */
async function fetchTeacherInfo(idNv) {
  const res = await fetch(`${CONFIG.BASE_URL}/api/public/nhanvien/${idNv}`);
  if (!res.ok) {
    throw new Error("fetchTeacherInfo fail " + res.status);
  }
  return res.json();
}

async function fetchTeacherClasses(idNv) {
  const res = await fetch(`${CONFIG.BASE_URL}/api/public/nhanvien/${idNv}/lophoc`);
  if (!res.ok) {
    throw new Error("fetchTeacherClasses fail " + res.status);
  }
  return res.json();
}


function createClassCardHTML(cls, idNv) {
  const tenLop = cls.tenLop || "Lớp học";
  const ctName = cls.tenChuongTrinh || "Chương trình";
  const startStr = formatDate(cls.ngayBatDau);

  const feeStr = formatFee(cls.mucGiaThang);
  const hinhThuc = cls.hinhThucHoc || "—";
  const status = cls.trangThai || "";
  const moTa = cls.moTa || "";
  const lichText = [
    cls.loaiNgay ? `Lịch: ${cls.loaiNgay}` : "",
    cls.soBuoi  ? `Số buổi: ${cls.soBuoi}` : ""
  ].filter(Boolean).join(" • ");

  // Link CTA -> trang tư vấn, kèm query cho biết class & teacher
  const enrollHref = `pages/contact.html?class=${encodeURIComponent(cls.idLh)}&teacher=${encodeURIComponent(idNv)}`;

  return `
    <article class="td-class-card" role="listitem">
      <div class="td-class-card__body">
        <div class="td-class-card__headrow">
          <h3 class="td-class-card__title">${tenLop}</h3>
          ${status
            ? `<span class="td-class-card__status">${status}</span>`
            : ""
          }
        </div>

        <div class="td-class-card__program">
          ${ctName}
        </div>

        <ul class="td-class-card__info">
          <li>
            <i class="ph ph-calendar-check"></i>
            <span>Khai giảng: ${startStr}</span>
          </li>

          <li>
            <i class="ph ph-graduation-cap"></i>
            <span>Hình thức: ${hinhThuc}</span>
          </li>

          ${lichText ? `
          <li>
            <i class="ph ph-clock"></i>
            <span>${lichText}</span>
          </li>` : ""}

          <li>
            <i class="ph ph-currency-circle-dollar"></i>
            <span>Học phí: ${feeStr}</span>
          </li>
        </ul>

        ${moTa
          ? `<p class="td-class-card__desc">${moTa}</p>`
          : ""
        }
      </div>

      <footer class="td-class-card__footer">
        <a class="btn btn--enroll" href="${enrollHref}">
          <i class="ph ph-pencil-line" aria-hidden="true"></i>
          <span>Đăng ký lớp này</span>
        </a>
      </footer>
    </article>
  `;
}

/* ----------------- main init ----------------- */

async function initTeacherDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const idNv = params.get("id"); // quan trọng: TeacherDetailClass.html?id=NV001

  const statusEl       = document.querySelector("[data-td-status]");
  const teacherNameEl  = document.querySelector("[data-teacher-name]");
  const classListEl    = document.querySelector("[data-class-list]");
  const classCountEl   = document.querySelector("[data-class-count]");
  const emptyEl        = document.querySelector("[data-class-empty]");

  // check param
  if (!idNv) {
    if (statusEl) {
      statusEl.classList.remove("hidden");
      statusEl.textContent = "Thiếu mã giáo viên (id).";
    }
    return;
  }

  // hiển thị trạng thái đang tải
  if (statusEl) {
    statusEl.classList.remove("hidden");
    statusEl.textContent = "Đang tải dữ liệu...";
  }

  try {
    // gọi song song: info gv + lớp
    const [teacherRes, classesRes] = await Promise.all([
      fetchTeacherInfo(idNv),
      fetchTeacherClasses(idNv)
    ]);

    // 1) render tên giáo viên
    const t = teacherRes && teacherRes.teacher ? teacherRes.teacher : null;
    if (teacherNameEl) {
      teacherNameEl.textContent = t && t.fullName
        ? t.fullName
        : "Giảng viên";
    }

    // 2) render các lớp
    const classes = (classesRes && Array.isArray(classesRes.classes))
      ? classesRes.classes
      : [];

    if (classCountEl) {
      classCountEl.textContent = String(classes.length);
    }

    if (classes.length === 0) {
      if (emptyEl) emptyEl.classList.remove("hidden");
      if (classListEl) classListEl.innerHTML = "";
    } else {
      if (emptyEl) emptyEl.classList.add("hidden");
      if (classListEl) {
        classListEl.innerHTML = classes
          .map(cls => createClassCardHTML(cls, idNv))
          .join("");
      }
    }

    // clear status
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.classList.add("hidden");
    }

  } catch (err) {
    console.error(err);
    if (statusEl) {
      statusEl.classList.remove("hidden");
      statusEl.textContent = "Không tải được dữ liệu. Vui lòng thử lại sau.";
    }
    if (classListEl) {
      classListEl.innerHTML = `
        <div class="td-empty-error">
          Lỗi tải danh sách lớp.
        </div>
      `;
    }
    if (classCountEl) classCountEl.textContent = "0";
    if (emptyEl) emptyEl.classList.add("hidden"); // vì mình hiện error riêng
  }
}

document.addEventListener("DOMContentLoaded", initTeacherDetailPage);
