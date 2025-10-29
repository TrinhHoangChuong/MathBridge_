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
  const contactData = {
    hoTen: formData.get("first_name") + " " + formData.get("last_name"),
    email: formData.get("email"),
    sdt: formData.get("phone"),
    tieuDe: "Liên hệ từ trang Contact",
    noiDung: formData.get("message"),
    hinhThucTuVan: "Liên hệ qua form website"
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

    // Update phone number if available
    const phoneElement = document.querySelector('.contact-phone a');
    if (phoneElement && contactData.hotline) {
      phoneElement.href = `tel:${contactData.hotline.replace(/\s/g, '')}`;
      phoneElement.textContent = contactData.hotline;
    }

  } catch (error) {
    console.error('Failed to load contact info:', error);
    // Fallback: keep static content
  }
}