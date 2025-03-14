import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export const formatDate = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMMM yyyy', { locale: tr });
};

export const formatTime = (time: string) => {
  return time.padStart(5, '0');
};

export const generateReservationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Array.from({ length: 3 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `${timestamp.slice(-3)}${random}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  try {
    return isValidPhoneNumber(phone);
  } catch (error) {
    return false;
  }
};

export const formatPhoneNumber = (phone: string): string => {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber) {
      return phoneNumber.format('INTERNATIONAL');
    }
    return phone;
  } catch (error) {
    return phone;
  }
};