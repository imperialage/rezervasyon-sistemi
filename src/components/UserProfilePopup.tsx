import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfilePopupProps {
  onSettingsClick: () => void;
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ onSettingsClick }) => {
  const { currentUser, logout } = useAuth();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex flex-col items-center text-gray-600 hover:text-gray-800">
        <User className="w-6 h-6" />
        <span className="text-xs mt-1 max-w-[100px] truncate">
          {currentUser?.name || currentUser?.email}
        </span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-900 font-medium truncate">
              {currentUser?.name || 'Kullanıcı'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {currentUser?.email}
            </p>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSettingsClick}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Ayarlar
                </button>
              )}
            </Menu.Item>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserProfilePopup;