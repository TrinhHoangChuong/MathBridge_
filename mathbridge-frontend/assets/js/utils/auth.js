// file: assets/js/utils/auth.js
const AUTH_KEY = "mb_auth";

function getAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Cannot parse mb_auth:", e);
    return null;
  }
}

function setAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

<<<<<<< HEAD
// Validate JWT token
function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Invalid token format' };
  }

  try {
    // Check JWT structure (header.payload.signature)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return { valid: false, error: 'Invalid JWT format' };
    }

    // Decode payload
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check expiration
    if (payload.exp && payload.exp < currentTime) {
      return { valid: false, error: 'Token expired', expired: true };
    }

    return { valid: true, payload: payload };
  } catch (error) {
    return { valid: false, error: 'Token parsing failed' };
  }
}

// Check if user is authenticated and has required role
function isAuthenticated(requiredRole = null) {
  const authData = getAuth();
  if (!authData || !authData.token) {
    return { authenticated: false, error: 'No authentication data' };
  }

  const tokenValidation = validateToken(authData.token);
  if (!tokenValidation.valid) {
    return { authenticated: false, error: tokenValidation.error };
  }

  // Check role if required
  if (requiredRole) {
    const userRoles = tokenValidation.payload.roles || authData.roles || [];
    const hasRole = userRoles.includes(requiredRole) ||
                   userRoles.some(role => new RegExp(requiredRole, 'i').test(role));

    if (!hasRole) {
      return { authenticated: false, error: `Missing required role: ${requiredRole}` };
    }
  }

  return { authenticated: true, payload: tokenValidation.payload };
}

// Check if user is a student
function isStudent() {
  return isAuthenticated('R001|STUDENT|hoc.*sinh');
}

=======
>>>>>>> main
// Expose functions to global scope
window.getAuth = getAuth;
window.setAuth = setAuth;
window.clearAuth = clearAuth;
<<<<<<< HEAD
window.validateToken = validateToken;
window.isAuthenticated = isAuthenticated;
window.isStudent = isStudent;
=======
>>>>>>> main
