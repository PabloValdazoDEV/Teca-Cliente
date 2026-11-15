// Utilidades de contacto compartidas entre listados y fichas.

export const CHANNEL_LABELS = {
  PHONE: "Llamada",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
};

const groupDigits = (digits) => digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();

// "+34 600 123 123" a partir del prefijo y el número guardados.
export const formatPhoneNumber = (phone) => {
  const digits = String(phone?.phoneNumber || "").replace(/\D/g, "");
  if (!digits) return "";
  return `${phone.countryCode || "+34"} ${groupDigits(digits)}`;
};

// La nota que acompañaba al número en el texto original ("600… / MADRE" → "MADRE").
export const phoneNote = (rawValue) =>
  String(rawValue || "")
    .replace(/\+?\d[\d\s().-]*\d/g, " ")
    .replace(/[()[\]{}]/g, " ")
    .replace(/^[\s/\-–:,;.|]+|[\s/\-–:,;.|]+$/g, "")
    .replace(/\s*[/\-–|]\s*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();

// Texto para mostrar: número con prefijo y su nota; si el número no se pudo
// reconocer, el texto tal cual se escribió.
export const phoneText = (phone) => {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) return phone?.rawValue || phone?.label || "";
  const note = phoneNote(phone.rawValue);
  return note ? `${formatted} · ${note}` : formatted;
};

// Enlace tel: a partir del teléfono guardado. Los teléfonos antiguos pueden ser
// texto libre ("madre: 91 123 45 67"), así que se extrae el primer número
// reconocible; si no hay ninguno, no se genera enlace.
export const telHref = (phone) => {
  if (phone?.phoneNumber) {
    const prefix = (phone.countryCode || "+34").replace(/[^\d+]/g, "");
    return `tel:${prefix}${String(phone.phoneNumber).replace(/\D/g, "")}`;
  }
  const match = String(phone?.rawValue || "").match(/\+?\d[\d\s.-]{5,}\d/);
  if (!match) return null;
  const digits = match[0].replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 6 ? `tel:${digits}` : null;
};

export const preferredPhone = (phones = []) =>
  phones.find((phone) => phone.isCommunicationPhone) || phones[0] || null;
