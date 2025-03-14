import { format, addHours, subHours } from 'date-fns';
import { tr } from 'date-fns/locale';
import { smsService } from '../services/sms.service';
import { Reservation, SMSMessage } from '../types';

const RESTAURANT_PHONE = '03423228888';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5174';

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

export const sendReservationConfirmation = async (reservation: Reservation): Promise<boolean> => {
  const dateTimeStr = formatReservationDateTime(reservation.date, reservation.time);
  const guestStr = formatGuestCount(reservation.guests, reservation.childCount);
  const reservationUrl = `${BASE_URL}/rezervasyon/${reservation.code}`;

  const message: SMSMessage = {
    phoneNumber: reservation.phone,
    message: `Rezervasyonunuz ${dateTimeStr} için ${guestStr} bilgileri ile oluşturulmuştur. Düzenleme yapmak ve iptal etmek için bize ${RESTAURANT_PHONE} nolu numaradan ulaşabilirsiniz ya da ${reservationUrl} linkten gerekli düzenlemeleri ve iptal işlemini gerçekleştirebilirsiniz. Şimdiden afiyet olsun.`
  };

  const result = await smsService.sendSMS(message);
  return result.success;
};

export const scheduleReservationReminder = async (reservation: Reservation): Promise<boolean> => {
  const dateTimeStr = formatReservationDateTime(reservation.date, reservation.time);
  const guestStr = formatGuestCount(reservation.guests, reservation.childCount);
  const reservationUrl = `${BASE_URL}/rezervasyon/${reservation.code}`;

  // Rezervasyon saatinden 2 saat önce
  const reminderDate = new Date(reservation.date);
  const [hours, minutes] = reservation.time.split(':');
  reminderDate.setHours(parseInt(hours), parseInt(minutes));
  const reminderTime = subHours(reminderDate, 2);

  const message: SMSMessage = {
    phoneNumber: reservation.phone,
    message: `Oluşturmuş olduğunuz ${dateTimeStr} için ${guestStr} rezervasyonu için sizi bekliyoruz. Programınızda bir değişiklik var mı? Eğer varsa bize ${RESTAURANT_PHONE} nolu numaradan ulaşabilirsiniz ya da ${reservationUrl} linkten gerekli düzenlemeleri ve iptal işlemini gerçekleştirebilirsiniz. Şimdiden afiyet olsun.`,
    startDate: format(reminderTime, 'dd/MM/yyyy'),
    startTime: format(reminderTime, 'HH:mm')
  };

  const result = await smsService.sendScheduledSMS(message);
  return result.success;
};

export const scheduleSatisfactionSurvey = async (reservation: Reservation): Promise<boolean> => {
  const surveyUrl = `${BASE_URL}/degerlendirme/${reservation.code}`;

  // Rezervasyon saatinden 3 saat sonra
  const reservationDate = new Date(reservation.date);
  const [hours, minutes] = reservation.time.split(':');
  reservationDate.setHours(parseInt(hours), parseInt(minutes));
  const surveyTime = addHours(reservationDate, 3);

  const message: SMSMessage = {
    phoneNumber: reservation.phone,
    message: `Merhaba, bizi tercih ettiğiniz için teşekkür ederiz. Lütfen işletmemiz hakkındaki görüşlerinizi bizimle paylaşın. Geri dönüşünüz bizim için çok kıymetli. ${surveyUrl} linkten bizi değerlendirebilirsiniz.`,
    startDate: format(surveyTime, 'dd/MM/yyyy'),
    startTime: format(surveyTime, 'HH:mm')
  };

  const result = await smsService.sendScheduledSMS(message);
  return result.success;
};