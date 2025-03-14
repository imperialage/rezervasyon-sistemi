// Firebase Güvenlik Kuralları:

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temel fonksiyonlar
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/administrators/$(request.auth.uid));
    }
    
    // Users koleksiyonu için kurallar
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if false; // Kullanıcı silme işlemi yasak
    }
    
    // Administrators koleksiyonu için kurallar
    match /administrators/{adminId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == adminId;
      allow update: if isAdmin() && request.auth.uid == adminId;
      allow delete: if false; // Admin silme işlemi yasak
    }
    
    // Rezervasyonlar için kurallar
    match /reservations/{reservationId} {
      allow read: if true; // Herkes rezervasyon sorgulayabilir
      allow create: if true; // Herkes rezervasyon oluşturabilir
      allow update: if isAdmin(); // Sadece adminler güncelleyebilir
      allow delete: if false; // Silme işlemi yasak
    }
  }
}
*/