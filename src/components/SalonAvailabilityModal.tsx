import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Clock, Users, Phone, User } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import CustomTimePicker from './CustomTimePicker';

interface SalonAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SALONLAR = [
  { id: 'avlu', name: 'Avlu Salon', masaSayisi: 50 },
  { id: 'sehrekustu', name: 'Şehreküstü Salon', masaSayisi: 50 },
  { id: 'eblehan-vip', name: 'Eblehan VIP Salon', masaSayisi: 1 },
  { id: 'galaalti-vip', name: 'Galaaltı VIP Salon', masaSayisi: 1 },
  { id: 'yazicik', name: 'Yazıcık Salon', masaSayisi: 50 }
];

interface TableReservation {
  fullName: string;
  phone: string;
  time: string;
  guests: number;
  childCount?: number;
}

interface TableStatus {
  [key: string]: {
    [key: string]: {
      isReserved: boolean;
      reservation?: TableReservation;
    };
  };
}

const SalonAvailabilityModal: React.FC<SalonAvailabilityModalProps> = ({
  isOpen,
  onClose
}) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('22:00');
  const [loading, setLoading] = useState(false);
  const [tableStatus, setTableStatus] = useState<TableStatus>({});
  const [selectedTable, setSelectedTable] = useState<{
    salon: string;
    masa: string;
    reservation?: TableReservation;
  } | null>(null);

  useEffect(() => {
    if (isOpen && date) {
      fetchTableStatus();
    }
  }, [isOpen, date, startTime, endTime]);

  const isTimeInRange = (reservationTime: string) => {
    return reservationTime >= startTime && reservationTime <= endTime;
  };

  const fetchTableStatus = async () => {
    try {
      setLoading(true);
      const reservationsRef = collection(db, 'reservations');
      const q = query(
        reservationsRef,
        where('date', '==', date),
        where('status', '==', 'aktif')
      );
      
      const querySnapshot = await getDocs(q);
      const newTableStatus: TableStatus = {};

      // Initialize all tables as available
      SALONLAR.forEach(salon => {
        newTableStatus[salon.name] = {};
        for (let i = 1; i <= salon.masaSayisi; i++) {
          newTableStatus[salon.name][`Masa ${i}`] = { isReserved: false };
        }
      });

      // Mark reserved tables
      querySnapshot.forEach(doc => {
        const reservation = doc.data();
        if (reservation.salon && reservation.masa && isTimeInRange(reservation.time)) {
          newTableStatus[reservation.salon][reservation.masa] = {
            isReserved: true,
            reservation: {
              fullName: reservation.fullName,
              phone: reservation.phone,
              time: reservation.time,
              guests: reservation.guests,
              childCount: reservation.childCount
            }
          };
        }
      });

      setTableStatus(newTableStatus);
    } catch (error) {
      console.error('Masa durumu yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (salon: string, masa: string) => {
    const status = tableStatus[salon]?.[masa];
    if (status?.isReserved) {
      setSelectedTable({
        salon,
        masa,
        reservation: status.reservation
      });
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium">
                    Salon Doluluk Durumu
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarih
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlangıç Saati
                    </label>
                    <CustomTimePicker
                      value={startTime}
                      onChange={setStartTime}
                      minTime="06:00"
                      maxTime="22:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bitiş Saati
                    </label>
                    <CustomTimePicker
                      value={endTime}
                      onChange={setEndTime}
                      minTime="06:00"
                      maxTime="22:00"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">Yükleniyor...</div>
                ) : (
                  <div className="space-y-6">
                    {SALONLAR.map((salon) => (
                      <div key={salon.id} className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">{salon.name}</h3>
                        <div className={`grid ${salon.masaSayisi === 1 ? 'grid-cols-1' : 'grid-cols-10'} gap-2`}>
                          {Array.from({ length: salon.masaSayisi }, (_, i) => {
                            const masaNo = `Masa ${i + 1}`;
                            const status = tableStatus[salon.name]?.[masaNo];
                            return (
                              <button
                                key={masaNo}
                                onClick={() => handleTableClick(salon.name, masaNo)}
                                className={`p-2 rounded-lg text-center transition-colors ${
                                  status?.isReserved
                                    ? 'bg-red-100 border-2 border-red-200 hover:bg-red-200'
                                    : 'bg-green-100 border-2 border-green-200'
                                } ${status?.isReserved ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                <div className="text-sm font-medium">
                                  {i + 1}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded mr-2"></div>
                        <span className="text-sm text-gray-600">Müsait</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded mr-2"></div>
                        <span className="text-sm text-gray-600">Dolu</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table Details Popup */}
                {selectedTable && selectedTable.reservation && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {selectedTable.salon} - {selectedTable.masa}
                        </h3>
                        <button
                          onClick={() => setSelectedTable(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-700">
                          <User className="w-5 h-5 mr-3" />
                          <span>{selectedTable.reservation.fullName}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-5 h-5 mr-3" />
                          <span>{selectedTable.reservation.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-3" />
                          <span>{selectedTable.reservation.time}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Users className="w-5 h-5 mr-3" />
                          <span>
                            {selectedTable.reservation.guests} Yetişkin
                            {selectedTable.reservation.childCount ? ` + ${selectedTable.reservation.childCount} Çocuk` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SalonAvailabilityModal;