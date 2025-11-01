// Include header/footer
window.addEventListener("load", () => {
    includePartials({
        header: "partials/header.html",
        footer: "partials/footer.html",
    });

    // Load contact info from API
    loadContactInfo();
});

// EmailJS setup
(function () {
    emailjs.init("YOUR_PUBLIC_KEY"); // 🔹 Thay bằng public key EmailJS của bạn
})();

const form = document.getElementById("contactForm");
const status = document.getElementById("form-status");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const hinhThucTuVan = formData.get("hinhThucTuVan");

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !hinhThucTuVan) {
        status.textContent = "❌ Vui lòng điền đầy đủ thông tin và chọn nội dung tư vấn.";
        return;
    }

    const contactData = {
        hoTen: firstName + " " + lastName,
        email: email,
        sdt: phone,
        tieuDe: "Liên hệ từ trang Contact",
        noiDung: formData.get("message"),
        hinhThucTuVan: hinhThucTuVan,
    };

    try {
        const message = await submitContactForm(contactData);
        status.textContent = "✅ " + message;
        form.reset();
    } catch (error) {
        status.textContent = "❌ Gửi thất bại. Vui lòng thử lại sau.";
        console.error("Error submitting form:", error);
    }
});

// 🔹 API: Lấy thông tin liên hệ
async function getContactInfo() {
    try {
        const response = await fetch("http://localhost:8080/api/public/contact");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("❌ Lỗi khi tải thông tin liên hệ:", error);
        throw error;
    }
}

// 🔹 API: Gửi form liên hệ
async function submitContactForm(contactData) {
    try {
        const response = await fetch("http://localhost:8080/api/public/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error("❌ Lỗi khi gửi form liên hệ:", error);
        throw error;
    }
}

// Load contact info and render on page
async function loadContactInfo() {
    try {
        const contactData = await getContactInfo();

        // Cập nhật thông tin chính
        const addressElement = document.getElementById("contact-address");
        const hotlineElement = document.getElementById("contact-hotline");
        const hoursElement = document.getElementById("contact-hours");
        const centersListElement = document.getElementById("centers-list");

        if (addressElement && contactData.address) addressElement.textContent = contactData.address;
        if (hotlineElement && contactData.hotline) hotlineElement.textContent = contactData.hotline;
        if (hoursElement && contactData.workingHours) hoursElement.textContent = contactData.workingHours;

        // Hiển thị danh sách cơ sở
        if (centersListElement && contactData.centers?.length > 0) {
            centersListElement.innerHTML = contactData.centers
                .map(
                    (center) => `
        <div class="center-item" style="background:#fafafa; padding:10px 15px; border-radius:10px; margin-bottom:10px;">
          <h5 style="color:#d63384; margin-bottom:5px;">${center.name}</h5>
          <p><strong>📍 Địa chỉ:</strong> ${center.address}</p>
        </div>`
                )
                .join("");
        } else if (centersListElement) {
            centersListElement.innerHTML = '<p style="font-style:italic;">Không có thông tin cơ sở.</p>';
        }
    } catch (error) {
        console.error("Failed to load contact info:", error);
    }
}
