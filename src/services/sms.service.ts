// SMS hata kodları
const ERROR_CODES: { [key: string]: string } = {
  '00': 'Mesaj gönderildi',
  '01': 'Mesaj gönderildi fakat karakter sorunu var',
  '02': 'Kullanıcı adı veya şifre hatalı',
  '03': 'Mesaj başlığı sistemde tanımlı değil',
  '04': 'Parametre hatası',
  '05': 'Sistem hatası',
  '06': 'Sistem hatası',
  '07': 'Bu IP\'den istek yapılamaz',
  '08': 'Mesaj metni boş',
  '09': 'Mesaj numarası hatalı',
  '10': 'Sistem hatası',
  '11': 'Sistem hatası',
  '12': 'Gönderim zamanı hatası',
  '13': 'Sistem hatası',
  '14': 'Sistem hatası',
  '15': 'Sistem hatası',
  '16': 'Sistem hatası',
  '17': 'Mesaj gönderim sayısı limitiniz yetersiz',
  '18': 'Bazı numaralar hatalı',
  '19': 'Sistem hatası',
  '20': 'Aynı mesajı 1 dakika içinde tekrar göndermek istiyorsunuz',
  '21': 'Sistem hatası',
  '22': 'Sistem hatası',
  '23': 'Sistem hatası',
  '24': 'Sistem hatası',
  '25': 'Sistem hatası',
  '26': 'Sistem hatası',
  '27': 'Sistem hatası',
  '28': 'Sistem hatası',
  '29': 'Sistem hatası',
  '30': 'Hesap aktivasyonu sağlanmamış',
  '31': 'Sistem hatası',
  '32': 'Sistem hatası',
  '33': 'Sistem hatası',
  '34': 'Sistem hatası',
  '35': 'Sistem hatası',
  '36': 'Sistem hatası',
  '37': 'Sistem hatası',
  '38': 'Sistem hatası',
  '39': 'Sistem hatası',
  '40': 'Sistem hatası',
  '41': 'Sistem hatası',
  '42': 'Sistem hatası',
  '43': 'Sistem hatası',
  '44': 'Sistem hatası',
  '45': 'Sistem hatası',
  '46': 'Sistem hatası',
  '47': 'Sistem hatası',
  '48': 'Sistem hatası',
  '49': 'Sistem hatası',
  '50': 'Sistem hatası',
  '51': 'Sistem hatası',
  '70': 'Hatalı veya eksik parametre',
  '80': 'Sistem hatası',
  '85': 'Sistem hatası',
  '90': 'Sistem hatası',
  '100': 'Sistem hatası'
};

class SMSService {
  constructor() {
    this.sendSMS = this.sendSMS.bind(this);
    this.testSMS = this.testSMS.bind(this);
  }

  private config = {
    usercode: '8503463878',
    password: '3$25D2B',
    msgheader: 'KEBAPHAN'
  };

  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('90')) {
      cleaned = cleaned.substring(2);
    }
    return cleaned;
  }

  private validateConfig() {
    if (!this.config.usercode || !this.config.password || !this.config.msgheader) {
      throw new Error('SMS yapılandırması eksik');
    }
  }

  async sendSMS(phoneNumber: string, message: string) {
    try {
      this.validateConfig();
      
      console.log('SMS Gönderimi Başlatılıyor:');
      console.log('- Telefon:', phoneNumber);
      console.log('- Mesaj:', message);
      console.log('- Yapılandırma:', {
        usercode: this.config.usercode,
        msgheader: this.config.msgheader
      });
      
      const params = new URLSearchParams({
        usercode: this.config.usercode,
        password: this.config.password,
        gsmno: this.formatPhoneNumber(phoneNumber),
        message: message,
        msgheader: this.config.msgheader,
        dil: 'TR'
      });

      const url = 'https://api.netgsm.com.tr/sms/send/get?' + params.toString();
      console.log('- API URL:', url);

      const response = await fetch(url);
      console.log('- API Yanıtı Status:', response.status);

      const result = await response.text();
      console.log('- API Yanıt Metni:', result);

      // Yanıtı parçalara ayır (00 54072008 formatında geliyor)
      const [code, messageId] = result.trim().split(' ');

      const responseData = {
        success: code === '00' || code === '01',
        code,
        messageId: messageId || undefined,
        message: ERROR_CODES[code] || 'Bilinmeyen hata'
      };

      console.log('- İşlem Sonucu:', responseData);
      if (responseData.success) {
        console.log('✅ SMS başarıyla gönderildi');
        console.log('- Mesaj ID:', responseData.messageId);
      } else {
        console.error('❌ SMS gönderimi başarısız');
        console.error('- Hata Kodu:', responseData.code);
        console.error('- Hata Mesajı:', responseData.message);
      }

      return responseData;

    } catch (error) {
      console.error('SMS Gönderim Hatası:', error);
      return {
        success: false,
        code: 'ERROR',
        message: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  async testSMS(phoneNumber: string) {
    return this.sendSMS(phoneNumber, 'Bu bir test mesajıdır.');
  }
}

export const smsService = new SMSService();