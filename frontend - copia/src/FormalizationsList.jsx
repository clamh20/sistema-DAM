import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import axios from 'axios';

export default function FormalizationsList() {
    const [formalizations, setFormalizations] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [displayDialog, setDisplayDialog] = useState(false);
    const [newForm, setNewForm] = useState({ event: { id: null }, itemName: '', amount: 0, notes: '' });
    const fileUploadRef = useRef(null);

    const userRole = localStorage.getItem('role');

    useEffect(() => { 
        loadFormalizations(); 
        loadEvents();
    }, []);

    const loadFormalizations = async () => {
        try {
            const response = await axios.get('/api/v1/formalizations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setFormalizations(response.data);
            setLoading(false);
        } catch (error) { setLoading(false); }
    };

    const loadEvents = async () => {
        try {
             const res = await axios.get('/api/v1/events', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
             setEvents(res.data);
        } catch(e) {}
    }

    const saveFormalization = async () => {
        if (!newForm.event.id) {
             alert("⚠️ Por favor asigne esta formalización a un Evento primero, abriendo la lista desplegable.");
             return;
        }
        if (!newForm.itemName) {
             alert("⚠️ Debe colocarle una Descripción o nombre al ítem que está a punto de legalizar.");
             return;
        }
        if (newForm.amount <= 0) {
             alert("⚠️ El monto justificado no puede ser cero.");
             return;
        }

        let formalizationId = null;
        try {
            const response = await axios.post('/api/v1/formalizations', newForm, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            formalizationId = response.data.id;
        } catch (error) {
             console.error("Payload error", error.response?.data);
             alert("El Servidor rechazó el Formulario Documental: " + (error.response?.data?.message || JSON.stringify(error.response?.data) || error.message));
             return; // Stop execution
        }

        // Procesamiento Categórico de Archivos Anexos
        if (fileUploadRef.current && fileUploadRef.current.getFiles().length > 0) {
             const formData = new FormData();
             fileUploadRef.current.getFiles().forEach(file => formData.append('files', file));
             try {
                 await axios.post(`/api/v1/formalizations/${formalizationId}/upload`, formData, { 
                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } 
                 });
             } catch (uploadError) {
                 console.error("Upload error", uploadError.response?.data);
                 alert("El Gasto se guardó correctamente, PERO el servidor de Windows rechazó los PDFs/Imágenes adjuntas: " + (uploadError.response?.data?.message || JSON.stringify(uploadError.response?.data) || uploadError.message));
             }
             fileUploadRef.current.clear();
        }

        setDisplayDialog(false);
        setNewForm({ event: { id: null }, itemName: '', amount: 0, notes: '' });
        loadFormalizations();
        loadEvents();
    };

    const changeStatus = async (id, status) => {
        try {
             await axios.patch(`/api/v1/formalizations/${id}/status?status=${status}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
             loadFormalizations();
        } catch(error) {}
    };

    const statusTemplate = (rowData) => {
        const severity = rowData.status === 'Approved' ? 'success' : rowData.status === 'Pending' ? 'warning' : 'danger';
        return <Tag value={rowData.status} severity={severity}></Tag>;
    };

    const actionBodyTemplate = (rowData) => {
        if ((userRole === 'CONTADOR' || userRole === 'SUPER_ADMIN') && rowData.status === 'Pending') {
            return (
                <div className="flex gap-2">
                    <Button icon="pi pi-check" rounded text severity="success" onClick={() => changeStatus(rowData.id, 'Approved')} title="Aprobar" />
                    <Button icon="pi pi-times" rounded text severity="danger" onClick={() => changeStatus(rowData.id, 'Rejected')} title="Rechazar" />
                </div>
            );
        }
        return null;
    };

    const filesTemplate = (rowData) => {
         if (!rowData.filePaths || rowData.filePaths.length === 0) return <span className="text-400 text-sm">Sin anexos</span>;
         return (
             <div className="flex flex-wrap gap-1">
                 {rowData.filePaths.map((path, idx) => (
                     <Button key={idx} icon="pi pi-file-pdf" rounded text severity="danger" 
                             onClick={() => window.open(`/uploads/${path}`, '_blank')} 
                             title={`Abrir Documento ${idx+1}`} />
                 ))}
             </div>
         );
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="text-xl text-900 font-bold m-0 p-0">Formalizaciones de Gastos (Soportes)</span>
            {(userRole === 'DELEGACION' || userRole === 'SUPER_ADMIN') && <Button label="Subir Soporte" icon="pi pi-upload" severity="info" raised onClick={() => setDisplayDialog(true)} />}
        </div>
    );

    const dialogFooter = (
        <div>
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setDisplayDialog(false)} className="p-button-text" />
            <Button label="Guardar" icon="pi pi-check" onClick={saveFormalization} autoFocus />
        </div>
    );

    // Helper info
    const selectedEvent = events.find(e => e.id === newForm.event.id);

    return (
        <div className="surface-card shadow-2 p-4 border-round animation-duration-500 fadein">
            <DataTable value={formalizations} loading={loading} header={header} paginator rows={10} stripedRows responsiveLayout="scroll">
                <Column field="id" header="ID"></Column>
                <Column header="Dispuesto a Evento" body={(r) => r.event?.projectCode || r.event?.id}></Column>
                <Column field="itemName" header="Ítem/Descripción"></Column>
                <Column field="amount" header="Monto" body={(r) => `$${r.amount?.toLocaleString()}`}></Column>
                <Column header="Soportes Físicos" body={filesTemplate}></Column>
                <Column field="notes" header="Notas"></Column>
                <Column header="Estado" body={statusTemplate}></Column>
                <Column body={actionBodyTemplate}></Column>
            </DataTable>

            <Dialog header="Registrar Gasto de Formalización" visible={displayDialog} style={{ width: '35vw' }} footer={dialogFooter} onHide={() => setDisplayDialog(false)}>
                <div className="flex flex-column gap-3 mt-3">
                    <Dropdown value={newForm.event.id} options={events} onChange={(e) => setNewForm({...newForm, event: { id: e.value }})} optionLabel="projectCode" optionValue="id" placeholder="Seleccione Evento a Legalizar" className="w-full" filter />
                    {selectedEvent && (
                        <small className="text-orange-500 font-bold ml-1 -mt-2">
                             Saldo Disponible de Evento [{selectedEvent.projectCode}]: ${selectedEvent.remainingBalance?.toLocaleString()} (Restricción de Sistema).
                        </small>
                    )}
                    <InputText placeholder="Descripción del Gasto" value={newForm.itemName} onChange={(e) => setNewForm({...newForm, itemName: e.target.value})} />
                    <InputNumber value={newForm.amount} onValueChange={(e) => setNewForm({...newForm, amount: e.value})} mode="currency" currency="USD" locale="en-US" placeholder="Monto Justificado" />
                    <InputTextarea rows={2} placeholder="Notas adicionales..." value={newForm.notes} onChange={(e) => setNewForm({...newForm, notes: e.target.value})} />
                    
                    <div className="border-1 surface-border border-round mt-2">
                         <FileUpload ref={fileUploadRef} multiple accept="application/pdf,image/*" maxFileSize={100000000} 
                            customUpload uploadHandler={() => {}} chooseLabel="Adjuntar Documentos" cancelLabel="Limpiar"
                            emptyTemplate={<p className="m-0 text-center text-500 p-3">Arrastra hasta 50 Facturas/PDFs/Fotos aquí para enlazarlos como pruebas. (Máx. 100MB por archivo).</p>} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
