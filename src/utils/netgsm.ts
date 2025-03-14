import { ERROR_CODES } from './constants';

// API endpoint'leri
const API_ENDPOINTS = {
  send: '/api/sms/send/get',
  sendXml: '/api/sms/send/xml'
};

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

// Konfigürasyon kontrolü
const validateConfig = () => {
  if (!config.usercode || !config.password || !config.msgheader) {
    throw new Error('Netgsm konfigürasyonu eksik. Lütfen .env dosyasını kontrol edin.');
  }
};

// Telefon numarasını formatla
const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
};

// GET metodu ile SMS gönderimi
const sendSMS = async (phoneNumber: string, message: string): Promise<{success: boolean; error?: string}> => {
  try {
    validateConfig();
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // URL parametreleri
    const params = new URLSearchParams({
      usercode: config.usercode,
      password: config.password,
      gsmno: formattedPhone,
      message: message,
      msgheader: config.msgheader,
      dil: 'TR'
    });

    // Debug bilgileri
    console.log('SMS Parametreleri:', {
      usercode: config.usercode,
      password: '****',
      gsmno: formattedPhone,
      msgheader: config.msgheader
    });

    // API isteği
    const response = await fetch(`${API_ENDPOINTS.send}?${params.toString()}`);
    const result = await response.text();
    const code = result.trim();

    console.log('API Yanıtı:', {
      statusCode: response.status,
      resultCode: code,
      message: ERROR_CODES[code] || 'Bilinmeyen kod'
    });

    return {
      success: code === '00' || code === '01',
      error: code !== '00' && code !== '01' ? ERROR_CODES[code] || 'Bilinmeyen hata' : undefined
    };
  } catch (error) {
    console.error('SMS Gönderim Hatası:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

// Test fonksiyonu
const testSMS = async (phoneNumber: string): Promise<{success: boolean; error?: string}> => {
  try {
    validateConfig();
    console.log('Netgsm Test Başlıyor:', {
      usercode: config.usercode,
      msgheader: config.msgheader
    });

    return await sendSMS(phoneNumber, "Bu bir test mesajıdır.");
  } catch (error) {
    console.error('Test Hatası:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

export const netgsm = {
  sendSMS,
  testSMS
};

// POST metodu ile SMS gönderimi
const sendSMSWithPost = async (phoneNumber: string, message: string): Promise<{success: boolean; error?: string}> => {
  try {
    validateConfig();
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <usercode>${config.usercode}</usercode>
    <password>${config.password}</password>
    <msgheader>${config.msgheader}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
    <no>${formattedPhone}</no>
  </body>
</mainbody>`;

    console.log('POST İsteği XML:', xmlData.replace(config.password, '****'));

    const response = await fetch(API_URL.post, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: xmlData
    });

    const result = await response.text();
    const code = result.trim();

    console.log('POST API Yanıtı:', {
      statusCode: response.status,
      statusText: response.statusText,
      resultCode: code,
      resultMessage: ERROR_CODES[code] || 'Bilinmeyen kod',
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
    console.error('POST SMS gönderim hatası:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

// Test fonksiyonu - Her iki yöntemi de dene
const testSMS = async (phoneNumber: string): Promise<{success: boolean; error?: string}> => {
  try {
    validateConfig();
    console.log('Netgsm Konfigürasyon:', {
      usercode: config.usercode,
      password: '****',
      msgheader: config.msgheader
    });

    // Önce GET metodu ile dene
    console.log('GET metodu deneniyor...');
    const getResult = await sendSMS(phoneNumber, "Bu bir test mesajıdır.");
    
    if (getResult.success) {
      return getResult;
    }

    // GET başarısız olursa POST metodu ile dene
    console.log('POST metodu deneniyor...');
    return await sendSMSWithPost(phoneNumber, "Bu bir test mesajıdır.");
  } catch (error) {
    console.error('Test hatası:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

export const netgsm = {
  sendSMS,
  sendSMSWithPost,
  testSMS
};