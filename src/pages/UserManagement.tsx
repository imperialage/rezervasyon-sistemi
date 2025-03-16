import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const setAdminPermissions = async () => {
    try {
      const functions = getFunctions();
      const setAdminCustomClaims = httpsCallable(functions, 'setAdminCustomClaims');
      
      const result = await setAdminCustomClaims();
      console.log('Admin yetkileri başarıyla ayarlandı:', result.data);
      
      // Kullanıcının yeniden giriş yapmasını sağlayalım
      const auth = getAuth();
      await auth.signOut();
      alert('Yetkiler güncellendi. Lütfen tekrar giriş yapın.');
    } catch (error) {
      console.error('Yetki ayarlama hatası:', error);
      alert('Yetki ayarlama sırasında bir hata oluştu.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h1>
      
      <button 
        onClick={setAdminPermissions}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        Yönetici Yetkilerini Güncelle
      </button>

      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">İsim</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Rol</th>
              <th className="py-3 px-6 text-left">Durum</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map((user: any) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{user.fullName}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">{user.role}</td>
                <td className="py-3 px-6 text-left">
                  {user.isActive ? (
                    <span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">Aktif</span>
                  ) : (
                    <span className="bg-red-200 text-red-600 py-1 px-3 rounded-full text-xs">Pasif</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;