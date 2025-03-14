import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User } from 'lucide-react';
import { createUser } from '../utils/user';
import { createAdministrator } from '../utils/admin';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      
      // Firebase Authentication'da kullanıcı oluştur
      const userCredential = await register(email, password);
      
      // Hem users hem de administrators koleksiyonlarına kaydet
      await Promise.all([
        createUser(email, name),
        createAdministrator(email, name, 'admin')
      ]);
      
      toast.success('Kayıt başarılı');
      navigate('/rezervasyonlar');
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      
      // Daha detaylı hata mesajları
      const errorMessages: { [key: string]: string } = {
        'auth/configuration-not-found': 'Firebase yapılandırması bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.',
        'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda',
        'auth/invalid-email': 'Geçersiz e-posta adresi',
        'auth/operation-not-allowed': 'E-posta/şifre girişi devre dışı',
        'auth/weak-password': 'Şifre çok zayıf'
      };

      const errorMessage = errorMessages[error.code] || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Yönetici Kaydı</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
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
                minLength={2}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
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
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Şifre en az 6 karakter olmalıdır
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;