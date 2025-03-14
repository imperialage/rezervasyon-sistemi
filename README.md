# Kebaphan Rezervasyon Sistemi

Online rezervasyon yönetim sistemi.

## Özellikler

- Online rezervasyon oluşturma
- Rezervasyon sorgulama ve düzenleme
- SMS ile bilgilendirme
- Admin paneli
- Çevrimdışı çalışma desteği
- Responsive tasarım

## Teknolojiler

- React + TypeScript
- Firebase (Authentication, Firestore)
- Tailwind CSS
- Vite
- PWA desteği

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/kullaniciadi/proje-adi.git
cd proje-adi
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Environment dosyasını oluşturun:
`.env` dosyası oluşturup aşağıdaki değişkenleri ekleyin:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Production build alın:
```bash
npm run build
```

## Firebase Yapılandırması

1. Firebase Console'dan yeni bir proje oluşturun
2. Authentication ve Firestore'u etkinleştirin
3. Firebase hosting'i yapılandırın
4. Firestore güvenlik kurallarını deploy edin

## Deployment

```bash
# Firebase CLI'ı yükleyin
npm install -g firebase-tools

# Firebase'e giriş yapın
firebase login

# Projeyi initialize edin
firebase init

# Deploy edin
firebase deploy
```

## Güvenlik

- Tüm API anahtarları environment değişkenlerinde saklanmalıdır
- .env dosyası asla GitHub'a eklenmemelidir
- Firebase güvenlik kuralları dikkatle yapılandırılmalıdır

## Lisans

MIT

## İletişim

Proje sorumlusu: [Ad Soyad](mailto:email@example.com)