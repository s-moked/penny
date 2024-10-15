import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { db, auth, sendPasswordCreationEmail } from '../firebase';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Snackbar, Fab } from '@mui/material';
import { Edit, Trash2, Plus } from 'lucide-react';

const IntroducerManagement: React.FC = () => {
  const [introducers, setIntroducers] = useState<any[]>([]);
  const [commercials, setCommercials] = useState<any[]>([]);
  const [newIntroducer, setNewIntroducer] = useState({ name: '', email: '', phone_number: '', commercial_id: '' });
  const [editingIntroducer, setEditingIntroducer] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchIntroducers();
    fetchCommercials();
  }, []);

  const fetchIntroducers = async () => {
    const querySnapshot = await getDocs(collection(db, 'introducers'));
    setIntroducers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchCommercials = async () => {
    const querySnapshot = await getDocs(collection(db, 'commercials'));
    setCommercials(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddIntroducer = async () => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, newIntroducer.email);
      if (methods.length > 0) {
        setSnackbarMessage('An account with this email already exists.');
        setSnackbarOpen(true);
        return;
      }

      const docRef = await addDoc(collection(db, 'introducers'), {
        ...newIntroducer,
        created_at: new Date(),
        updated_at: new Date()
      });

      const success = await sendPasswordCreationEmail(newIntroducer.email);
      if (success) {
        setSnackbarMessage('Introducer added successfully and invitation email sent.');
      } else {
        setSnackbarMessage('Introducer added successfully but failed to send invitation email.');
      }

      setNewIntroducer({ name: '', email: '', phone_number: '', commercial_id: '' });
      setOpenDialog(false);
      setSnackbarOpen(true);
      fetchIntroducers();
    } catch (error) {
      console.error('Error adding introducer:', error);
      setSnackbarMessage('Failed to add introducer.');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateIntroducer = async () => {
    if (!editingIntroducer) return;
    try {
      await updateDoc(doc(db, 'introducers', editingIntroducer.id), {
        ...editingIntroducer,
        updated_at: new Date()
      });
      setEditingIntroducer(null);
      setOpenDialog(false);
      setSnackbarMessage('Introducer updated successfully.');
      setSnackbarOpen(true);
      fetchIntroducers();
    } catch (error) {
      console.error('Error updating introducer:', error);
      setSnackbarMessage('Failed to update introducer.');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteIntroducer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'introducers', id));
      setSnackbarMessage('Introducer deleted successfully.');
      setSnackbarOpen(true);
      fetchIntroducers();
    } catch (error) {
      console.error('Error deleting introducer:', error);
      setSnackbarMessage('Failed to delete introducer.');
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <List>
        {introducers.map((introducer) => (
          <ListItem key={introducer.id}>
            <ListItemText primary={introducer.name} secondary={introducer.email} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => {
                setEditingIntroducer(introducer);
                setOpenDialog(true);
              }}>
                <Edit />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteIntroducer(introducer.id)}>
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
        <DialogTitle>{editingIntroducer ? 'Edit Introducer' : 'Add New Introducer'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={editingIntroducer ? editingIntroducer.name : newIntroducer.name}
            onChange={(e) => editingIntroducer ? setEditingIntroducer({...editingIntroducer, name: e.target.value}) : setNewIntroducer({...newIntroducer, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={editingIntroducer ? editingIntroducer.email : newIntroducer.email}
            onChange={(e) => editingIntroducer ? setEditingIntroducer({...editingIntroducer, email: e.target.value}) : setNewIntroducer({...newIntroducer, email: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            value={editingIntroducer ? editingIntroducer.phone_number : newIntroducer.phone_number}
            onChange={(e) => editingIntroducer ? setEditingIntroducer({...editingIntroducer, phone_number: e.target.value}) : setNewIntroducer({...newIntroducer, phone_number: e.target.value})}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Commercial</InputLabel>
            <Select
              value={editingIntroducer ? editingIntroducer.commercial_id : newIntroducer.commercial_id}
              onChange={(e) => editingIntroducer ? setEditingIntroducer({...editingIntroducer, commercial_id: e.target.value}) : setNewIntroducer({...newIntroducer, commercial_id: e.target.value})}
            >
              {commercials.map((commercial) => (
                <MenuItem key={commercial.id} value={commercial.id}>{commercial.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={editingIntroducer ? handleUpdateIntroducer : handleAddIntroducer}>
            {editingIntroducer ? 'Update' : 'Add'}
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

export default IntroducerManagement;