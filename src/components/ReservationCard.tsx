import React, { useState } from 'react';
import { Reservation, USER_ROLE_PERMISSIONS } from '../types';
import { formatDate, formatTime } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  FileText, 
  Baby, 
  UserPlus, 
  History, 
  User,
  Edit,
  LayoutGrid,
  Ban,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import ReservationHistoryModal from './ReservationHistoryModal';

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange?: (status: 'aktif' | 'iptal') => void;
  onEdit?: (reservation: Reservation) => void;
  onTableSelect?: (reservation: Reservation) => void;
  showActions?: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onStatusChange,
  onEdit,
  onTableSelect,
  showActions = false,
}) => {
  const { currentUser } = useAuth();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const canEditReservation = currentUser && USER_ROLE_PERMISSIONS[currentUser.role].canEditReservations;

  const getTotalGuests = () => {
    return reservation.guests + (reservation.childCount || 0);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${
      reservation.status === 'iptal' ? 'bg-red-50' : 'bg-green-50'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <User className={`w-5 h-5 mr-2 ${
              reservation.status === 'iptal' ? 'text-red-600' : 'text-green-600'
            }`} />
            <span className={`text-lg font-bold ${
              reservation.status === 'iptal' ? 'text-red-600' : 'text-green-600'
            }`}>
              {reservation.fullName}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-5 h-5 mr-2" />
            <span>{reservation.phone}</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Users className="w-5 h-5" />
              <span className="ml-1">{reservation.guests}</span>
            </div>
            {reservation.childCount > 0 && (
              <div className="flex items-center">
                <Baby className="w-5 h-5" />
                <span className="ml-1">{reservation.childCount}</span>
              </div>
            )}
            <div className="flex items-center">
              <UserPlus className="w-5 h-5" />
              <span className="ml-1">{getTotalGuests()}</span>
            </div>
          </div>
          {reservation.notes && (
            <div className="flex items-start text-gray-600">
              <FileText className="w-5 h-5 mr-2 mt-1" />
              <span className="text-sm italic">{reservation.notes}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
            reservation.status === 'aktif'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {reservation.status === 'aktif' ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
                Aktif
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1.5 text-red-600" />
                İptal
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(reservation.date)} - {reservation.time}
          </div>
          {reservation.salon && reservation.masa && (
            <div className="text-lg font-bold text-purple-700">
              {reservation.salon} - {reservation.masa}
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Geçmiş"
              >
                <History size={20} />
              </button>
              {onEdit && canEditReservation && (
                <button
                  onClick={() => onEdit(reservation)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Düzenle"
                >
                  <Edit size={20} />
                </button>
              )}
              {onTableSelect && canEditReservation && (
                <button
                  onClick={() => onTableSelect(reservation)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                  title="Masa Seç"
                >
                  <LayoutGrid size={20} />
                </button>
              )}
              {onStatusChange && canEditReservation && (
                <button
                  onClick={() => onStatusChange(reservation.status === 'aktif' ? 'iptal' : 'aktif')}
                  className={`flex items-center px-3 py-1.5 rounded-lg transition-colors ${
                    reservation.status === 'aktif'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={reservation.status === 'aktif' ? 'İptal Et' : 'Aktif Et'}
                >
                  {reservation.status === 'aktif' ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      İptal Et
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Aktif Et
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ReservationHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={reservation.history}
      />
    </div>
  );
};

export default ReservationCard;