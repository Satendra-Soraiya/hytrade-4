import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';
import { formatInr } from '../utils/currency';
import { PageContent, PageHeader, Panel, StatCard } from '../components/layout/PageShell';
import AvatarPicker from '../components/profile/AvatarPicker';

const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const API_URL = getApiUrl();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: 'default-1',
    profilePictureType: 'default',
    tradingExperience: '',
    riskTolerance: '',
    updatedAt: null,
  });
  const [defaults, setDefaults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const syncUser = (next) => {
    updateUser({
      ...user,
      firstName: next.firstName,
      lastName: next.lastName,
      email: next.email || user?.email,
      profilePicture: next.profilePicture,
      profilePictureType: next.profilePictureType,
      tradingExperience: next.tradingExperience,
      riskTolerance: next.riskTolerance,
      updatedAt: next.updatedAt || new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      const [pRes, dRes] = await Promise.all([
        fetch(`${API_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/profile/default-options`),
      ]);
      if (pRes.ok) {
        const json = await pRes.json();
        setProfile(json.user);
      }
      if (dRes.ok) {
        const json = await dRes.json();
        setDefaults(json.options || []);
      }
    })();
  }, [token, API_URL]);

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          profilePicture: profile.profilePicture,
          profilePictureType: profile.profilePictureType,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save');
      const updated = { ...profile, ...json.user, updatedAt: json.user?.updatedAt || new Date().toISOString() };
      setProfile(updated);
      syncUser(updated);
      setMessage('Profile saved');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onPickDefault = async (id) => {
    const next = {
      ...profile,
      profilePicture: id,
      profilePictureType: 'default',
      updatedAt: new Date().toISOString(),
    };
    setProfile(next);
    syncUser(next);
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          profilePicture: id,
          profilePictureType: 'default',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save avatar');
      const updated = { ...next, ...json.user, updatedAt: json.user?.updatedAt || next.updatedAt };
      setProfile(updated);
      syncUser(updated);
      setMessage('Avatar updated');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('profilePicture', file);
      const res = await fetch(`${API_URL}/api/profile/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');
      const next = {
        ...profile,
        profilePicture: json.profilePicture,
        profilePictureType: 'custom',
        updatedAt: json.user?.updatedAt || new Date().toISOString(),
      };
      setProfile(next);
      syncUser(next);
      setMessage('Custom photo uploaded');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageContent>
      <PageHeader title="Profile" subtitle="Account details and avatar" />

      <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Panel title="Avatar">
            <AvatarPicker
              profile={profile}
              defaults={defaults}
              uploading={uploading}
              onPickDefault={onPickDefault}
              onUpload={onUpload}
            />
            {message && (
              <Alert
                severity={message.toLowerCase().includes('fail') || message.includes('Invalid') ? 'error' : 'success'}
                sx={{ mt: 2 }}
              >
                {message}
              </Alert>
            )}
          </Panel>
          <Box sx={{ mt: 2 }}>
            <StatCard label="Paper balance" value={formatInr(user?.accountBalance)} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Panel title="Account information">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="First name" fullWidth value={profile.firstName || ''} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Last name" fullWidth value={profile.lastName || ''} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email" fullWidth value={profile.email || ''} disabled />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Experience" fullWidth value={profile.tradingExperience || user?.tradingExperience || ''} disabled />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Risk tolerance" fullWidth value={profile.riskTolerance || user?.riskTolerance || ''} disabled />
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 2 }} onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </Panel>
        </Grid>
      </Grid>
    </PageContent>
  );
};

export default ProfilePage;
