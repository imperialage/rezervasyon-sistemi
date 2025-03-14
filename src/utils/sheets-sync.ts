import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Reservation } from '../types';
import { format } from 'date-fns';

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_GOOGLE_SHEETS_ID;
const SHEET_NAME = 'Rezervasyonlar';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Initialize Google Sheets API
const auth = new GoogleAuth({
  scopes: SCOPES,
  keyFile: 'path/to/your/credentials.json', // You'll need to provide this file
});

const sheets = google.sheets({ version: 'v4', auth });

// Headers for the spreadsheet
const HEADERS = [
  'Rezervasyon Kodu',
  'Müşteri Adı',
  'Telefon',
  'Tarih',
  'Saat',
  'Yetişkin Sayısı',
  'Çocuk Sayısı',
  'Toplam Misafir',
  'Salon',
  'Masa',
  'Durum',
  'Notlar',
  'Oluşturulma Tarihi',
  'Son Güncelleme',
  'Güncelleyen',
];

// Format reservation data for sheets
const formatReservationForSheets = (reservation: Reservation): string[] => {
  return [
    reservation.code,
    reservation.fullName,
    reservation.phone,
    reservation.date,
    reservation.time,
    reservation.guests.toString(),
    (reservation.childCount || 0).toString(),
    (reservation.guests + (reservation.childCount || 0)).toString(),
    reservation.salon || '',
    reservation.masa || '',
    reservation.status,
    reservation.notes || '',
    format(new Date(reservation.createdAt), 'dd.MM.yyyy HH:mm:ss'),
    format(new Date(reservation.updatedAt), 'dd.MM.yyyy HH:mm:ss'),
    reservation.updatedBy || '',
  ];
};

// Update Google Sheets
const updateSheet = async (reservations: Reservation[]) => {
  try {
    // Clear existing content
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:O`,
    });

    // Prepare data with headers
    const values = [
      HEADERS,
      ...reservations.map(formatReservationForSheets),
    ];

    // Update sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log('Google Sheets güncellendi:', new Date().toLocaleString());
  } catch (error) {
    console.error('Google Sheets güncelleme hatası:', error);
  }
};

// Start listening to Firestore changes
export const startSheetsSync = () => {
  const reservationsRef = collection(db, 'reservations');
  
  return onSnapshot(reservationsRef, (snapshot) => {
    const reservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Reservation[];

    // Sort reservations by date and time
    reservations.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    updateSheet(reservations);
  }, (error) => {
    console.error('Firestore dinleme hatası:', error);
  });
};

// Initialize sync on import
if (SPREADSHEET_ID) {
  startSheetsSync();
  console.log('Google Sheets senkronizasyonu başlatıldı');
} else {
  console.warn('VITE_GOOGLE_SHEETS_ID bulunamadı. Senkronizasyon devre dışı.');
}