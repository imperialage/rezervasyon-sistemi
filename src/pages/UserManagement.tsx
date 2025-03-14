import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, UserRole, USER_ROLE_LABELS, USER_ROLE_PERMISSIONS } from '../types';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  UserPlus, 
  Mail, 
  Calendar,
  Settings,
  UserCog,
  Ban,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';

import AdminMigrationTool from '../components/AdminMigrationTool';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role)) {
      toast.error('Bu sayfaya erişim yetkiniz bulunmuyor');
      window.location.href = '/';
      return;
    }

    const q = query(collection(db, 'administrators'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setUsers(userData);
      setLoading(false);
    }, (error) => {
      console.error('Kullanıcı listesi alınamadı:', error);
      toast.error('Kullanıcılar yüklenirken bir hata oluştu');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (user: User) => {
    if (!currentUser?.role || !canManageUser(currentUser.role, user.role)) {
      toast.error('Bu işlem için yetkiniz bulunmuyor');
      return;
    }

    try {
      const newStatus = !user.isActive;
      await updateDoc(doc(db, 'users', user.id), {
        isActive: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.email
      });
      
      toast.success(`Kullanıcı durumu ${newStatus ? 'aktif' : 'pasif'} olarak güncellendi`);
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  const canManageUser = (currentUserRole: UserRole, targetUserRole: UserRole): boolean => {
    if (currentUserRole === 'superadmin') return true;
    if (currentUserRole === 'admin') {
      return ['editor', 'reader'].includes(targetUserRole);
    }
    return false;
  };

  const handleDeleteUser = async (user: User) => {
    if (currentUser?.role !== 'superadmin') {
      toast.error('Sadece süper adminler kullanıcı silebilir');
      return;
    }

    if (user.id === currentUser.uid) {
      toast.error('Kendi hesabınızı silemezsiniz');
      return;
    }

    if (!window.confirm(`${user.name} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'administrators', user.id));
      
      toast.success('Kullanıcı başarıyla silindi');
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      toast.error('Kullanıcı silinirken bir hata oluştu');
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        {currentUser?.role && USER_ROLE_PERMISSIONS[currentUser.role].canManageUsers && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Yeni Kullanıcı
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-white rounded-lg shadow-md p-6 ${
              !user.isActive ? 'opacity-75' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="w-4 h-4 mr-1" />
                    {user.email}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <UserCog className="w-4 h-4 mr-2" />
                <span className="font-medium">{USER_ROLE_LABELS[user.role]}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>

            {currentUser?.role && USER_ROLE_PERMISSIONS[currentUser.role].canManageUsers && (
              <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
                <button
                  onClick={() => handleEditClick(user)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Düzenle"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleStatusChange(user)}
                  className={`p-2 rounded-lg transition-colors ${
                    user.isActive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={user.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                >
                  {user.isActive ? (
                    <Ban size={20} />
                  ) : (
                    <CheckCircle size={20} />
                  )}
                </button>
                {currentUser?.role === 'superadmin' && user.id !== currentUser.uid && (
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Kullanıcıyı Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {currentUser?.role === 'superadmin' && <AdminMigrationTool />}

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUserRole={currentUser?.role}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          currentUserRole={currentUser?.role}
        />
      )}
    </div>
  );
};

export default UserManagement;