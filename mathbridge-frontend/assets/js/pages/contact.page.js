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
(function() {
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
    status.textContent = "❌ Vui lòng điền đầy đủ thông tin cá nhân và chọn nội dung tư vấn.";
    return;
  }

  // Validate phone number (must be exactly 10 digits)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
    status.textContent = "❌ Số điện thoại phải có đúng 10 chữ số.";
    return;
  }

  const contactData = {
    hoTen: firstName + " " + lastName,
    email: email,
    sdt: phone,
    tieuDe: "Liên hệ từ trang Contact",
    noiDung: formData.get("message"),
    hinhThucTuVan: hinhThucTuVan
  };

  try {
    const message = await submitContactForm(contactData);
    status.textContent = "✅ " + message;
    form.reset();
  } catch (error) {
    status.textContent = "❌ Gửi thất bại. Vui lòng thử lại sau.";
    console.error('Error submitting form:', error);
  }
});

// Load contact info from API
async function loadContactInfo() {
  try {
    const contactData = await getContactInfo();

    // Update address
    const addressElement = document.getElementById('contact-address');
    if (addressElement && contactData.address) {
      addressElement.textContent = contactData.address;
    }

    // Update hotline
    const hotlineElement = document.getElementById('contact-hotline');
    if (hotlineElement && contactData.hotline) {
      hotlineElement.textContent = contactData.hotline;
    }

    // Update working hours
    const hoursElement = document.getElementById('contact-hours');
    if (hoursElement && contactData.workingHours) {
      hoursElement.textContent = contactData.workingHours;
    }

    // Display centers information
    const centersListElement = document.getElementById('centers-list');
    if (centersListElement && contactData.centers && contactData.centers.length > 0) {
      const centersHtml = contactData.centers.map(center => `
        <div class="center-item">
          <h5>${center.name}</h5>
          <p><strong>📍 Địa chỉ:</strong> ${center.address}</p>
          <p><strong>📞 Hotline:</strong> ${center.hotline}</p>
          <p><strong>🕒 Giờ làm việc:</strong> ${center.workingHours}</p>
          <p><strong>📅 Ngày làm việc:</strong> ${center.workingDays}</p>
        </div>
      `).join('');
      centersListElement.innerHTML = centersHtml;
    } else {
      centersListElement.innerHTML = '<p style="color: var(--ink-70); font-style: italic;">Không có thông tin cơ sở.</p>';
    }

  } catch (error) {
    console.error('Failed to load contact info:', error);
    // Fallback: keep static content
  }
}