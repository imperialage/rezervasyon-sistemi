import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, Mail, Lock, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User as UserType, UserRole, USER_ROLE_LABELS } from '../types';
import { updateUserPassword } from '../utils/auth';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  currentUserRole?: UserRole;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserRole = 'reader'
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const getAvailableRoles = (): UserRole[] => {
    switch (currentUserRole) {
      case 'superadmin':
        return ['superadmin', 'admin', 'editor', 'reader'];
      case 'admin':
        return ['admin', 'editor', 'reader'];
      default:
        return ['reader'];
    }
  };

  const canUpdateUserRole = (currentRole: UserRole, targetRole: UserRole): boolean => {
    const roleHierarchy: { [key in UserRole]: number } = {
      'superadmin': 4,
      'admin': 3,
      'editor': 2,
      'reader': 1
    };

    return roleHierarchy[currentRole] >= roleHierarchy[targetRole];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserRole) {
      toast.error('Yetkiniz bulunmuyor');
      return;
    }

    // Check if trying to update a higher role
    if (role !== user.role && !canUpdateUserRole(currentUserRole, user.role)) {
      toast.error('Bu kullanıcının rolünü değiştirme yetkiniz yok');
      return;
    }

    // Validate password if provided
    if (showPasswordFields && (newPassword || confirmPassword)) {
      if (newPassword.length < 6) {
        toast.error('Şifre en az 6 karakter olmalıdır');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Şifreler eşleşmiyor');
        return;
      }
    }

    try {
      setLoading(true);

      const updates: Partial<UserType> = {
        name,
        email,
        role,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email
      };

      // Update user data
      const userRef = doc(db, 'administrators', user.id);
      await updateDoc(userRef, updates);

      // Update password if provided
      if (showPasswordFields && newPassword) {
        // Check if admin is trying to change superadmin password
        if (currentUserRole === 'admin' && user.role === 'superadmin') {
          toast.error('Admin kullanıcılar süper admin şifrelerini değiştiremez');
          return;
        }
        
        await updateUserPassword(user.id, newPassword);
        toast.success('Şifre başarıyla güncellendi');
      }

      toast.success('Kullanıcı başarıyla güncellendi');
      onClose();
      
      // Clear sensitive fields
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
    } catch (error) {
      console.error('User update error:', error);
      toast.error('Kullanıcı güncellenirken bir hata oluştu');
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
                    Kullanıcı Düzenle
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yetki
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {getAvailableRoles().map((role) => (
                          <option key={role} value={role}>
                            {USER_ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(currentUserRole === 'superadmin' || (currentUserRole === 'admin' && user.role !== 'superadmin')) && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-700">
                          Şifre İşlemleri
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowPasswordFields(!showPasswordFields)}
                          className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          <RefreshCw size={16} className="mr-1" />
                          Şifre Sıfırla
                        </button>
                      </div>

                      {showPasswordFields && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Yeni Şifre
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                minLength={6}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Yeni Şifre Tekrar
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                minLength={6}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
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
                      {loading ? 'Güncelleniyor...' : 'Güncelle'}
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

export default EditUserModal;