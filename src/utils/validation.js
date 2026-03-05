export const COUNTRY_PHONE_CODES = {
  "United States": { code: "+1", minLength: 10, maxLength: 10, format: "10 digits" },
  Canada: { code: "+1", minLength: 10, maxLength: 10, format: "10 digits" },
  "United Kingdom": { code: "+44", minLength: 10, maxLength: 11, format: "10-11 digits" },
  India: { code: "+91", minLength: 10, maxLength: 10, format: "10 digits" },
  Germany: { code: "+49", minLength: 10, maxLength: 13, format: "10-13 digits" },
  France: { code: "+33", minLength: 9, maxLength: 9, format: "9 digits" },
  Spain: { code: "+34", minLength: 9, maxLength: 9, format: "9 digits" },
  Italy: { code: "+39", minLength: 10, maxLength: 10, format: "10 digits" },
  Australia: { code: "+61", minLength: 9, maxLength: 9, format: "9 digits" },
  Japan: { code: "+81", minLength: 10, maxLength: 11, format: "10-11 digits" },
  China: { code: "+86", minLength: 11, maxLength: 11, format: "11 digits" },
  Brazil: { code: "+55", minLength: 11, maxLength: 11, format: "11 digits" },
  Mexico: { code: "+52", minLength: 10, maxLength: 10, format: "10 digits" },
  Netherlands: { code: "+31", minLength: 9, maxLength: 9, format: "9 digits" },
  Singapore: { code: "+65", minLength: 8, maxLength: 8, format: "8 digits" },
  "United Arab Emirates": { code: "+971", minLength: 9, maxLength: 9, format: "9 digits" },
  Thailand: { code: "+66", minLength: 9, maxLength: 9, format: "9 digits" },
  "South Korea": { code: "+82", minLength: 10, maxLength: 11, format: "10-11 digits" },
  Russia: { code: "+7", minLength: 11, maxLength: 11, format: "11 digits" },
  "South Africa": { code: "+27", minLength: 9, maxLength: 9, format: "9 digits" },
};

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.";

export const getPhoneValidationRules = (country = "") => COUNTRY_PHONE_CODES[country] || null;

export const isValidPhoneNumber = (phone = "", country = "") => {
  if (!phone || !country) return false;
  const rules = getPhoneValidationRules(country);
  if (!rules) return false;
  const digitsOnly = phone.replace(/\D/g, "");
  if (!/^\d+$/.test(digitsOnly)) return false;
  return digitsOnly.length >= rules.minLength && digitsOnly.length <= rules.maxLength;
};

export const getPhoneValidationError = (phone = "", country = "") => {
  if (!phone) return "Phone number is required.";
  if (!country) return "Country is required for phone validation.";
  const rules = getPhoneValidationRules(country);
  if (!rules) return `Phone validation not configured for ${country}.`;

  const digitsOnly = phone.replace(/\D/g, "");

  if (!/^\d+$/.test(phone)) {
    return "Phone number must contain digits only.";
  }

  if (digitsOnly.length < rules.minLength) {
    return `Phone number is too short. Expected at least ${rules.minLength} digits.`;
  }
  if (digitsOnly.length > rules.maxLength) {
    return `Phone number is too long. Expected at most ${rules.maxLength} digits.`;
  }

  return null;
};

export const isValidEmail = (email = "") => {
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

export const getEmailValidationError = (email = "") => {
  if (!email) return "Email is required.";
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@")) return 'Email must contain "@" symbol.';

  const parts = trimmed.split("@");
  if (parts.length > 2) return "Email can only contain one @ symbol.";

  const [name, domain] = parts;
  if (!name || name.length === 0) {
    return "Email must have a name before @ (e.g., user@example.com).";
  }
  if (!domain || domain.length === 0) {
    return "Email must have a domain after @ (e.g., user@example.com).";
  }
  if (!domain.includes(".")) {
    return "Email domain must include a dot and extension (e.g., @example.com).";
  }

  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return "Email domain extension must be at least 2 characters (e.g., .com, .org).";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address in format: name@domain.tld";
  }

  return null;
};

export const getPasswordChecks = (password = "") => ({
  minLength: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});

export const getPasswordScore = (password = "") => {
  const checks = getPasswordChecks(password);
  return Object.values(checks).filter(Boolean).length;
};

export const getPasswordLabel = (score) => {
  if (score <= 2) return "Weak";
  if (score === 3 || score === 4) return "Medium";
  return "Strong";
};
