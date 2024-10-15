import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { db, auth, sendPasswordCreationEmail } from '../firebase';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Fab } from '@mui/material';
import { Edit, Trash2, Plus } from 'lucide-react';

const AgencyManagement: React.FC = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [newAgency, setNewAgency] = useState({ name: '', address: '', contact_email: '', phone_number: '' });
  const [editingAgency, setEditingAgency] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    const querySnapshot = await getDocs(collection(db, 'agencies'));
    setAgencies(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddAgency = async () => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, newAgency.contact_email);
      if (methods.length > 0) {
        setSnackbarMessage('An account with this email already exists.');
        setSnackbarOpen(true);
        return;
      }

      const docRef = await addDoc(collection(db, 'agencies'), {
        ...newAgency,
        created_at: new Date(),
        updated_at: new Date()
      });

      const success = await sendPasswordCreationEmail(newAgency.contact_email);
      if (success) {
        setSnackbarMessage('Agency added successfully and invitation email sent.');
      } else {
        setSnackbarMessage('Agency added successfully but failed to send invitation email.');
      }

      setNewAgency({ name: '', address: '', contact_email: '', phone_number: '' });
      setOpenDialog(false);
      setSnackbarOpen(true);
      fetchAgencies();
    } catch (error) {
      console.error('Error adding agency:', error);
      setSnackbarMessage('Failed to add agency.');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateAgency = async () => {
    if (!editingAgency) return;
    try {
      await updateDoc(doc(db, 'agencies', editingAgency.id), {
        ...editingAgency,
        updated_at: new Date()
      });
      setEditingAgency(null);
      setOpenDialog(false);
      setSnackbarMessage('Agency updated successfully.');
      setSnackbarOpen(true);
      fetchAgencies();
    } catch (error) {
      console.error('Error updating agency:', error);
      setSnackbarMessage('Failed to update agency.');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteAgency = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'agencies', id));
      setSnackbarMessage('Agency deleted successfully.');
      setSnackbarOpen(true);
      fetchAgencies();
    } catch (error) {
      console.error('Error deleting agency:', error);
      setSnackbarMessage('Failed to delete agency.');
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <List>
        {agencies.map((agency) => (
          <ListItem key={agency.id}>
            <ListItemText primary={agency.name} secondary={agency.address} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => {
                setEditingAgency(agency);
                setOpenDialog(true);
              }}>
                <Edit />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAgency(agency.id)}>
                <Trash2 />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Fab color="primary" aria-label="add" style={{ position: 'fixed', bottom: 16, right: 16 }} onClick={() => setOpenDialog(true)}>
        <Plus />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingAgency ? 'Edit Agency' : 'Add New Agency'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={editingAgency ? editingAgency.name : newAgency.name}
            onChange={(e) => editingAgency ? setEditingAgency({...editingAgency, name: e.target.value}) : setNewAgency({...newAgency, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Address"
            type="text"
            fullWidth
            value={editingAgency ? editingAgency.address : newAgency.address}
            onChange={(e) => editingAgency ? setEditingAgency({...editingAgency, address: e.target.value}) : setNewAgency({...newAgency, address: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Contact Email"
            type="email"
            fullWidth
            value={editingAgency ? editingAgency.contact_email : newAgency.contact_email}
            onChange={(e) => editingAgency ? setEditingAgency({...editingAgency, contact_email: e.target.value}) : setNewAgency({...newAgency, contact_email: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            value={editingAgency ? editingAgency.phone_number : newAgency.phone_number}
            onChange={(e) => editingAgency ? setEditingAgency({...editingAgency, phone_number: e.target.value}) : setNewAgency({...newAgency, phone_number: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={editingAgency ? handleUpdateAgency : handleAddAgency}>
            {editingAgency ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
};

export default AgencyManagement;