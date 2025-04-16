function isValidNumber(value) {
  return !isNaN(value) && typeof value === "number" && isFinite(value);
}

function safeNumber(value) {
  let num = parseFloat(value);
  return isValidNumber(num) ? num : null;
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function sanitizeString(str) {
  return str.replace(/[^a-zA-Z0-9 ]/g, "");
}

function stripHTMLTags(str) {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
}

function isValidEmail(email) {
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  let phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
}

function isValidURL(url) {
  let urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([\/\w .-]*)*\/?$/;
  return urlRegex.test(url);
}

function isValidPassword(password) {
  let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // At least 8 characters, 1 letter, 1 number
  return passwordRegex.test(password);
}

function safeSplit(str, delimiter = ",") {
  if (!isValidString(str)) return [];
  return str
    .split(delimiter)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function validateUserInput(inputType, value) {
  switch (inputType) {
    case "number":
      return safeNumber(value);
    case "string":
      return sanitizeString(value);
    case "email":
      return isValidEmail(value) ? value : "Invalid Email";
    case "phone":
      return isValidPhone(value) ? value : "Invalid Phone";
    case "url":
      return isValidURL(value) ? value : "Invalid URL";
    case "password":
      return isValidPassword(value) ? value : "Weak Password";
    default:
      return "Unknown input type";
  }
}
