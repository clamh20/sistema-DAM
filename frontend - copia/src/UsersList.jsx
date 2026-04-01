import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayDialog, setDisplayDialog] = useState(false);
    
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', passwordHash: '', role: null });

    const userRole = localStorage.getItem('role');

    useEffect(() => { 
        loadUsers(); 
        loadRoles();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await axios.get('/api/v1/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setUsers(response.data);
            setLoading(false);
        } catch (error) { setLoading(false); }
    };

    const loadRoles = async () => {
        try {
            const response = await axios.get('/api/v1/roles', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setRoles(response.data);
        } catch (error) {}
    }

    const saveUser = async () => {
        try {
            await axios.post('/api/v1/users', newUser, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setDisplayDialog(false);
            setNewUser({ firstName: '', lastName: '', email: '', passwordHash: '', role: null });
            loadUsers();
        } catch (error) {}
    };

    const toggleStatus = async (id) => {
        try {
             await axios.patch(`/api/v1/users/${id}/status`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
             loadUsers();
        } catch(error) {}
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.status} severity={rowData.status === 'Active' ? 'success' : 'danger'}></Tag>;
    };

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl text-900 font-bold">Gestión de Usuarios</span>
            {userRole === 'SUPER_ADMIN' && <Button icon="pi pi-user-plus" label="Nuevo Usuario" raised severity="primary" onClick={() => setDisplayDialog(true)} />}
        </div>
    );

    const dialogFooter = (
        <div>
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setDisplayDialog(false)} className="p-button-text" />
            <Button label="Guardar" icon="pi pi-check" onClick={saveUser} autoFocus />
        </div>
    );

    return (
        <div className="surface-card p-4 shadow-2 border-round animation-duration-500 fadein">
            <DataTable value={users} loading={loading} header={header} paginator rows={10} stripedRows emptyMessage="No hay usuarios encontrados." responsiveLayout="scroll">
                <Column field="id" header="ID" sortable style={{ width: '5rem' }}></Column>
                <Column field="firstName" header="Nombre" sortable></Column>
                <Column field="lastName" header="Apellido" sortable></Column>
                <Column field="email" header="Email" sortable></Column>
                <Column header="Rol" body={(r) => r.role?.name} sortable></Column>
                <Column header="Estado" body={statusBodyTemplate} sortable></Column>
                {userRole === 'SUPER_ADMIN' && <Column body={(r) => <div className="flex gap-2"><Button icon={r.status === 'Active' ? 'pi pi-ban' : 'pi pi-check'} rounded text severity={r.status === 'Active' ? 'danger' : 'success'} onClick={() => toggleStatus(r.id)} title="Inactivar / Activar" /></div>} exportable={false}></Column>}
            </DataTable>

            <Dialog header="Crear Nuevo Usuario" visible={displayDialog} style={{ width: '30vw' }} footer={dialogFooter} onHide={() => setDisplayDialog(false)}>
                <div className="flex flex-column gap-3 mt-3">
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon"><i className="pi pi-user"></i></span>
                        <InputText placeholder="Nombre" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} />
                    </div>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon"><i className="pi pi-user"></i></span>
                        <InputText placeholder="Apellido" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} />
                    </div>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon"><i className="pi pi-envelope"></i></span>
                        <InputText placeholder="Correo Electrónico" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                    </div>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon"><i className="pi pi-lock"></i></span>
                        <InputText type="password" placeholder="Contraseña Inicial" value={newUser.passwordHash} onChange={(e) => setNewUser({...newUser, passwordHash: e.target.value})} />
                    </div>
                    <Dropdown value={newUser.role} options={roles} onChange={(e) => setNewUser({...newUser, role: e.value})} optionLabel="name" placeholder="Seleccione un Rol" className="w-full" />
                </div>
            </Dialog>
        </div>
    );
}
