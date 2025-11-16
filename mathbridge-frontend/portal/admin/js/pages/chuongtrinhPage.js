// ===========================================
//  CHUONGTRINH PAGE
//  - Tab Chương trình (card grid)
//  - Tab Lớp học (table + menu 3 chấm)
//  - CRUD Program + Class (dùng modal)
// ===========================================

import {
    apiGetAllPrograms,
    apiCreateProgram,
    apiUpdateProgram,
    apiDeleteProgram,
    apiGetProgramById,
} from "../api/programApi.js";

import {
    apiGetAllClasses,
    apiGetClassById,
    apiCreateClass,
    apiUpdateClass,
    apiDeleteClass,
} from "../api/classApi.js";

// State đơn giản để biết đã load chưa
let programsLoaded = false;
let classesLoaded = false;

// Cache element
let programGridEl;
let classTbodyEl;

let editingProgramId = null;
let editingClassId = null;

// ---------------------------
// ENTRY POINT SPA
// ---------------------------
export async function initChuongTrinhPage() {
    console.log("▶ initChuongTrinhPage (Program + Class + Tabs)");

    // Cache elements
    programGridEl = document.getElementById("ct-program-list");
    classTbodyEl = document.getElementById("ct-class-tbody");

    setupTabs();
    setupProgramActions();
    setupClassActions();
    setupProgramModal();
    setupClassModal();
    setupGlobalClickCloseMenus();
}

/* ================================================================
   TABS (Chương trình / Lớp học)
================================================================ */
function setupTabs() {
    const tabProgram = document.getElementById("ctTabProgram");
    const tabClass = document.getElementById("ctTabClass");
    const panelProgram = document.getElementById("ctPanelProgram");
    const panelClass = document.getElementById("ctPanelClass");

    const activateTab = async (key) => {
        const isProgram = key === "program";

        tabProgram.classList.toggle("ct-tab-active", isProgram);
        tabClass.classList.toggle("ct-tab-active", !isProgram);

        panelProgram.classList.toggle("ct-tab-panel-active", isProgram);
        panelClass.classList.toggle("ct-tab-panel-active", !isProgram);

        if (isProgram && !programsLoaded) {
            await loadPrograms();
        }
        if (!isProgram && !classesLoaded) {
            await loadClasses();
        }
    };

    tabProgram.addEventListener("click", () => activateTab("program"));
    tabClass.addEventListener("click", () => activateTab("class"));

    // Mặc định: mở tab Chương trình và load luôn data
    activateTab("program");
}

/* ================================================================
   PROGRAM SECTION
================================================================ */
function setupProgramActions() {
    const btnCard = document.getElementById("btnProgramDetail");
    const btnHeader = document.getElementById("ctAddProgramHeader");

    // Bấm card → chuyển sang tab chương trình + load
    if (btnCard) {
        btnCard.addEventListener("click", async () => {
            document.getElementById("ctTabProgram").click();
        });
    }

    // Bấm "Thêm chương trình"
    if (btnHeader) {
        btnHeader.addEventListener("click", () => openCreateProgramForm());
    }
}

async function loadPrograms() {
    try {
        const list = await apiGetAllPrograms();
        renderProgramList(list);
        programsLoaded = true;
    } catch (err) {
        console.error(err);
        alert("Không thể tải danh sách chương trình.");
    }
}

function renderProgramList(list) {
    if (!list || list.length === 0) {
        programGridEl.innerHTML = `<p>Chưa có chương trình nào.</p>`;
        return;
    }

    const html = list
        .map(
            (p) => `
        <article class="prog-card">
            <div class="prog-title-row">
                <div>
                    <h4 class="prog-title">${p.tenCT}</h4>
                    <p class="prog-desc">${p.moTa}</p>
                </div>
                <span class="prog-code">${p.idCT}</span>
            </div>
            <div class="prog-actions">
                <button class="prog-btn prog-edit" data-id="${p.idCT}">Sửa</button>
                <button class="prog-btn danger prog-delete" data-id="${p.idCT}">Xóa</button>
            </div>
        </article>
    `
        )
        .join("");

    programGridEl.innerHTML = html;

    programGridEl.querySelectorAll(".prog-edit").forEach((btn) => {
        btn.addEventListener("click", () =>
            openEditProgramForm(btn.dataset.id),
        );
    });

    programGridEl.querySelectorAll(".prog-delete").forEach((btn) => {
        btn.addEventListener("click", () =>
            handleDeleteProgram(btn.dataset.id),
        );
    });
}

/* ----- Modal Program ----- */
function setupProgramModal() {
    const cancelBtn = document.getElementById("ctCancelBtn");
    const form = document.getElementById("ctProgramForm");

    cancelBtn.addEventListener("click", () => closeProgramModal());

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            idCT: form.idCT.value.trim(),
            tenCT: form.tenCT.value.trim(),
            moTa: form.moTa.value.trim(),
        };

        try {
            if (editingProgramId) {
                await apiUpdateProgram(editingProgramId, {
                    tenCT: payload.tenCT,
                    moTa: payload.moTa,
                });
            } else {
                await apiCreateProgram(payload);
            }

            await loadPrograms();
            closeProgramModal();
        } catch (err) {
            console.error(err);
            alert("Không thể lưu chương trình.");
        }
    });
}

function openCreateProgramForm() {
    editingProgramId = null;
    document.getElementById("ctModalTitle").textContent = "Thêm chương trình";
    document.getElementById("ct-idCT").disabled = false;
    document.getElementById("ct-idCT").value = "";
    document.getElementById("ct-tenCT").value = "";
    document.getElementById("ct-moTa").value = "";
    document.getElementById("ctProgramModal").classList.remove("hidden");
}

async function openEditProgramForm(id) {
    editingProgramId = id;

    try {
        const data = await apiGetProgramById(id);
        document.getElementById("ctModalTitle").textContent =
            "Sửa chương trình";
        const idInput = document.getElementById("ct-idCT");
        idInput.value = data.idCT;
        idInput.disabled = true;
        document.getElementById("ct-tenCT").value = data.tenCT;
        document.getElementById("ct-moTa").value = data.moTa;

        document.getElementById("ctProgramModal").classList.remove("hidden");
    } catch (err) {
        console.error(err);
        alert("Không thể tải chi tiết chương trình.");
    }
}

function closeProgramModal() {
    document.getElementById("ctProgramModal").classList.add("hidden");
}

async function handleDeleteProgram(id) {
    if (!confirm("Xóa chương trình này?")) return;

    try {
        await apiDeleteProgram(id);
        await loadPrograms();
    } catch (err) {
        console.error(err);
        alert("Không thể xóa chương trình.");
    }
}

/* ================================================================
   CLASS SECTION
   - Table + menu 3 chấm
================================================================ */
function setupClassActions() {
    const cardBtn = document.getElementById("btnClassDetail");
    const headerBtn = document.getElementById("ctAddClassHeader");

    if (cardBtn) {
        cardBtn.addEventListener("click", () => {
            document.getElementById("ctTabClass").click();
        });
    }

    if (headerBtn) {
        headerBtn.addEventListener("click", () => openCreateClassForm());
    }
}

async function loadClasses() {
    try {
        const list = await apiGetAllClasses();
        renderClassTable(list);
        classesLoaded = true;
    } catch (err) {
        console.error(err);
        alert("Không thể tải danh sách lớp học.");
    }
}

function renderClassTable(list) {
    if (!list || list.length === 0) {
        classTbodyEl.innerHTML = `
            <tr><td colspan="8">Chưa có lớp học nào.</td></tr>
        `;
        return;
    }

    const html = list
        .map(
            (cl) => `
        <tr>
            <td>
                <div class="class-name">${cl.tenLop}</div>
                <div class="class-sub">
                    Mã lớp: ${cl.idLh}
                </div>
            </td>
            <td>${cl.idCt}</td>
            <td>${cl.idNv}</td>
            <td>${cl.loaiNgay} • ${cl.soBuoi} buổi</td>
            <td>${cl.hinhThucHoc}</td>
            <td>${cl.mucGiaThang}</td>
            <td>
                <span class="class-status">
                    ${cl.trangThai}
                </span>
            </td>
            <td class="class-actions">
                <button
                    type="button"
                    class="class-menu-trigger"
                    data-id="${cl.idLh}"
                >
                    ⋯
                </button>
                <div class="class-menu" data-id="${cl.idLh}">
                    <button
                        type="button"
                        class="class-menu-edit"
                        data-id="${cl.idLh}"
                    >
                        Sửa
                    </button>
                    <button
                        type="button"
                        class="class-menu-delete danger"
                        data-id="${cl.idLh}"
                    >
                        Xóa
                    </button>
                </div>
            </td>
        </tr>
    `
        )
        .join("");

    classTbodyEl.innerHTML = html;

    bindClassRowEvents();
}

/* ----- menu 3 chấm + CRUD ----- */
function bindClassRowEvents() {
    const triggers = classTbodyEl.querySelectorAll(".class-menu-trigger");
    const menus = classTbodyEl.querySelectorAll(".class-menu");

    const closeAllMenus = () =>
        menus.forEach((m) => m.classList.remove("open"));

    triggers.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const menu = classTbodyEl.querySelector(
                `.class-menu[data-id="${id}"]`,
            );
            if (!menu) return;
            const isOpen = menu.classList.contains("open");
            closeAllMenus();
            if (!isOpen) menu.classList.add("open");
        });
    });

    classTbodyEl
        .querySelectorAll(".class-menu-edit")
        .forEach((btn) =>
            btn.addEventListener("click", () =>
                openEditClassForm(btn.dataset.id),
            ),
        );

    classTbodyEl
        .querySelectorAll(".class-menu-delete")
        .forEach((btn) =>
            btn.addEventListener("click", () =>
                handleDeleteClass(btn.dataset.id),
            ),
        );
}

// đóng menu khi bấm ra ngoài (setup 1 lần)
function setupGlobalClickCloseMenus() {
    document.addEventListener("click", () => {
        document
            .querySelectorAll(".class-menu.open")
            .forEach((m) => m.classList.remove("open"));
    });
}

/* ----- Modal Class ----- */
function setupClassModal() {
    const cancelBtn = document.getElementById("clCancelBtn");
    const form = document.getElementById("ctClassForm");

    cancelBtn.addEventListener("click", () => closeClassModal());

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(form));

        try {
            if (editingClassId) {
                await apiUpdateClass(editingClassId, payload);
            } else {
                await apiCreateClass(payload);
            }

            await loadClasses();
            closeClassModal();
        } catch (err) {
            console.error(err);
            alert("Không thể lưu lớp học.");
        }
    });
}

function openCreateClassForm() {
    editingClassId = null;
    document.getElementById("ctClassModalTitle").textContent =
        "Thêm lớp học";
    document.getElementById("ctClassForm").reset();
    document.getElementById("cl-idLh").disabled = false;
    document.getElementById("ctClassModal").classList.remove("hidden");
}

async function openEditClassForm(id) {
    editingClassId = id;

    try {
        const data = await apiGetClassById(id);

        document.getElementById("ctClassModalTitle").textContent =
            "Sửa lớp học";

        document.getElementById("cl-idLh").value = data.idLh;
        document.getElementById("cl-idLh").disabled = true;
        document.getElementById("cl-idNv").value = data.idNv;
        document.getElementById("cl-idCt").value = data.idCt;
        document.getElementById("cl-tenLop").value = data.tenLop;
        document.getElementById("cl-loaiNgay").value = data.loaiNgay;
        document.getElementById("cl-soBuoi").value = data.soBuoi;
        document.getElementById("cl-hinhThucHoc").value = data.hinhThucHoc;
        document.getElementById("cl-ngayBatDau").value = data.ngayBatDau;
        document.getElementById("cl-mucGiaThang").value = data.mucGiaThang;
        document.getElementById("cl-danhGia").value = data.danhGia;
        document.getElementById("cl-trangThai").value = data.trangThai;
        document.getElementById("cl-moTa").value = data.moTa;

        document.getElementById("ctClassModal").classList.remove("hidden");
    } catch (err) {
        console.error(err);
        alert("Không thể tải chi tiết lớp học.");
    }
}

function closeClassModal() {
    document.getElementById("ctClassModal").classList.add("hidden");
}

async function handleDeleteClass(id) {
    if (!confirm("Xóa lớp học này?")) return;

    try {
        await apiDeleteClass(id);
        await loadClasses();
    } catch (err) {
        console.error(err);
        alert("Không thể xóa lớp học.");
    }
}
