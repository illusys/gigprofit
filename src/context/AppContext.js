import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { seedTrips, defaultVehicle, DEFAULT_TAX_SETTINGS } from '../utils/calculations';
import { api } from '../services/api';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  TRIPS: '@gigprofit_trips',
  VEHICLE: '@gigprofit_vehicle',
  TAX: '@gigprofit_tax',
};

function toLocalTrip(trip) {
  return { ...trip, date: String(trip.date || '').split('T')[0] };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [vehicle, setVehicleState] = useState(defaultVehicle);
  const [taxSettings, setTaxSettingsState] = useState(DEFAULT_TAX_SETTINGS);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const loadLocalFallback = useCallback(async () => {
    const [tripsRaw, vehicleRaw, taxRaw] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TRIPS),
      AsyncStorage.getItem(STORAGE_KEYS.VEHICLE),
      AsyncStorage.getItem(STORAGE_KEYS.TAX),
    ]);
    if (tripsRaw) setTrips(JSON.parse(tripsRaw));
    else {
      const seeded = seedTrips();
      setTrips(seeded);
      await AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(seeded));
    }
    if (vehicleRaw) setVehicleState(JSON.parse(vehicleRaw));
    if (taxRaw) setTaxSettingsState(JSON.parse(taxRaw));
  }, []);

  const refreshCloudData = useCallback(async () => {
    const data = await api.trips('?pageSize=100');
    setTrips((data.items || []).map(toLocalTrip));
  }, []);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const token = await api.getAccessToken();
      if (token) {
        const me = await api.me();
        setUser(me.user);
        const profile = me.user?.profile;
        if (profile?.vehicleSettings) setVehicleState({ ...defaultVehicle, ...profile.vehicleSettings });
        if (profile?.taxSettings) setTaxSettingsState({ ...DEFAULT_TAX_SETTINGS, ...profile.taxSettings });
        await refreshCloudData();
      } else {
        await loadLocalFallback();
      }
    } catch (e) {
      console.warn('App hydrate error:', e.message);
      await api.clearTokens();
      setUser(null);
      await loadLocalFallback();
    } finally {
      setLoading(false);
    }
  }, [loadLocalFallback, refreshCloudData]);

  useEffect(() => { hydrate(); }, [hydrate]);

  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials);
    setUser(data.user);
    await hydrate();
    return data.user;
  }, [hydrate]);

  const register = useCallback(async (payload) => api.register(payload), []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const data = await api.googleAuth(idToken);
    setUser(data.user);
    await hydrate();
    return data.user;
  }, [hydrate]);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setTrips([]);
    await loadLocalFallback();
  }, [loadLocalFallback]);

  const addTrip = useCallback(async (trip) => {
    if (user) {
      const data = await api.createTrip(trip);
      const newTrip = toLocalTrip(data.trip);
      setTrips((prev) => [newTrip, ...prev]);
      return newTrip;
    }
    const newTrip = { ...trip, id: String(Date.now() + Math.random()) };
    setTrips((prev) => {
      const updated = [newTrip, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    return newTrip;
  }, [user]);

  const updateTrip = useCallback(async (id, updates) => {
    if (user) {
      const data = await api.updateTrip(id, updates);
      const updatedTrip = toLocalTrip(data.trip);
      setTrips((prev) => prev.map((t) => (t.id === id ? updatedTrip : t)));
      return updatedTrip;
    }
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    return null;
  }, [user]);

  const deleteTrip = useCallback(async (id) => {
    if (user) await api.deleteTrip(id);
    setTrips((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      if (!user) AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [user]);

  const setVehicle = useCallback(async (updates) => {
    setVehicleState((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.VEHICLE, JSON.stringify(updated)).catch(() => {});
      if (user) api.updateProfileSettings({ vehicleSettings: updated, taxSettings }).catch(() => {});
      return updated;
    });
  }, [user, taxSettings]);

  const setTaxSettings = useCallback(async (updates) => {
    setTaxSettingsState((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.TAX, JSON.stringify(updated)).catch(() => {});
      if (user) api.updateProfileSettings({ vehicleSettings: vehicle, taxSettings: updated }).catch(() => {});
      return updated;
    });
  }, [user, vehicle]);

  const clearAllData = useCallback(async () => {
    const fresh = seedTrips();
    setTrips(fresh);
    setVehicleState(defaultVehicle);
    setTaxSettingsState(DEFAULT_TAX_SETTINGS);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TRIPS, JSON.stringify(fresh)],
      [STORAGE_KEYS.VEHICLE, JSON.stringify(defaultVehicle)],
      [STORAGE_KEYS.TAX, JSON.stringify(DEFAULT_TAX_SETTINGS)],
    ]);
  }, []);

  return (
    <AppContext.Provider value={{ user, isAdmin, trips, vehicle, taxSettings, period, loading, setPeriod, login, loginWithGoogle, register, logout, refreshCloudData, addTrip, updateTrip, deleteTrip, setVehicle, setTaxSettings, clearAllData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
