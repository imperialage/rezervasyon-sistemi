import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { addMinutes, parse, isWithinInterval, format } from 'date-fns';

const VIP_TABLES = {
  'Eblehan VIP Salon': ['Masa 1'],
  'Galaaltı VIP Salon': ['Masa 1']
};

const MORNING_HOURS = ['12:00', '13:00', '14:00', '15:00', '16:00'];
const EVENING_HOURS = ['17:00', '18:00', '19:00', '20:00'];
const REGULAR_RESERVATION_DURATION = 120; // minutes

const parseDateTime = (date: string, time: string) => {
  const dateTimeStr = `${date} ${time}`;
  return parse(dateTimeStr, 'yyyy-MM-dd HH:mm', new Date());
};

const isVIPTable = (salon: string, masa: string): boolean => {
  return VIP_TABLES[salon]?.includes(masa) || false;
};

export const checkTableAvailability = async (
  salon: string,
  masa: string,
  date: string,
  time: string
): Promise<{ available: boolean; message?: string }> => {
  if (isVIPTable(salon, masa)) {
    return checkVIPTableAvailability(salon, masa, date, time);
  }
  return checkRegularTableAvailability(salon, masa, date, time);
};

const checkVIPTableAvailability = async (
  salon: string,
  masa: string,
  date: string,
  time: string
): Promise<{ available: boolean; message?: string }> => {
  const isEveningReservation = EVENING_HOURS.includes(time);

  try {
    const reservationsRef = collection(db, 'reservations');
    const q = query(
      reservationsRef,
      where('salon', '==', salon),
      where('masa', '==', masa),
      where('date', '==', date),
      where('status', '==', 'aktif')
    );

    const querySnapshot = await getDocs(q);
    const existingReservations = querySnapshot.docs.map(doc => doc.data());

    const hasExistingEvening = existingReservations.some(res => 
      EVENING_HOURS.includes(res.time)
    );
    const hasExistingMorning = existingReservations.some(res => 
      MORNING_HOURS.includes(res.time)
    );

    if (isEveningReservation && hasExistingEvening) {
      return {
        available: false,
        message: `${salon} - ${masa} için seçilen tarihte akşam rezervasyonu dolu (17:00-20:00)`
      };
    }

    if (!isEveningReservation && hasExistingMorning) {
      return {
        available: false,
        message: `${salon} - ${masa} için seçilen tarihte öğlen rezervasyonu dolu (12:00-16:00)`
      };
    }

    return { available: true };
  } catch (error) {
    console.error('Masa müsaitlik kontrolü hatası:', error);
    return {
      available: false,
      message: 'Masa müsaitliği kontrol edilirken bir hata oluştu'
    };
  }
};

const checkRegularTableAvailability = async (
  salon: string,
  masa: string,
  date: string,
  time: string
): Promise<{ available: boolean; message?: string }> => {
  try {
    const reservationsRef = collection(db, 'reservations');
    const q = query(
      reservationsRef,
      where('salon', '==', salon),
      where('masa', '==', masa),
      where('date', '==', date),
      where('status', '==', 'aktif')
    );

    const querySnapshot = await getDocs(q);
    const existingReservations = querySnapshot.docs.map(doc => doc.data());

    const requestedStart = parseDateTime(date, time);
    const requestedEnd = addMinutes(requestedStart, REGULAR_RESERVATION_DURATION);

    // Check for time slot conflicts
    for (const reservation of existingReservations) {
      const reservationStart = parseDateTime(reservation.date, reservation.time);
      const reservationEnd = addMinutes(reservationStart, REGULAR_RESERVATION_DURATION);

      if (
        isWithinInterval(requestedStart, { start: reservationStart, end: reservationEnd }) ||
        isWithinInterval(requestedEnd, { start: reservationStart, end: reservationEnd }) ||
        isWithinInterval(reservationStart, { start: requestedStart, end: requestedEnd })
      ) {
        const nextAvailableTime = format(addMinutes(reservationEnd, 1), 'HH:mm');
        return {
          available: false,
          message: `${salon} - ${masa} için seçilen saatte rezervasyon bulunmaktadır. Bir sonraki müsait saat: ${nextAvailableTime}`
        };
      }
    }

    return { available: true };
  } catch (error) {
    console.error('Regular masa müsaitlik kontrolü hatası:', error);
    return {
      available: false,
      message: 'Masa müsaitliği kontrol edilirken bir hata oluştu'
    };
  }
};

export const calculateEndTime = (date: string, time: string, salon: string, masa: string): string => {
  const startTime = parseDateTime(date, time);
  
  if (isVIPTable(salon, masa)) {
    const isEvening = EVENING_HOURS.includes(time);
    if (isEvening) {
      return '20:00'; // Akşam dilimi sonu
    } else {
      return '16:00'; // Öğlen dilimi sonu
    }
  } else {
    const endTime = addMinutes(startTime, REGULAR_RESERVATION_DURATION);
    return format(endTime, 'HH:mm');
  }
};

export const getNextAvailableTime = async (
  salon: string,
  masa: string,
  date: string,
  time: string
): Promise<string> => {
  const reservationsRef = collection(db, 'reservations');
  const q = query(
    reservationsRef,
    where('salon', '==', salon),
    where('masa', '==', masa),
    where('date', '==', date),
    where('status', '==', 'aktif')
  );

  try {
    const querySnapshot = await getDocs(q);
    const existingReservations = querySnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => a.time.localeCompare(b.time));

    if (existingReservations.length === 0) {
      return time;
    }

    const requestedDateTime = parseDateTime(date, time);
    let nextTime = requestedDateTime;

    for (const reservation of existingReservations) {
      const reservationStart = parseDateTime(date, reservation.time);
      const reservationEnd = addMinutes(reservationStart, REGULAR_RESERVATION_DURATION);

      if (nextTime >= reservationStart && nextTime <= reservationEnd) {
        nextTime = addMinutes(reservationEnd, 1);
      }
    }

    return format(nextTime, 'HH:mm');
  } catch (error) {
    console.error('Müsait saat hesaplama hatası:', error);
    return time;
  }
};