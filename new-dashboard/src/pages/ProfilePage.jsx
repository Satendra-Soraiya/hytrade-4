import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Edit,
  Close,
  CloudUpload
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: 'default-1',
    profilePictureType: 'default'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Avatar selection dialog
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [defaultAvatars, setDefaultAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  
  // File upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 
    (import.meta.env.DEV ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profilePicture: user.profilePicture || 'default-1',
        profilePictureType: user.profilePictureType || 'default'
      });
    }
    loadDefaultAvatars();
  }, [user]);

  const loadDefaultAvatars = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profile/default-options`);
      const data = await response.json();
      if (data.success) {
        setDefaultAvatars(data.options);
      }
    } catch (error) {
      console.error('Error loading default avatars:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          profilePicture: profile.profilePicture,
          profilePictureType: profile.profilePictureType
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Profile updated successfully!');
        updateUser(data.user);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Error updating profile');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
  };

  const handleConfirmAvatar = () => {
    setProfile(prev => ({
      ...prev,
      profilePicture: selectedAvatar,
      profilePictureType: 'default'
    }));
    setAvatarDialogOpen(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${API_URL}/api/profile/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setProfile(prev => ({
          ...prev,
          profilePicture: data.profilePicture,
          profilePictureType: 'custom'
        }));
        updateUser(data.user);
        setMessage('Profile picture uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      setError('Error uploading profile picture');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (profile.profilePictureType === 'custom') {
      return `${API_URL}${profile.profilePicture}`;
    } else {
      const avatar = defaultAvatars.find(av => av.id === profile.profilePicture);
      return avatar ? avatar.url : `${API_URL}/images/default-avatars/avatar-1.svg`;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Profile Settings
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Profile Picture Section */}
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h6" gutterBottom>
                  Profile Picture
                </Typography>
                
                <Avatar
                  src={getProfilePictureUrl()}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: '3px solid',
                    borderColor: 'primary.main'
                  }}
                />

                <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setAvatarDialogOpen(true)}
                    size="small"
                  >
                    Choose Avatar
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    size="small"
                  >
                    {uploading ? 'Uploading...' : 'Upload Custom'}
                  </Button>
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                {profile.profilePictureType === 'custom' && (
                  <Chip
                    label="Custom Photo"
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>

            {/* Profile Information */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    disabled
                    variant="outlined"
                    helperText="Email cannot be changed"
                  />
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  disabled={saving}
                  size="large"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Avatar Selection Dialog */}
      <Dialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Choose Default Avatar
          <IconButton
            onClick={() => setAvatarDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {defaultAvatars.map((avatar) => (
              <Grid item xs={3} key={avatar.id}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  sx={{
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 2,
                    border: selectedAvatar === avatar.id ? '2px solid' : '2px solid transparent',
                    borderColor: selectedAvatar === avatar.id ? 'primary.main' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => handleAvatarSelect(avatar.id)}
                >
                  <Avatar
                    src={avatar.url}
                    sx={{ width: 60, height: 60, mb: 1 }}
                  />
                  <Typography variant="caption" textAlign="center">
                    {avatar.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAvatar}
            variant="contained"
            disabled={!selectedAvatar}
          >
            Select Avatar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
