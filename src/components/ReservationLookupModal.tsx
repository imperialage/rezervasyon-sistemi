import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

interface ReservationLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReservationLookupModal: React.FC<ReservationLookupModalProps> = ({
  isOpen,
  onClose
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode) {
      toast.error('Lütfen rezervasyon kodunu giriniz');
      return;
    }

    try {
      setLoading(true);
      console.log('Rezervasyon sorgulanıyor:', trimmedCode);
      
      const reservationsRef = collection(db, 'reservations');
      const q = query(reservationsRef, where('code', '==', trimmedCode));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('Rezervasyon bulunamadı');
        toast.error('Rezervasyon bulunamadı. Lütfen kodu kontrol ediniz.');
        return;
      }

      const docData = querySnapshot.docs[0].data();
      console.log('Bulunan rezervasyon:', docData);

      if (docData.status === 'iptal') {
        toast.error('Bu rezervasyon iptal edilmiş');
        return;
      }

      // Önce modalı kapat
      onClose();
      
      // Sonra yönlendirme yap
      setTimeout(() => {
        navigate(`/rezervasyon/${trimmedCode}`);
      }, 100);

    } catch (error: any) {
      console.error('Rezervasyon sorgulama hatası:', error);
      toast.error('Rezervasyon sorgulanırken bir hata oluştu');
    } finally {
      setLoading(false);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium">
                    Rezervasyon Sorgula
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rezervasyon Kodu
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Örn: ABC123"
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {loading ? 'Sorgulanıyor...' : 'Sorgula'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReservationLookupModal;