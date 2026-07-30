export function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  if (!normalizedPhone) return "";
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message.trim())}`;
}
