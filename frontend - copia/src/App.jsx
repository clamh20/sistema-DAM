import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { useState } from 'react';
import Login from './Login';
import UsersList from './UsersList';
import EventsList from './EventsList';
import FormalizationsList from './FormalizationsList';
import Dashboard from './Dashboard';

function MainLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
  };

  const toggleTheme = () => {
      const newTheme = isDarkTheme ? 'lara-light-indigo' : 'lara-dark-indigo';
      const link = document.getElementById('theme-link');
      if (link) {
          link.href = `https://unpkg.com/primereact/resources/themes/${newTheme}/theme.css`;
      }
      setIsDarkTheme(!isDarkTheme);
  };

  const endMenu = (
      <div className="flex align-items-center gap-3">
          <i className={`pi ${isDarkTheme ? 'pi-sun text-yellow-500' : 'pi-moon text-white'} text-xl cursor-pointer hover:text-white transition-colors transition-duration-300`} onClick={toggleTheme} title="Cambiar Tema"></i>
          <span className="font-bold text-white mr-3">DAM ({userRole})</span>
          <i className="pi pi-sign-out text-xl text-white cursor-pointer hover:text-red-500" onClick={handleLogout} title="Cerrar sesión"></i>
      </div>
  );

  const startMenu = (
       <div className="flex align-items-center">
            <img src="/logo.jpg" alt="Logo DAM" style={{ height: '40px' }} className="mr-3 ml-2 border-round shadow-1" />
       </div>
  );

  const items = [
      { label: 'Sistema DAM', icon: 'pi pi-fw pi-wallet', className: 'font-bold mr-4', command: () => navigate('/') },
      { label: 'Inicio', icon: 'pi pi-fw pi-home', command: () => navigate('/') },
      { label: 'Usuarios', icon: 'pi pi-fw pi-users', command: () => navigate('/users'), visible: userRole === 'SUPER_ADMIN' },
      { label: 'Eventos', icon: 'pi pi-fw pi-calendar', command: () => navigate('/events') },
      { label: 'Formalizaciones', icon: 'pi pi-fw pi-file', command: () => navigate('/formalizations') }
  ];

  if (!isAuthenticated) {
      return (
         <Routes>
           <Route path="*" element={<Login setAuth={setIsAuthenticated} />} />
         </Routes>
      );
  }

  return (
        <div>
           <Menubar model={items} start={startMenu} end={endMenu} className="mb-4 shadow-2 border-none" />
           <div className="px-5 py-2">
             <Routes>
               <Route path="/" element={
                 <>
                   <h2 className="text-3xl font-semibold mb-4 text-800">Inicio</h2>
                   <Dashboard />
                 </>
               } />
               <Route path="/users" element={<UsersList />} />
               <Route path="/events" element={<EventsList />} />
               <Route path="/formalizations" element={<FormalizationsList />} />
               <Route path="*" element={<Navigate to="/" />} />
             </Routes>
           </div>
        </div>
  );
}

function App() {
  return (
    <PrimeReactProvider>
      <Router>
         <MainLayout />
      </Router>
    </PrimeReactProvider>
  )
}

export default App;
