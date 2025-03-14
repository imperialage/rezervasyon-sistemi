import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, History } from 'lucide-react';
import { ReservationHistory } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ReservationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history?: ReservationHistory[];
}

const getFieldLabel = (field: string): string => {
  const labels: { [key: string]: string } = {
    fullName: 'Ad Soyad',
    phone: 'Telefon',
    date: 'Tarih',
    time: 'Saat',
    guests: 'Yetişkin Sayısı',
    childCount: 'Çocuk Sayısı',
    notes: 'Notlar',
    status: 'Durum',
    salon: 'Salon',
    masa: 'Masa',
  };
  return labels[field] || field;
};

const formatValue = (field: string, value: any): string => {
  if (field === 'date') {
    return format(new Date(value), 'dd MMMM yyyy', { locale: tr });
  }
  if (field === 'status') {
    return value === 'aktif' ? 'Aktif' : 'İptal';
  }
  return value?.toString() || '-';
};

const getChangeDescription = (field: string, oldValue: any, newValue: any): string => {
  switch (field) {
    case 'time':
      return `Saat ${oldValue} iken ${newValue} olarak güncellendi`;
    case 'date':
      return `Tarih ${format(new Date(oldValue), 'dd MMMM yyyy', { locale: tr })} iken ${format(new Date(newValue), 'dd MMMM yyyy', { locale: tr })} olarak güncellendi`;
    case 'guests':
      return `Yetişkin sayısı ${oldValue} iken ${newValue} olarak güncellendi`;
    case 'childCount':
      return `Çocuk sayısı ${oldValue || 0} iken ${newValue || 0} olarak güncellendi`;
    case 'status':
      return `Durum ${oldValue === 'aktif' ? 'Aktif' : 'İptal'} iken ${newValue === 'aktif' ? 'Aktif' : 'İptal'} olarak güncellendi`;
    case 'salon':
    case 'masa':
      if (!oldValue && newValue) return `${getFieldLabel(field)} ${newValue} olarak atandı`;
      if (oldValue && !newValue) return `${getFieldLabel(field)} kaldırıldı`;
      return `${getFieldLabel(field)} ${oldValue} iken ${newValue} olarak güncellendi`;
    default:
      return `${getFieldLabel(field)} güncellendi`;
  }
};

const ReservationHistoryModal: React.FC<ReservationHistoryModalProps> = ({
  isOpen,
  onClose,
  history = []
}) => {
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Rezervasyon Geçmişi
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {history.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Henüz değişiklik geçmişi bulunmuyor
                    </p>
                  ) : (
                    history.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            {format(new Date(entry.timestamp), 'dd MMMM yyyy HH:mm', { locale: tr })}
                          </span>
                          <span className="text-sm text-blue-600">
                            {entry.updatedBy}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {entry.changes.map((change, changeIndex) => (
                            <div key={changeIndex} className="text-sm">
                              {getChangeDescription(change.field, change.oldValue, change.newValue)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReservationHistoryModal;