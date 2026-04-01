import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const [summary, setSummary] = useState({ activeEventsCount: 0, newEventsThisMonth: 0, totalFormalizations: 0 });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/v1/dashboard/summary', {
                   headers: { Authorization: `Bearer ${token}` }
                });
                setSummary(response.data);
            } catch (error) {
                console.error("Error trayendo resumen", error);
            }
        };
        fetchSummary();
    }, []);

    return (
        <div className="fadein animation-duration-500">
            <h2 className="text-3xl font-semibold mb-4 text-800">Panel de Inicio General</h2>
            <div className="grid">
                <div className="col-12 md:col-6 lg:col-4">
                    <div className="surface-card shadow-2 p-3 border-1 border-50 border-round cursor-pointer hover:shadow-4 transition-all transition-duration-300">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Eventos Vigentes</span>
                                <div className="text-900 font-medium text-xl">{summary.activeEventsCount} totales</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round hover:bg-blue-200 transition-colors transition-duration-300" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-calendar text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-green-500 font-medium">{summary.newEventsThisMonth} </span>
                        <span className="text-500">registrados en el sistema</span>
                    </div>
                </div>
                <div className="col-12 md:col-6 lg:col-4">
                    <div className="surface-card shadow-2 p-3 border-1 border-50 border-round cursor-pointer hover:shadow-4 transition-all transition-duration-300">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Saldo por Formalizar</span>
                                <div className="text-orange-500 font-bold text-xl">${summary.remainingBalance?.toLocaleString()}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-orange-100 border-round hover:bg-orange-200 transition-colors transition-duration-300" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-wallet text-orange-600 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-500">Valor pendiente de legalización</span>
                    </div>
                </div>
                <div className="col-12 md:col-6 lg:col-4">
                    <div className="surface-card shadow-2 p-3 border-1 border-50 border-round cursor-pointer hover:shadow-4 transition-all transition-duration-300">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Formalizaciones</span>
                                <div className="text-green-600 font-bold text-xl">${summary.totalFormalizations.toLocaleString()}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-cyan-100 border-round hover:bg-cyan-200 transition-colors transition-duration-300" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-dollar text-cyan-600 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-500">Soportes validados financieramente</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
