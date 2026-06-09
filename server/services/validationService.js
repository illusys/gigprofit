function validatePasswordStrength(password) {
  const errors = [];
  if (!password || password.length < 12) errors.push('Password must be at least 12 characters.');
  if (!/[A-Z]/.test(password || '')) errors.push('Password must include an uppercase letter.');
  if (!/[a-z]/.test(password || '')) errors.push('Password must include a lowercase letter.');
  if (!/[0-9]/.test(password || '')) errors.push('Password must include a number.');
  if (!/[^A-Za-z0-9]/.test(password || '')) errors.push('Password must include a symbol.');
  return { valid: errors.length === 0, errors };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function canManageRole(actorRole, targetRole) {
  return !(['ADMIN', 'SUPER_ADMIN'].includes(targetRole) && actorRole !== 'SUPER_ADMIN');
}

module.exports = { validatePasswordStrength, normalizeEmail, isValidEmail, isValidIsoDate, canManageRole };
