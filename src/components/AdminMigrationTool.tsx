import React, { useState } from 'react';
import { migrateUsersToAdministrators } from '../utils/migration';
import { toast } from 'react-hot-toast';

const AdminMigrationTool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMigration = async () => {
    if (!confirm('Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await migrateUsersToAdministrators();
      toast.success(`Migrasyon başarılı! ${result.migratedCount} kullanıcı taşındı.`);
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migrasyon sırasında bir hata oluştu!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={handleMigration}
        disabled={isLoading}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400"
      >
        {isLoading ? 'Migrasyon Yapılıyor...' : 'Kullanıcıları Birleştir'}
      </button>
    </div>
  );
};

export default AdminMigrationTool;