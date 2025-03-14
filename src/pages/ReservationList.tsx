import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Edit, 
  LayoutGrid, 
  Phone, 
  User, 
  Users, 
  Hash, 
  FileText, 
  History, 
  Baby, 
  UserPlus, 
  LayoutDashboard, 
  List,
  CalendarDays,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Reservation, ReservationHistory } from '../types';
import EditReservationModal from '../components/EditReservationModal';
import TableSelectionModal from '../components/TableSelectionModal';
import SalonAvailabilityModal from '../components/SalonAvailabilityModal';
import ReservationCard from '../components/ReservationCard';

type FilterState = 'all' | 'active' | 'cancelled';

const generateHistoryId = () => {
  return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const ReservationList = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filterState, setFilterState] = useState<FilterState>('active');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isSalonStatusModalOpen, setIsSalonStatusModalOpen] = useState(false);
  const [currentReservationForTable, setCurrentReservationForTable] = useState<Reservation | null>(null);
  const { currentUser } = useAuth();

  const fetchReservations = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'reservations')));
      const reservationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      setReservations(reservationData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      toast.error('Rezervasyonlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
  };

  const handleStatusChange = async (reservation: Reservation, newStatus: 'aktif' | 'iptal') => {
    try {
      const historyEntry: ReservationHistory = {
        id: generateHistoryId(),
        timestamp: new Date().toISOString(),
        updatedBy: currentUser?.email || 'unknown',
        changes: [{
          field: 'status',
          oldValue: reservation.status,
          newValue: newStatus
        }]
      };

      const existingHistory = reservation.history || [];

      await updateDoc(doc(db, 'reservations', reservation.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email,
        updateType: 'durum',
        history: [...existingHistory, historyEntry]
      });
      
      toast.success('Rezervasyon durumu güncellendi');
      fetchReservations();
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  const handleTableSelection = (reservation: Reservation) => {
    setCurrentReservationForTable(reservation);
    setIsTableModalOpen(true);
  };

  const handleTableAssignment = async (tableInfo: { salon: string; masa: string }) => {
    if (!currentReservationForTable) return;

    try {
      const historyEntry: ReservationHistory = {
        id: generateHistoryId(),
        timestamp: new Date().toISOString(),
        updatedBy: currentUser?.email || 'unknown',
        changes: [
          {
            field: 'salon',
            oldValue: currentReservationForTable.salon || '',
            newValue: tableInfo.salon
          },
          {
            field: 'masa',
            oldValue: currentReservationForTable.masa || '',
            newValue: tableInfo.masa
          }
        ]
      };

      const existingHistory = currentReservationForTable.history || [];

      await updateDoc(doc(db, 'reservations', currentReservationForTable.id), {
        salon: tableInfo.salon,
        masa: tableInfo.masa,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email,
        updateType: 'masa',
        history: [...existingHistory, historyEntry]
      });
      
      toast.success('Masa ataması başarıyla yapıldı');
      fetchReservations();
    } catch (error) {
      toast.error('Masa ataması yapılırken bir hata oluştu');
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsEditModalOpen(true);
  };

  const handleSaveReservation = async (updatedData: Partial<Reservation>) => {
    if (!selectedReservation) return;

    try {
      const changes = Object.entries(updatedData).map(([field, value]) => ({
        field,
        oldValue: selectedReservation[field as keyof Reservation],
        newValue: value
      })).filter(change => change.oldValue !== change.newValue);

      if (changes.length > 0) {
        const historyEntry: ReservationHistory = {
          id: generateHistoryId(),
          timestamp: new Date().toISOString(),
          updatedBy: currentUser?.email || 'unknown',
          changes
        };

        const existingHistory = selectedReservation.history || [];

        await updateDoc(doc(db, 'reservations', selectedReservation.id), {
          ...updatedData,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.email,
          updateType: 'bilgi',
          history: [...existingHistory, historyEntry]
        });
      }
      
      toast.success('Rezervasyon başarıyla güncellendi');
      fetchReservations();
    } catch (error) {
      toast.error('Rezervasyon güncellenirken bir hata oluştu');
    }
  };

  const formatReservationDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  const formatUpdateDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  const getUpdateTypeText = (type?: string) => {
    switch (type) {
      case 'bilgi':
        return 'Rezervasyon bilgilerini güncelledi';
      case 'masa':
        return 'Masa ataması yaptı';
      case 'durum':
        return 'Durumu değiştirdi';
      default:
        return 'Güncelleme yaptı';
    }
  };

  const getTotalGuests = (reservation: Reservation) => {
    return reservation.guests + (reservation.childCount || 0);
  };

  const getReservationStats = () => {
    const stats = {
      totalAdults: 0,
      totalChildren: 0,
      totalGuests: 0
    };

    filteredReservations.forEach(reservation => {
      if (reservation.status === 'aktif') {
        stats.totalAdults += reservation.guests;
        stats.totalChildren += reservation.childCount || 0;
        stats.totalGuests += getTotalGuests(reservation);
      }
    });

    return stats;
  };

  const toggleFilterState = () => {
    const states: FilterState[] = ['active', 'cancelled', 'all'];
    const currentIndex = states.indexOf(filterState);
    const nextIndex = (currentIndex + 1) % states.length;
    setFilterState(states[nextIndex]);
  };

  const getFilterButtonStyle = () => {
    switch (filterState) {
      case 'active':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'cancelled':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'all':
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const getFilterButtonText = () => {
    switch (filterState) {
      case 'active':
        return 'Aktif';
      case 'cancelled':
        return 'İptal';
      case 'all':
        return 'Tümü';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.fullName.toLowerCase().includes(search.toLowerCase()) ||
      reservation.code.toLowerCase().includes(search.toLowerCase()) ||
      reservation.phone.includes(search);
    
    const matchesDate = !dateFilter || reservation.date === dateFilter;
    
    const matchesStatus = filterState === 'all' ? true :
      filterState === 'active' ? reservation.status === 'aktif' :
      reservation.status === 'iptal';

    return matchesSearch && matchesDate && matchesStatus;
  });

  const stats = getReservationStats();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <button
              onClick={() => setIsSalonStatusModalOpen(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Building2 size={20} className="mr-2" />
              Salonlar
            </button>
          </div>
          <div>
            <button
              onClick={toggleFilterState}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${getFilterButtonStyle()}`}
            >
              <List size={20} className="mr-2" />
              {getFilterButtonText()}
            </button>
          </div>
          <div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            >
              <RefreshCw size={20} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Yetişkin</div>
            <div className="text-2xl font-bold text-blue-700">{stats.totalAdults}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Çocuk</div>
            <div className="text-2xl font-bold text-green-700">{stats.totalChildren}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Toplam Misafir</div>
            <div className="text-2xl font-bold text-purple-700">{stats.totalGuests}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Yükleniyor...</div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Rezervasyon bulunamadı</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onStatusChange={(status) => handleStatusChange(reservation, status)}
              onEdit={() => handleEdit(reservation)}
              onTableSelect={() => handleTableSelection(reservation)}
              showActions={true}
            />
          ))}
        </div>
      )}

      <EditReservationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        reservation={selectedReservation}
        onSave={handleSaveReservation}
        onCancel={async (reservation) => {
          await handleStatusChange(reservation, 'iptal');
          setIsEditModalOpen(false);
        }}
      />

      <TableSelectionModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onSelect={handleTableAssignment}
        reservationDate={currentReservationForTable?.date}
        reservationTime={currentReservationForTable?.time}
      />

      <SalonAvailabilityModal
        isOpen={isSalonStatusModalOpen}
        onClose={() => setIsSalonStatusModalOpen(false)}
      />
    </div>
  );
};

export default ReservationList;