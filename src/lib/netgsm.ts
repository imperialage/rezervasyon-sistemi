const API_URL = {
  get: 'https://api.netgsm.com.tr/sms/send/get/',
  post: 'https://api.netgsm.com.tr/sms/send/xml'
};

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

console.log('Netgsm Konfigürasyon:', {
  usercode: config.usercode,
  password: config.password ? '****' : 'BOŞ!',
  msgheader: config.msgheader
});

// Telefon numarasını formatla
const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
};

// XML formatında SMS gönderimi
const sendSMSWithXML = async (phoneNumber: string, message: string): Promise<{success: boolean; error?: string}> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company>Netgsm</company>
    <usercode>${config.usercode}</usercode>
    <password>${config.password}</password>
    <startdate></startdate>
    <stopdate></stopdate>
    <type>1:n</type>
    <msgheader>${config.msgheader}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
    <no>${formattedPhone}</no>
  </body>
</mainbody>`;

    console.log('XML İstek:', xmlData);

    const response = await fetch(API_URL.post, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: xmlData
    });

    const result = await response.text();
    console.log('XML Yanıt:', result);

    // Yanıt kodunu analiz et
    const code = result.trim();
    
    if (code === '00' || code === '01') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: ERROR_CODES[code] || 'Bilinmeyen hata',
        rawResponse: result
      };
    }
  } catch (error) {
    console.error('SMS gönderim hatası:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

// GET metodu ile SMS gönderimi
const sendSMSWithGet = async (phoneNumber: string, message: string): Promise<{success: boolean; error?: string}> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const params = new URLSearchParams({
      usercode: config.usercode,
      password: config.password,
      gsmno: formattedPhone,
      message: message,
      msgheader: config.msgheader,
      dil: 'TR'
    });

    const url = `${API_URL.get}?${params.toString()}`;
    console.log('GET İstek URL:', url);

    const response = await fetch(url);
    const result = await response.text();
    const code = result.trim();

    console.log('GET Yanıt:', {
      code,
      message: ERROR_CODES[code] || 'Bilinmeyen kod',
      rawResponse: result
    });

    if (code === '00' || code === '01') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: ERROR_CODES[code] || 'Bilinmeyen hata',
        rawResponse: result
      };
    }
  } catch (error) {
    console.error('SMS gönderim hatası:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

// Test fonksiyonu - Her iki yöntemi de dene
const testSMS = async (phoneNumber: string): Promise<{success: boolean; error?: string}> => {
  const message = "Bu bir test mesajıdır.";
  
  console.log('GET metodu ile deneniyor...');
  const getResult = await sendSMSWithGet(phoneNumber, message);
  
  if (getResult.success) {
    return getResult;
  }

  console.log('XML metodu ile deneniyor...');
  return await sendSMSWithXML(phoneNumber, message);
};

export const netgsm = {
  sendSMSWithGet,
  sendSMSWithXML,
  testSMS
};

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

// Telefon numarasını formatla (başında 90 olmadan)
const formatPhoneNumber = (phone: string): string => {
  // Önce tüm boşlukları ve özel karakterleri kaldır
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // Başında 90 varsa kaldır
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2);
  }
  
  return cleaned;
};

// Temel SMS gönderim fonksiyonu
const sendSMS = async (phoneNumber: string, message: string): Promise<{success: boolean; error?: string}> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const params = new URLSearchParams({
      usercode: config.usercode,
      password: config.password,
      gsmno: formattedPhone,
      message: message,
      msgheader: config.msgheader,
      dil: 'TR'
    });

    const url = `${API_URL}?${params.toString()}`;
    console.log('SMS İstek URL:', url);

    const response = await fetch(url);
    const result = await response.text();
    const code = result.trim();

    console.log('SMS Gönderim Sonucu:', {
      code,
      message: ERROR_CODES[code] || 'Bilinmeyen kod',
      rawResponse: result
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
    console.error('SMS gönderim hatası:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

// Test fonksiyonu
const testSMS = async (phoneNumber: string): Promise<{success: boolean; error?: string}> => {
  return sendSMS(phoneNumber, "Bu bir test mesajıdır.");
};

export const netgsm = {
  sendSMS,
  testSMS
};