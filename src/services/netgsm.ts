import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface NetGsmConfig {
  usercode: string;
  password: string;
  msgheader: string;
}

const config: NetGsmConfig = {
  usercode: import.meta.env.VITE_NETGSM_USERCODE,
  password: import.meta.env.VITE_NETGSM_PASSWORD,
  msgheader: import.meta.env.VITE_NETGSM_MSGHEADER
};

const API_URL = 'https://api.netgsm.com.tr/sms/send/get/';

// Hata kodları ve açıklamaları
const ERROR_CODES: { [key: string]: string } = {
  '00': 'Mesaj gönderildi',
  '01': 'Mesaj gönderildi fakat karakter sorunu var',
  '02': 'Kullanıcı adı veya şifre hatalı',
  '03': 'Mesaj başlığı sistemde tanımlı değil',
  '04': 'Parametreler eksik veya hatalı',
  '05': 'Gönderilecek telefon numarası yok',
  '06': 'Gönderilecek mesaj yok',
  '07': 'Tarih formatı hatalı',
  '08': 'Mesaj gönderim tarihinde hata var',
  '09': 'Tekrar eden mesaj',
  '10': 'Hatalı sorgulama',
  '11': 'Üyelik başlamamış veya sona ermiş',
  '12': 'Gönderim zamanı geçmiş',
  '13': 'Api desteklemiyor',
  '14': 'Aynı mesaj paketi tekrar gönderilmiş',
  '15': 'Mükerrer gönderim sınırı aşılmış',
  '16': 'Sistemsel hata',
  '17': 'Mesaj standart maksimum karakter sayısını aşıyor',
  '18': 'Geçersiz IP Adresi',
  '19': 'Gönderici adı sistemde tanımlı değil',
  '20': 'Şehir kodu hatalı',
  '21': 'Geçersiz dil parametresi',
  '22': 'Gönderim tipi desteklenmiyor',
  '23': 'Rezervasyon zamanı geçmiş mesaj',
  '24': 'Mükerrer gönderim sınırı aşılmış',
  '25': 'Kampanya ID hatalı',
  '30': 'Hesap aktivasyonu sağlanmamış',
  '31': 'Geçersiz sms tipi',
  '32': 'Hesap IP güvenlik kontrolünü desteklemiyor',
  '33': 'API IP güvenlik kontrolünü desteklemiyor',
  '34': 'Hesap API erişimine kapalı',
  '35': 'Hesap toplu sms gönderim iznine sahip değil',
  '36': 'Proje tanımlı değil',
  '37': 'Proje aktif değil',
  '38': 'Proje silinmiş',
  '40': 'Mesaj gönderimi için yeterli bakiye yok',
  '41': 'Mesaj paketi kullanım süresi aşılmış',
  '42': 'Mesaj gönderim simülasyonu başarılı',
  '43': 'Kullanıcı adı sistemde tanımlı değil',
  '44': 'Hatalı servis kullanımı',
  '45': 'Kullanıcı pasif',
  '46': 'Kullanıcı silinmiş',
  '47': 'Mesaj başlığı kullanıcıya tanımlı değil',
  '48': 'SMS alımı engellenmiş numara',
  '49': 'Gönderilen numaralardan hatalı olanlar var',
  '50': 'Abonelik iptal edilmiş',
  '51': 'SMS gönderimine kapalı hesap',
  '52': 'Geçersiz dağıtım listesi',
  '53': 'Gönderim zamanı kontrolü başarısız',
  '54': 'Mesaj paketi yetersiz',
  '55': 'Mükerrer gönderim',
  '56': 'Geçersiz görev tekrarı',
  '57': 'Geçersiz görev tekrar sonu',
  '58': 'Geçersiz görev tekrar aralığı',
  '59': 'Geçersiz çalışma zamanı',
  '60': 'Hesap API desteklemiyor',
  '61': 'Geçersiz IP tanımı',
  '62': 'Mesaj gönderim noktası aktif değil'
};
};

// Telefon numarasını formatla (sadece rakamları al)
const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

// Temel SMS gönderim fonksiyonu
const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    const params = new URLSearchParams({
      usercode: config.usercode,
      password: config.password,
      msgheader: config.msgheader,
      gsmno: formatPhoneNumber(phoneNumber),
      message: message,
      dil: 'TR'
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const result = await response.text();
    const code = result.trim();

    if (code === '00' || code === '01') {
      console.log('SMS başarıyla gönderildi');
      return true;
    } else {
      console.error('SMS gönderim hatası:', ERROR_CODES[code] || 'Bilinmeyen hata');
      return false;
    }
  } catch (error) {
    console.error('SMS gönderim hatası:', error);
    return false;
  }
};

// İleri tarihli SMS gönderimi
const sendScheduledSMS = async (
  phoneNumber: string,
  message: string,
  date: string,
  time: string
): Promise<boolean> => {
  try {
    const params = new URLSearchParams({
      usercode: config.usercode,
      password: config.password,
      msgheader: config.msgheader,
      gsmno: formatPhoneNumber(phoneNumber),
      message: message,
      startdate: format(new Date(date), 'dd/MM/yyyy'),
      starttime: time,
      dil: 'TR'
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const result = await response.text();
    const code = result.trim();

    if (code === '00' || code === '01') {
      console.log('İleri tarihli SMS başarıyla planlandı');
      return true;
    } else {
      console.error('İleri tarihli SMS planlama hatası:', ERROR_CODES[code] || 'Bilinmeyen hata');
      return false;
    }
  } catch (error) {
    console.error('İleri tarihli SMS planlama hatası:', error);
    return false;
  }
};

// Rezervasyon onay mesajı gönderimi
const sendReservationConfirmation = async (
  phoneNumber: string,
  date: string,
  time: string,
  adults: number,
  children: number,
  code: string
): Promise<boolean> => {
  const message = `Rezervasyonunuz ${format(new Date(date), 'dd.MM.yyyy', { locale: tr })} saat ${time} için ${adults} yetişkin ${children} çocuk bilgileri ile oluşturulmuştur. Düzenleme yapmak ve iptal etmek için bize 03423228888 nolu numaradan bize ulaşabilirsiniz ya da http://localhost:5174/rezervasyon/${code} linkten gerekli düzenlemeleri ve iptal işlemini gerçekleştirebilirsiniz. Şimdiden afiyet olsun.`;

  return await sendSMS(phoneNumber, message);
};

// Rezervasyon hatırlatma mesajı gönderimi
const sendReservationReminder = async (
  phoneNumber: string,
  date: string,
  time: string,
  adults: number,
  children: number,
  code: string
): Promise<boolean> => {
  const message = `Oluşturmuş olduğunuz ${format(new Date(date), 'dd.MM.yyyy', { locale: tr })} saat ${time} için ${adults} yetişkin ${children} çocuk rezervasyonu için sizi bekliyoruz. Programınızda bir değişiklik var mı? Eğer varsa bize 03423228888 nolu numaradan bize ulaşabilirsiniz ya da http://localhost:5174/rezervasyon/${code} linkten gerekli düzenlemeleri ve iptal işlemini gerçekleştirebilirsiniz. Şimdiden afiyet olsun.`;

  // Rezervasyon saatinden 2 saat önce gönder
  const reminderDate = new Date(date);
  const [hours, minutes] = time.split(':');
  reminderDate.setHours(parseInt(hours) - 2, parseInt(minutes));

  return await sendScheduledSMS(
    phoneNumber,
    message,
    format(reminderDate, 'yyyy-MM-dd'),
    format(reminderDate, 'HH:mm')
  );
};

// Memnuniyet değerlendirme mesajı gönderimi
const sendSatisfactionSurvey = async (
  phoneNumber: string,
  date: string,
  time: string,
  code: string
): Promise<boolean> => {
  const message = `Merhaba bizi tercih ettiğiniz için teşekkür ederiz. Lütfen işletmemiz hakkındaki görüşlerinizi bizimle paylaşın. Geri dönüşünüz bizim için çok kıymetli. http://localhost:5174/degerlendirme/${code} linkten bizi değerlendirin`;

  // Rezervasyon saatinden 3 saat sonra gönder
  const surveyDate = new Date(date);
  const [hours, minutes] = time.split(':');
  surveyDate.setHours(parseInt(hours) + 3, parseInt(minutes));

  return await sendScheduledSMS(
    phoneNumber,
    message,
    format(surveyDate, 'yyyy-MM-dd'),
    format(surveyDate, 'HH:mm')
  );
};

// Test fonksiyonu
const testSMS = async (phoneNumber: string): Promise<{success: boolean; error?: string}> => {
  try {
    const params = new URLSearchParams({
      usercode: config.usercode,
      password: config.password,
      msgheader: config.msgheader,
      gsmno: formatPhoneNumber(phoneNumber),
      message: "Bu bir test mesajıdır.",
      dil: 'TR'
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const result = await response.text();
    const code = result.trim();

    console.log('SMS Test Sonucu:', {
      code,
      message: ERROR_CODES[code] || 'Bilinmeyen kod',
      success: code === '00' || code === '01'
    });

    if (code === '00' || code === '01') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: ERROR_CODES[code] || 'Bilinmeyen hata'
      };
    }
  } catch (error) {
    console.error('SMS test hatası:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

export const netgsm = {
  sendSMS,
  sendScheduledSMS,
  sendReservationConfirmation,
  sendReservationReminder,
  sendSatisfactionSurvey,
  testSMS
};