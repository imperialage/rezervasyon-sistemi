import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Reservation } from '../types';

interface NetGsmConfig {
  usercode: string;
  password: string;
  msgheader: string;
}

const config: NetGsmConfig = {
  usercode: import.meta.env.VITE_NETGSM_USERCODE || '',
  password: import.meta.env.VITE_NETGSM_PASSWORD || '',
  msgheader: import.meta.env.VITE_NETGSM_MSGHEADER || ''
};

const BASE_URL = 'https://api.netgsm.com.tr/sms/send/get/';
const RESTAURANT_PHONE = '03423228888';
const BASE_RESERVATION_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5174';

export const errorCodes: { [key: string]: string } = {
  '00': 'Mesaj gönderildi',
  '01': 'Mesaj gönderildi fakat karakter sorunu var. Düzeltilip gönderildi',
  '02': 'Kullanıcı adı veya şifre hatalı',
  // ... diğer hata kodları
};

const formatReservationDateTime = (date: string, time: string): string => {
  const dateObj = new Date(date);
  return `${format(dateObj, 'dd.MM.yyyy', { locale: tr })} saat ${time}`;
};

const formatGuestCount = (guests: number, childCount?: number): string => {
  let text = `${guests} yetişkin`;
  if (childCount && childCount > 0) {
    text += ` ${childCount} çocuk`;
  }
  return text;
};

export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      usercode: config.usercode,
      password: config.password,
      msgheader: config.msgheader,
      gsmno: phoneNumber.replace(/[^0-9]/g, ''),
      message: message,
      dil: 'TR'
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    const result = await response.text();
    const code = result.trim();

    if (code === '00' || code === '01') {
      console.log('SMS başarıyla gönderildi');
      return true;
    } else {
      console.error('SMS gönderim hatası:', errorCodes[code] || 'Bilinmeyen hata');
      return false;
    }
  } catch (error) {
    console.error('SMS gönderim hatası:', error);
    return false;
  }
}

export async function sendScheduledSMS(phoneNumber: string, message: string, date: string, time: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      usercode: config.usercode,
      password: config.password,
      msgheader: config.msgheader,
      gsmno: phoneNumber.replace(/[^0-9]/g, ''),
      message: message,
      startdate: format(new Date(date), 'dd/MM/yyyy'),
      starttime: time,
      dil: 'TR'
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    const result = await response.text();
    const code = result.trim();

    if (code === '00' || code === '01') {
      console.log('İleri tarihli SMS başarıyla planlandı');
      return true;
    } else {
      console.error('İleri tarihli SMS planlama hatası:', errorCodes[code] || 'Bilinmeyen hata');
      return false;
    }
  } catch (error) {
    console.error('İleri tarihli SMS planlama hatası:', error);
    return false;
  }
}

export async function sendReservationConfirmation(reservation: Reservation): Promise<boolean> {
  const dateTimeStr = formatReservationDateTime(reservation.date, reservation.time);
  const guestStr = formatGuestCount(reservation.guests, reservation.childCount);
  const reservationUrl = `${BASE_RESERVATION_URL}/rezervasyon/${reservation.code}`;

  const message = `Rezervasyonunuz ${dateTimeStr} için ${guestStr} bilgileri ile oluşturulmuştur. Düzenleme yapmak ve iptal etmek için bize ${RESTAURANT_PHONE} nolu numaradan ulaşabilirsiniz ya da ${reservationUrl} linkten gerekli düzenlemeleri ve iptal işlemini gerçekleştirebilirsiniz. Şimdiden afiyet olsun.`;

  return await sendSMS(reservation.phone, message);
}

export async function scheduleReservationReminder(reservation: Reservation): Promise<boolean> {
  const dateTimeStr = formatReservationDateTime(reservation.date, reservation.time);
  const guestStr = formatGuestCount(reservation.guests, reservation.childCount);
  const reservationUrl = `${BASE_RESERVATION_URL}/rezervasyon/${reservation.code}`;

  const message = `Oluşturmuş olduğunuz ${dateTimeStr} için ${guestStr} rezervasyonu için sizi bekliyoruz. Programınızda bir değişiklik var mı? Eğer varsa bize ${RESTAURANT_PHONE} nolu numaradan ulaşabilirsiniz ya da ${reservationUrl} linkten gerekli düzenlemeleri ve iptal işlemini gerçekleştirebilirsiniz. Şimdiden afiyet olsun.`;

  // Rezervasyon saatinden 2 saat önce
  const reminderDate = new Date(reservation.date);
  const [hours, minutes] = reservation.time.split(':');
  reminderDate.setHours(parseInt(hours) - 2, parseInt(minutes));

  return await sendScheduledSMS(
    reservation.phone,
    message,
    format(reminderDate, 'yyyy-MM-dd'),
    format(reminderDate, 'HH:mm')
  );
}

export async function scheduleSatisfactionSurvey(reservation: Reservation): Promise<boolean> {
  const surveyUrl = `${BASE_RESERVATION_URL}/degerlendirme/${reservation.code}`;
  
  const message = `Merhaba, bizi tercih ettiğiniz için teşekkür ederiz. Lütfen işletmemiz hakkındaki görüşlerinizi bizimle paylaşın. Geri dönüşünüz bizim için çok kıymetli. ${surveyUrl} linkten bizi değerlendirebilirsiniz.`;

  // Rezervasyon saatinden 3 saat sonra
  const surveyDate = new Date(reservation.date);
  const [hours, minutes] = reservation.time.split(':');
  surveyDate.setHours(parseInt(hours) + 3, parseInt(minutes));

  return await sendScheduledSMS(
    reservation.phone,
    message,
    format(surveyDate, 'yyyy-MM-dd'),
    format(surveyDate, 'HH:mm')
  );
}