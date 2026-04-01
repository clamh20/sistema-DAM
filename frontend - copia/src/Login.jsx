import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import axios from 'axios';

export default function Login({ setAuth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/v1/auth/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                setAuth(true);
                navigate('/');
            }
        } catch (error) {
            // For testing purposes during UI dev, we can let any login pass if backend is down
            console.error(error);
            alert('Credenciales inválidas o Backend no conectado');
        }
    };

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100" style={{ background: 'linear-gradient(to right, #00446A 0%, #00719E 100%)' }}>
            <Card className="w-full md:w-4 shadow-8 border-round-2xl">
                <div className="text-center mb-5">
                    <img src="/logo.jpg" alt="Logo DAM" style={{ height: '70px', objectFit: 'contain' }} className="mb-3" />
                    <div className="text-900 text-3xl font-bold mb-2">Sistema DAM</div>
                    <span className="text-500 font-medium line-height-3">Acceso Administrativo al Sistema</span>
                </div>

                <form onSubmit={handleLogin} className="flex flex-column gap-3">
                    <div>
                        <label htmlFor="email" className="block text-900 font-medium mb-2">Correo Electrónico</label>
                        <InputText id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-inputtext-lg" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-900 font-medium mb-2">Contraseña</label>
                        <Password inputId="password" value={password} onChange={(e) => setPassword(e.target.value)} toggleMask className="w-full" inputClassName="w-full p-inputtext-lg" required feedback={false} />
                    </div>

                    <Button label="Ingresar al Panel" icon="pi pi-arrow-right" className="w-full mt-4 p-3 text-lg border-round-3xl shadow-4" type="submit" />
                </form>
            </Card>
        </div>
    );
}
