import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ProgressBar } from 'primereact/progressbar';
import axios from 'axios';

export default function EventsList() {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayDialog, setDisplayDialog] = useState(false);
    
    // Modal State con todos los campos solicitados
    const [newEvent, setNewEvent] = useState({ projectCode: '', city: '', eventDate: null, eventType: '', allocatedBudget: 0, incomeBag: '', coordinator: null, delegationUser: null });

    const userRole = localStorage.getItem('role');

    useEffect(() => { 
        loadEvents(); 
        loadUsers();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await axios.get('/api/v1/events', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setEvents(response.data);
            setLoading(false);
        } catch (error) { 
            console.error("Error cargando tabla:", error);
            alert("Atención: El servidor no pudo enviar la lista de eventos. Revisa la consola para más detalles. Error: " + error.message);
            setLoading(false); 
        }
    };

    const loadUsers = async () => {
        try {
            const res = await axios.get('/api/v1/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setUsers(res.data);
        } catch(e) {}
    }

    const saveEvent = async () => {
        try {
            // Empaquetar y castear fechas para Spring Boot LocalDate via Jackson
            const payload = {
                ...newEvent,
                eventDate: newEvent.eventDate ? newEvent.eventDate.toISOString().split('T')[0] : null
            };
            console.log("Saving generic payload: ", payload);
            await axios.post('/api/v1/events', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setDisplayDialog(false);
            setNewEvent({ projectCode: '', city: '', eventDate: null, eventType: '', allocatedBudget: 0, incomeBag: '', coordinator: null, delegationUser: null });
            loadEvents();
        } catch (error) {
            console.error("Payload error", error.response?.data);
            alert("El Backend rechazó el guardado: " + (error.response?.data?.message || JSON.stringify(error.response?.data) || error.message));
        }
    };

    const approveEvent = async (id) => {
        try {
             await axios.patch(`/api/v1/events/${id}/approve`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
             loadEvents();
        } catch(error) {
            alert("Fallo al aprobar evento: " + (error.response?.data?.message || error.message));
        }
    };

    const statusTemplate = (rowData) => {
        const severity = rowData.status === 'Approved' ? 'success' : rowData.status === 'Created' ? 'warning' : 'info';
        return <Tag value={rowData.status} severity={severity}></Tag>;
    };

    const actionBodyTemplate = (rowData) => {
        if ((userRole === 'COORDINADOR' || userRole === 'SUPER_ADMIN') && rowData.status === 'Created') {
            return <Button icon="pi pi-check" rounded text severity="success" onClick={() => approveEvent(rowData.id)} title="Aprobar Evento" />;
        }
        return null;
    };

    const accountingTemplate = (rowData) => {
        const budget = rowData.allocatedBudget || 0;
        const formalized = rowData.formalizedAmount || 0;
        const remaining = rowData.remainingBalance || 0;
        const pct = budget > 0 ? (formalized / budget) * 100 : 0;
        
        return (
            <div className="flex flex-column gap-1" style={{ minWidth: '150px' }}>
                <div className="flex justify-content-between text-sm">
                    <span className="font-bold text-red-500" title="Gastado / Legalizado">-${formalized.toLocaleString()}</span>
                    <span className="font-bold text-green-600" title="Saldo Restante">${remaining.toLocaleString()}</span>
                </div>
                <ProgressBar value={Math.min(pct, 100)} showValue={false} style={{ height: '8px' }} color={pct < 100 ? '#ef4444' : '#3b82f6'} />
                <span className="text-xs text-500 text-right">{pct.toFixed(1)}% consumido</span>
            </div>
        );
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="text-xl text-900 font-bold m-0 p-0">Gestión de Eventos y Presupuestos</span>
            {(userRole === 'DELEGACION' || userRole === 'COORDINADOR' || userRole === 'SUPER_ADMIN') && <Button label="Crear Evento" icon="pi pi-plus" severity="success" raised onClick={() => setDisplayDialog(true)} />}
        </div>
    );

    const dialogFooter = (
        <div>
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setDisplayDialog(false)} className="p-button-text" />
            <Button label="Guardar" icon="pi pi-check" onClick={saveEvent} autoFocus />
        </div>
    );

    // Mapeo dinámico para selector interactivo
    const userOptions = users.map(u => ({ label: `${u.firstName || ''} ${u.lastName || ''} (${u.email})`, value: { id: u.id } }));

    return (
        <div className="surface-card shadow-2 p-4 border-round animation-duration-500 fadein">
            <DataTable value={events} loading={loading} header={header} paginator rows={10} stripedRows responsiveLayout="scroll">
                <Column field="id" header="ID"></Column>
                <Column field="projectCode" header="Código"></Column>
                <Column field="city" header="Ciudad"></Column>
                <Column field="eventDate" header="Fecha"></Column>
                <Column field="eventType" header="Tipo"></Column>
                <Column field="allocatedBudget" header="Total" body={(r) => <span className="font-bold text-900">${r.allocatedBudget?.toLocaleString()}</span>}></Column>
                <Column header="Contabilidad" body={accountingTemplate}></Column>
                <Column header="Responsable" body={(r) => r.coordinator ? `${r.coordinator.firstName || 'Sin'} ${r.coordinator.lastName || 'nombre'}` : 'N/A'}></Column>
                <Column header="Estado" body={statusTemplate}></Column>
                <Column body={actionBodyTemplate}></Column>
            </DataTable>

            <Dialog header="Crear Nuevo Evento" visible={displayDialog} style={{ width: '40vw' }} footer={dialogFooter} onHide={() => setDisplayDialog(false)}>
                <div className="flex flex-column gap-3 mt-3">
                    <InputText placeholder="Código de Proyecto" value={newEvent.projectCode} onChange={(e) => setNewEvent({...newEvent, projectCode: e.target.value})} />
                    <InputText placeholder="Ciudad" value={newEvent.city} onChange={(e) => setNewEvent({...newEvent, city: e.target.value})} />
                    
                    <span className="p-float-label mt-2">
                         <Calendar inputId="event_date" placeholder="Fecha del Evento" value={newEvent.eventDate} onChange={(e) => setNewEvent({...newEvent, eventDate: e.value})} dateFormat="yy-mm-dd" showIcon className="w-full" />
                    </span>
                    
                    <InputText placeholder="Tipo de Evento" value={newEvent.eventType} onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value})} />
                    
                    <span className="p-input-icon-left w-full mt-2">
                        <InputNumber value={newEvent.allocatedBudget} onValueChange={(e) => setNewEvent({...newEvent, allocatedBudget: e.value})} mode="currency" currency="USD" locale="en-US" placeholder="Presupuesto Asignado" className="w-full" />
                    </span>

                    <InputText placeholder="Bolsa de Ingreso" value={newEvent.incomeBag} onChange={(e) => setNewEvent({...newEvent, incomeBag: e.target.value})} />
                    
                    <Dropdown value={newEvent.delegationUser} options={userOptions} onChange={(e) => setNewEvent({...newEvent, delegationUser: e.value})} placeholder="Seleccione la Delegación de Origen" className="w-full" filter />
                    <Dropdown value={newEvent.coordinator} options={userOptions} onChange={(e) => setNewEvent({...newEvent, coordinator: e.value})} placeholder="Seleccione el Coordinador Asignado" className="w-full" filter />
                </div>
            </Dialog>
        </div>
    );
}
