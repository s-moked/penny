import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { db, auth, sendPasswordCreationEmail } from '../firebase';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Snackbar, Fab } from '@mui/material';
import { Edit, Trash2, Plus } from 'lucide-react';

const CommercialManagement: React.FC = () => {
  const [commercials, setCommercials] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [newCommercial, setNewCommercial] = useState({ name: '', email: '', phone_number: '', agency_id: '' });
  const [editingCommercial, setEditingCommercial] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchCommercials();
    fetchAgencies();
  }, []);

  const fetchCommercials = async () => {
    const querySnapshot = await getDocs(collection(db, 'commercials'));
    setCommercials(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchAgencies = async () => {
    const querySnapshot = await getDocs(collection(db, 'agencies'));
    setAgencies(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddCommercial = async () => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, newCommercial.email);
      if (methods.length > 0) {
        setSnackbarMessage('An account with this email already exists.');
        setSnackbarOpen(true);
        return;
      }

      const docRef = await addDoc(collection(db, 'commercials'), {
        ...newCommercial,
        created_at: new Date(),
        updated_at: new Date()
      });

      const success = await sendPasswordCreationEmail(newCommercial.email);
      if (success) {
        setSnackbarMessage('Commercial added successfully and invitation email sent.');
      } else {
        setSnackbarMessage('Commercial added successfully but failed to send invitation email.');
      }

      setNewCommercial({ name: '', email: '', phone_number: '', agency_id: '' });
      setOpenDialog(false);
      setSnackbarOpen(true);
      fetchCommercials();
    } catch (error) {
      console.error('Error adding commercial:', error);
      setSnackbarMessage('Failed to add commercial.');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateCommercial = async () => {
    if (!editingCommercial) return;
    try {
      await updateDoc(doc(db, 'commercials', editingCommercial.id), {
        ...editingCommercial,
        updated_at: new Date()
      });
      setEditingCommercial(null);
      setOpenDialog(false);
      setSnackbarMessage('Commercial updated successfully.');
      setSnackbarOpen(true);
      fetchCommercials();
    } catch (error) {
      console.error('Error updating commercial:', error);
      setSnackbarMessage('Failed to update commercial.');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteCommercial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'commercials', id));
      setSnackbarMessage('Commercial deleted successfully.');
      setSnackbarOpen(true);
      fetchCommercials();
    } catch (error) {
      console.error('Error deleting commercial:', error);
      setSnackbarMessage('Failed to delete commercial.');
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <List>
        {commercials.map((commercial) => (
          <ListItem key={commercial.id}>
            <ListItemText primary={commercial.name} secondary={commercial.email} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => {
                setEditingCommercial(commercial);
                setOpenDialog(true);
              }}>
                <Edit />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCommercial(commercial.id)}>
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
        <DialogTitle>{editingCommercial ? 'Edit Commercial' : 'Add New Commercial'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={editingCommercial ? editingCommercial.name : newCommercial.name}
            onChange={(e) => editingCommercial ? setEditingCommercial({...editingCommercial, name: e.target.value}) : setNewCommercial({...newCommercial, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={editingCommercial ? editingCommercial.email : newCommercial.email}
            onChange={(e) => editingCommercial ? setEditingCommercial({...editingCommercial, email: e.target.value}) : setNewCommercial({...newCommercial, email: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            value={editingCommercial ? editingCommercial.phone_number : newCommercial.phone_number}
            onChange={(e) => editingCommercial ? setEditingCommercial({...editingCommercial, phone_number: e.target.value}) : setNewCommercial({...newCommercial, phone_number: e.target.value})}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Agency</InputLabel>
            <Select
              value={editingCommercial ? editingCommercial.agency_id : newCommercial.agency_id}
              onChange={(e) => editingCommercial ? setEditingCommercial({...editingCommercial, agency_id: e.target.value}) : setNewCommercial({...newCommercial, agency_id: e.target.value})}
            >
              {agencies.map((agency) => (
                <MenuItem key={agency.id} value={agency.id}>{agency.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={editingCommercial ? handleUpdateCommercial : handleAddCommercial}>
            {editingCommercial ? 'Update' : 'Add'}
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

export default CommercialManagement;