import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { seedTrips, defaultVehicle } from '../utils/calculations';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  TRIPS: '@gigprofit_trips',
  VEHICLE: '@gigprofit_vehicle',
  ONBOARDED: '@gigprofit_onboarded',
};

export function AppProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [vehicle, setVehicleState] = useState(defaultVehicle);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [tripsRaw, vehicleRaw, onboarded] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.TRIPS),
          AsyncStorage.getItem(STORAGE_KEYS.VEHICLE),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        ]);

        if (tripsRaw) {
          setTrips(JSON.parse(tripsRaw));
        } else {
          // First launch - seed with sample data
          const seeded = seedTrips();
          setTrips(seeded);
          await AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(seeded));
          await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
        }

        if (vehicleRaw) {
          setVehicleState(JSON.parse(vehicleRaw));
        }
      } catch (e) {
        console.warn('Storage load error:', e);
        setTrips(seedTrips());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addTrip = useCallback(async (trip) => {
    const newTrip = { ...trip, id: String(Date.now() + Math.random()) };
    setTrips((prev) => {
      const updated = [newTrip, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    return newTrip;
  }, []);

  const updateTrip = useCallback(async (id, updates) => {
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const deleteTrip = useCallback(async (id) => {
    setTrips((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const setVehicle = useCallback(async (updates) => {
    setVehicleState((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.VEHICLE, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    const fresh = seedTrips();
    setTrips(fresh);
    setVehicleState(defaultVehicle);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TRIPS, JSON.stringify(fresh)],
      [STORAGE_KEYS.VEHICLE, JSON.stringify(defaultVehicle)],
    ]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        trips,
        vehicle,
        period,
        loading,
        setPeriod,
        addTrip,
        updateTrip,
        deleteTrip,
        setVehicle,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
