import { format } from 'date-fns';
import { formatPhoneToE164 } from './phone-utils';

export const cleanReservationData = (data: any) => {
  // Temel veriyi hazırla
  const cleanData = {
    fullName: data.fullName || '',
    phone: formatPhoneToE164(data.phone) || '',
    date: data.date ? format(new Date(data.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    time: data.time || '19:00',
    guests: parseInt(data.guests) || 0,
    childCount: data.childCount ? parseInt(data.childCount) : 0,
    notes: data.notes || '',
    code: data.code ? data.code.toUpperCase() : '',
    status: data.status || 'aktif',
    salon: data.salon || '',
    masa: data.masa || '',
    updatedAt: new Date().toISOString()
  };

  // Undefined değerleri temizle
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === undefined) {
      delete cleanData[key];
    }
  });

  return cleanData;
};