import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Users, Search, Star, MapPin, Phone } from 'lucide-react';
import ReservationLookupModal from '../components/ReservationLookupModal';

const Home = () => {
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://static.ticimax.cloud/32401//uploads/editoruploads/kusleme_kebaphan.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
           
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            
          </p>
          <div className="flex gap-4">
            <Link
              to="/rezervasyon"
              className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Rezervasyon Yap
            </Link>
            <button
              onClick={() => setIsLookupModalOpen(true)}
              className="bg-white text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
            >
              <Search className="mr-2" size={24} />
              Rezervasyon Sorgula
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <CalendarDays className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Kolay Rezervasyon</h3>
              <p className="text-gray-600">
                Online rezervasyon sistemi ile dilediğiniz gün ve saatte masanızı ayırtın
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Clock className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Kahvaltı, Öğle ve Akşam Yemekleri  </h3>
              <p className="text-gray-600">
                Her gün 06:00 - 22:00 arası hizmetinizdeyiz
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Özel Salonlar</h3>
              <p className="text-gray-600">
                Farklı kapasitelerde 5 ayrı salon seçeneği
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Gaziantep'in Lezzet Durağı</h2>
              <p className="text-gray-600 mb-6">
                1987 yılında Gaziantep'in kalbinde kurulan Küşleme Kebaphan, geleneksel Antep mutfağının en seçkin lezzetlerini sunmaya devam ediyor. Küşleme kebabı başta olmak üzere, tüm kebap çeşitlerimiz ustaların elinden özenle hazırlanıyor.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  <span>35 yılı aşkın tecrübe</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-red-600 mr-2" />
                  <a 
                    href="https://g.co/kgs/S2e6Ghq" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Konum için tıklayın
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-green-600 mr-2" />
                  <span>0342 322 88 88</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://static.ticimax.cloud/32401//uploads/bankalogo/kebaplar.jpg"
                alt="Kebap"
                className="rounded-lg shadow-lg"
              />
              <img
                src=""
                alt="Restaurant"
                className="rounded-lg shadow-lg mt-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Salonlar Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Salonlarımız</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src="https://static.ticimax.cloud/32401/Uploads/Slider/-16.jpg?t=20191016180206"
                alt="Avlu Salon"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Avlu Salon</h3>
                <p className="text-gray-600">Tarihi avluda unutulmaz bir yemek deneyimi</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src="https://static.ticimax.cloud/32401//uploads/editoruploads/hakkimizda/hakkimizda4.jpg"
                alt="VIP Salon"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">VIP Salonlar</h3>
                <p className="text-gray-600">Özel davetleriniz için lüks VIP salonlar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReservationLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
      />
    </div>
  );
};

export default Home;