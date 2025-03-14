import React from 'react';
import { BrowserRouter, Routes, Route, createRoutesFromElements } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReservationList from './pages/ReservationList';
import ReservationForm from './pages/ReservationForm';
import UserManagement from './pages/UserManagement';
import { AuthProvider } from './contexts/AuthContext';

const routes = createRoutesFromElements(
  <Route path="/" element={<Home />}>
    <Route path="giris" element={<Login />} />
    <Route path="kayit" element={<Register />} />
    <Route path="rezervasyonlar" element={<ReservationList />} />
    <Route path="rezervasyon" element={<ReservationForm />} />
    <Route path="rezervasyon/:code" element={<ReservationForm />} />
    <Route path="kullanici-yonetimi" element={<UserManagement />} />
  </Route>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/giris" element={<Login />} />
              <Route path="/kayit" element={<Register />} />
              <Route path="/rezervasyonlar" element={<ReservationList />} />
              <Route path="/rezervasyon" element={<ReservationForm />} />
              <Route path="/rezervasyon/:code" element={<ReservationForm />} />
              <Route path="/kullanici-yonetimi" element={<UserManagement />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;