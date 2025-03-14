import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLE_PERMISSIONS } from '../types';
import { 
  Users, 
  CalendarRange, 
  CalendarPlus,
  Home,
  ShieldCheck
} from 'lucide-react';
import UserProfilePopup from './UserProfilePopup';
import UserSettingsModal from './UserSettingsModal';

const Navbar = () => {
  const { currentUser } = useAuth();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-semibold text-gray-800">
            <Home className="w-6 h-6" />
            <span></span>
          </Link>
          
          <div className="flex items-center space-x-6">
            {currentUser ? (
              <>
                <Link 
                  to="/rezervasyonlar" 
                  className="flex flex-col items-center text-gray-600 hover:text-gray-800"
                  title="Rezervasyonlar"
                >
                  <CalendarRange className="w-6 h-6" />
                  <span className="text-xs mt-1">Rezervasyonlar</span>
                </Link>
                <Link
                  to="/rezervasyon"
                  className="flex flex-col items-center text-gray-600 hover:text-gray-800"
                  title="Yeni Rezervasyon"
                >
                  <CalendarPlus className="w-6 h-6" />
                  <span className="text-xs mt-1">Yeni</span>
                </Link>
                {currentUser?.role && USER_ROLE_PERMISSIONS[currentUser.role].canManageUsers && (
                  <Link
                    to="/kullanici-yonetimi"
                    className="flex flex-col items-center text-gray-600 hover:text-gray-800"
                    title="Yöneticiler"
                  >
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-xs mt-1">Yöneticiler</span>
                  </Link>
                )}
                <UserProfilePopup onSettingsClick={() => setIsSettingsModalOpen(true)} />
              </>
            ) : (
              <Link 
                to="/giris" 
                className="flex flex-col items-center text-gray-600 hover:text-gray-800"
                title="Giriş Yap"
              >
                <Users className="w-6 h-6" />
                <span className="text-xs mt-1">Giriş</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;