import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, LayoutGrid } from 'lucide-react';
import { checkTableAvailability } from '../utils/reservation';
import { toast } from 'react-hot-toast';

interface TableSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tableInfo: { salon: string; masa: string }) => void;
  reservationDate?: string;
  reservationTime?: string;
}

const SALONLAR = [
  { id: 'avlu', name: 'Avlu Salon', masaSayisi: 50 },
  { id: 'sehrekustu', name: 'Şehreküstü Salon', masaSayisi: 50 },
  { id: 'eblehan-vip', name: 'Eblehan VIP Salon', masaSayisi: 1 },
  { id: 'galaalti-vip', name: 'Galaaltı VIP Salon', masaSayisi: 1 },
  { id: 'yazicik', name: 'Yazıcık Salon', masaSayisi: 50 }
];

const TableSelectionModal: React.FC<TableSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  reservationDate,
  reservationTime
}) => {
  const [selectedSalon, setSelectedSalon] = useState('');
  const [selectedMasa, setSelectedMasa] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSalon || !selectedMasa || !reservationDate || !reservationTime) {
      return;
    }

    try {
      setLoading(true);
      const availability = await checkTableAvailability(
        selectedSalon,
        `Masa ${selectedMasa}`,
        reservationDate,
        reservationTime
      );

      if (!availability.available) {
        toast.error(availability.message);
        return;
      }

      onSelect({ salon: selectedSalon, masa: `Masa ${selectedMasa}` });
      onClose();
      setSelectedSalon('');
      setSelectedMasa('');
    } catch (error) {
      toast.error('Masa seçimi yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getMasaListesi = (masaSayisi: number) => {
    return Array.from({ length: masaSayisi }, (_, i) => (i + 1).toString());
  };

  const selectedSalonInfo = SALONLAR.find(salon => salon.name === selectedSalon);

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
                  <Dialog.Title className="text-lg font-medium flex items-center">
                    <LayoutGrid className="mr-2" size={24} />
                    Masa Seçimi
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salon Seçimi
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {SALONLAR.map((salon) => (
                      <button
                        key={salon.id}
                        onClick={() => {
                          setSelectedSalon(salon.name);
                          setSelectedMasa('');
                        }}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          selectedSalon === salon.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="font-medium">{salon.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedSalon && selectedSalonInfo && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Masa Seçimi - {selectedSalon}
                    </label>
                    <div className={`grid ${selectedSalonInfo.masaSayisi === 1 ? 'grid-cols-1' : 'grid-cols-10'} gap-2`}>
                      {getMasaListesi(selectedSalonInfo.masaSayisi).map((masa) => (
                        <button
                          key={masa}
                          onClick={() => setSelectedMasa(masa)}
                          className={`p-2 rounded-lg border-2 text-sm transition-colors ${
                            selectedMasa === masa
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          {masa}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedSalon || !selectedMasa}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? 'Kontrol ediliyor...' : 'Masa Seç'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TableSelectionModal;