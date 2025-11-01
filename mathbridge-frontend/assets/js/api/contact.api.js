// API functions for contact page

/**
 * Get contact information
 * @returns {Promise<Object>} Contact data
 */
async function getContactInfo() {
  try {
    const response = await fetch('/api/public/contact');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch contact info:', error);
    throw error;
  }
}

/**
 * Submit contact form
 * @param {Object} contactData - Contact form data
 * @returns {Promise<string>} Success message
 */
async function submitContactForm(contactData) {
  try {
    const response = await fetch('/api/public/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    throw error;
  }
}