export const formatPhoneToE164 = (phone: string): string => {
  if (!phone) return '';
  
  // Tüm boşlukları ve özel karakterleri kaldır
  let cleaned = phone.replace(/\s+/g, '').replace(/[-()+]/g, '');
  
  // Eğer +90 ile başlamıyorsa ekle
  if (!cleaned.startsWith('+90')) {
    // Eğer 90 ile başlıyorsa
    if (cleaned.startsWith('90')) {
      cleaned = '+' + cleaned;
    } 
    // Eğer 0 ile başlıyorsa
    else if (cleaned.startsWith('0')) {
      cleaned = '+90' + cleaned.substring(1);
    }
    // Hiçbiri değilse
    else {
      cleaned = '+90' + cleaned;
    }
  }
  
  return cleaned;
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const formatted = formatPhoneToE164(phone);
  return /^\+90[1-9][0-9]{9}$/.test(formatted);
};