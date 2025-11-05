import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardHeader, CardContent, Typography, TextField, Button, Avatar, Chip, Divider, ImageList, ImageListItem, ImageListItemBar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const theme = useTheme();
  const { user, token, updateUser } = useAuth();
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');

  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', profilePicture: '', profilePictureType: '' });
  const [defaults, setDefaults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDefault, setSelectedDefault] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setProfile(json.user);
      }
    } catch {}
  };

  const fetchDefaultOptions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile/default-options`);
      if (res.ok) {
        const json = await res.json();
        setDefaults(json.options || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchDefaultOptions();
    }
  }, [token]);

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName, profilePicture: profile.profilePicture, profilePictureType: profile.profilePictureType })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Failed to save');
      setMessage('Profile updated successfully');
      updateUser({
        ...user,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email || user?.email,
        profilePicture: profile.profilePicture,
        profilePictureType: profile.profilePictureType,
      });
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onPickDefault = (url) => {
    setProfile(p => ({ ...p, profilePicture: url, profilePictureType: 'default' }));
    setSelectedDefault(url);
    // Update global user immediately so avatar frames reflect selection
    updateUser({
      ...user,
      profilePicture: url,
      profilePictureType: 'default',
    });
  };

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('profilePicture', file);
      const res = await fetch(`${API_URL}/api/profile/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');
      setProfile(p => ({ ...p, profilePicture: json.profilePicture, profilePictureType: 'custom' }));
      setMessage('Profile picture uploaded');
      updateUser({
        ...user,
        profilePicture: json.profilePicture,
        profilePictureType: 'custom',
      });
    } catch (e) {
      setMessage(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>Profile</Typography>
          <Typography variant="body2" color="text.secondary">Manage your account details and avatar</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Your Avatar" subheader="Pick a default or upload your own" />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box
                  sx={{
                    borderRadius: '50%',
                    p: { xs: 1.5, md: 2 },
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #22c55e 100%)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                  }}
                >
                  <Avatar
                    src={profile.profilePicture || null}
                    imgProps={{ crossOrigin: 'anonymous' }}
                    sx={{
                      width: { xs: 128, md: 192 },
                      height: { xs: 128, md: 192 },
                      border: '4px solid',
                      borderColor: 'background.paper',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                    }}
                  >
                    {(profile.firstName || 'U')[0]}
                  </Avatar>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" component="label" disabled={uploading}>
                  Upload
                  <input hidden type="file" accept="image/*" onChange={(e) => onUpload(e.target.files?.[0])} />
                </Button>
                <Button variant="outlined" onClick={() => setPickerOpen(true)}>
                  Select Profile Picture
                </Button>
                <Button variant="contained" color="primary" disabled={saving} onClick={onSave}>Save Changes</Button>
              </Box>
              {message && <Alert severity={message.includes('fail') ? 'error' : 'success'} sx={{ mt: 1 }}>{message}</Alert>}
              <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Select a Profile Picture</DialogTitle>
                <DialogContent>
                  <ImageList cols={5} gap={12} sx={{ m: 0 }}>
                    {defaults.map((item) => (
                      <ImageListItem key={item.id} sx={{ cursor: 'pointer', borderRadius: 2, overflow: 'hidden', border: (selectedDefault === item.url ? '2px solid ' + theme.palette.primary.main : '1px solid ' + theme.palette.divider) }} onClick={() => onPickDefault(item.url)}>
                        <img src={item.url} alt={item.name} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <ImageListItemBar title={item.name} position="below" sx={{ textAlign: 'center', fontSize: '0.75rem' }} />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setPickerOpen(false)}>Close</Button>
                  <Button variant="contained" onClick={() => { if (selectedDefault) { setProfile(p => ({ ...p, profilePicture: selectedDefault, profilePictureType: 'default' })); updateUser({ ...user, profilePicture: selectedDefault, profilePictureType: 'default' }); setPickerOpen(false); } }}>Use Selected</Button>
                </DialogActions>
              </Dialog>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Account Details" subheader="Keep your information up to date" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="First Name" fullWidth value={profile.firstName || ''} onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Last Name" fullWidth value={profile.lastName || ''} onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Email" fullWidth value={profile.email || ''} disabled />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant="contained" onClick={onSave} disabled={saving}>Save Profile</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
