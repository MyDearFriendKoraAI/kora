'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, QUERY_STALE_TIMES } from '@/lib/react-query/client';
import { toast } from 'sonner';

// Tipi per training API
interface TrainingFilters {
  status?: 'upcoming' | 'completed' | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'type' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

interface CreateTrainingData {
  title: string;
  description?: string;
  date: string;
  duration: number;
  type: 'training' | 'match' | 'friendly';
  location?: string;
  notes?: string;
}

interface AttendanceData {
  playerId: string;
  status: 'present' | 'absent' | 'late' | 'injured';
  notes?: string;
}

// Hook per ottenere allenamenti di una squadra
export function useTrainings(teamId: string, filters: TrainingFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.trainings.list(teamId), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await fetch(`/api/teams/${teamId}/trainings?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trainings: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: QUERY_STALE_TIMES.trainings,
    enabled: !!teamId,
  });
}

// Hook per singolo allenamento
export function useTraining(teamId: string, trainingId: string) {
  return useQuery({
    queryKey: queryKeys.trainings.detail(trainingId),
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch training: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: QUERY_STALE_TIMES.trainings,
    enabled: !!teamId && !!trainingId,
  });
}

// Hook per creare un allenamento
export function useCreateTraining(teamId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTrainingData) => {
      const response = await fetch(`/api/teams/${teamId}/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create training');
      }
      
      return response.json();
    },
    onSuccess: (newTraining) => {
      // Invalida query degli allenamenti
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.list(teamId) });
      
      // Aggiungi alla cache del singolo training
      queryClient.setQueryData(queryKeys.trainings.detail(newTraining.id), newTraining);
      
      toast.success('Allenamento creato con successo!');
    },
    onError: (error: any) => {
      console.error('Create training error:', error);
      toast.error(error.message || 'Errore durante la creazione dell\'allenamento');
    },
  });
}

// Hook per aggiornare un allenamento
export function useUpdateTraining(teamId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ trainingId, data }: { trainingId: string; data: Partial<CreateTrainingData> }) => {
      const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update training');
      }
      
      return response.json();
    },
    onSuccess: (updatedTraining, variables) => {
      // Update cache del singolo allenamento
      queryClient.setQueryData(queryKeys.trainings.detail(variables.trainingId), updatedTraining);
      
      // Invalida lista allenamenti
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.list(teamId) });
      
      toast.success('Allenamento aggiornato con successo!');
    },
    onError: (error: any) => {
      console.error('Update training error:', error);
      toast.error(error.message || 'Errore durante l\'aggiornamento dell\'allenamento');
    },
  });
}

// Hook per eliminare un allenamento
export function useDeleteTraining(teamId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trainingId: string) => {
      const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete training');
      }
      
      return { trainingId };
    },
    onSuccess: (result) => {
      // Rimuovi dalla cache
      queryClient.removeQueries({ queryKey: queryKeys.trainings.detail(result.trainingId) });
      queryClient.removeQueries({ queryKey: queryKeys.trainings.attendance(result.trainingId) });
      
      // Invalida lista allenamenti
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.list(teamId) });
      
      toast.success('Allenamento eliminato con successo!');
    },
    onError: (error: any) => {
      console.error('Delete training error:', error);
      toast.error(error.message || 'Errore durante l\'eliminazione dell\'allenamento');
    },
  });
}

// Hook per gestire le presenze
export function useTrainingAttendance(teamId: string, trainingId: string) {
  const queryClient = useQueryClient();
  
  // Query per ottenere le presenze
  const attendanceQuery = useQuery({
    queryKey: queryKeys.trainings.attendance(trainingId),
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}/attendance`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 30 * 1000, // 30 secondi - dati più freschi per le presenze
    enabled: !!teamId && !!trainingId,
  });
  
  // Mutation per aggiornare le presenze
  const updateAttendance = useMutation({
    mutationFn: async (attendanceData: AttendanceData[]) => {
      const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: attendanceData }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update attendance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalida cache delle presenze
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.attendance(trainingId) });
      
      // Invalida anche i dati del training (potrebbe avere statistiche delle presenze)
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.detail(trainingId) });
      
      toast.success('Presenze aggiornate con successo!');
    },
    onError: (error: any) => {
      console.error('Update attendance error:', error);
      toast.error(error.message || 'Errore durante l\'aggiornamento delle presenze');
    },
  });
  
  // Mutation per aggiornare singola presenza
  const updateSingleAttendance = useMutation({
    mutationFn: async ({ playerId, status, notes }: { playerId: string; status: AttendanceData['status']; notes?: string }) => {
      const response = await fetch(`/api/attendance/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingId, status, notes }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update attendance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.attendance(trainingId) });
    },
  });
  
  return {
    attendance: attendanceQuery.data || [],
    isLoading: attendanceQuery.isLoading,
    error: attendanceQuery.error,
    updateAttendance: updateAttendance.mutate,
    updateSingleAttendance: updateSingleAttendance.mutate,
    isUpdating: updateAttendance.isPending,
    isUpdatingSingle: updateSingleAttendance.isPending,
    refetch: attendanceQuery.refetch,
  };
}

// Hook per ottenere prossimi allenamenti (dashboard)
export function useUpcomingTrainings(teamId?: string, limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.trainings.lists(), 'upcoming', teamId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', 'upcoming');
      params.append('limit', limit.toString());
      params.append('sortBy', 'date');
      params.append('sortOrder', 'asc');
      
      const url = teamId 
        ? `/api/teams/${teamId}/trainings?${params}`
        : `/api/trainings?${params}`; // Endpoint per tutti i teams dell'utente
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = new Error(`Failed to fetch upcoming trainings: ${response.statusText}`) as any;
        error.status = response.status;
        throw error;
      }
      
      return response.json();
    },
    staleTime: QUERY_STALE_TIMES.trainings,
    retry: false, // Disabilita retry per questo hook
  });
}

// Hook per statistiche allenamenti
export function useTrainingStats(teamId: string, period = '30') {
  return useQuery({
    queryKey: [...queryKeys.trainings.list(teamId), 'stats', period],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/trainings/stats?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch training stats: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: QUERY_STALE_TIMES.trainings,
    enabled: !!teamId,
  });
}

// Hook combinato per tutte le operazioni training
export function useTrainingOperations(teamId: string, filters: TrainingFilters = {}) {
  const trainings = useTrainings(teamId, filters);
  const createTraining = useCreateTraining(teamId);
  const updateTraining = useUpdateTraining(teamId);
  const deleteTraining = useDeleteTraining(teamId);
  const upcomingTrainings = useUpcomingTrainings(teamId);
  const stats = useTrainingStats(teamId);
  
  return {
    // Data
    trainings: trainings.data || [],
    upcomingTrainings: upcomingTrainings.data || [],
    stats: stats.data,
    isLoading: trainings.isLoading,
    error: trainings.error,
    
    // CRUD Operations
    createTraining: createTraining.mutate,
    updateTraining: updateTraining.mutate,
    deleteTraining: deleteTraining.mutate,
    
    // States
    isCreating: createTraining.isPending,
    isUpdating: updateTraining.isPending,
    isDeleting: deleteTraining.isPending,
    
    // Helpers
    refetch: trainings.refetch,
  };
}