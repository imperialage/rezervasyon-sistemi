import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Reservation } from '../types';

export const useReservations = (filters?: {
  date?: string;
  status?: 'aktif' | 'iptal';
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = query(collection(db, 'reservations'));

    if (filters?.date) {
      q = query(q, where('date', '==', filters.date));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Reservation[];
        setReservations(data);
        setLoading(false);
      },
      (err) => {
        setError('Rezervasyonlar yüklenirken bir hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters?.date, filters?.status]);

  return { reservations, loading, error };
};