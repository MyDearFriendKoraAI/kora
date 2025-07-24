"use client";

import { useState } from "react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CreateTrainingModal } from "@/components/features/training/create-training-modal";
import { EditTrainingModal } from "@/components/features/training/edit-training-modal";
import { useTeams } from "@/hooks/queries/useTeams";
import { useUpcomingTrainings } from "@/hooks/queries/useTrainings";
import moment from "moment";
import "moment/locale/it";
import { Edit } from "lucide-react";

moment.locale("it");

// Componente per visualizzare singolo allenamento
function TrainingCard({ training, showEdit = false, onEdit }: { training: any; showEdit?: boolean; onEdit?: (training: any) => void }) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(training);
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">
          {training.type === 'REGULAR' ? 'Allenamento Regolare' : 
           training.type === 'TACTICAL' ? 'Tattico' :
           training.type === 'TECHNICAL' ? 'Tecnico' :
           training.type === 'PHYSICAL' ? 'Fisico' :
           training.type === 'MATCH_PREP' ? 'Preparazione Partita' :
           training.type === 'RECOVERY' ? 'Recupero' :
           training.type}
        </h3>
        <p className="text-gray-600 mt-1">
          {moment(training.date).format('dddd DD MMMM, HH:mm')} - {training.duration} minuti
        </p>
        {training.location && (
          <p className="text-gray-500 text-sm mt-1">📍 {training.location}</p>
        )}
        <div className="flex items-center gap-4 mt-2">
          <span className="text-sm text-gray-600">
            Squadra: <span className="font-medium">{training.team?.name}</span>
          </span>
          {training.plannedPlayers && (
            <span className="text-sm text-gray-600">
              Giocatori previsti: <span className="font-medium">{training.plannedPlayers}</span>
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          training.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
          training.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {training.status === 'SCHEDULED' ? 'Programmato' :
           training.status === 'COMPLETED' ? 'Completato' :
           training.status}
        </span>
        {showEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="p-2"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TrainingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const { teams } = useTeams();
  const firstTeamId = teams?.[0]?.id || "";
  const upcomingTrainingsQuery = useUpcomingTrainings();
  
  const trainings = upcomingTrainingsQuery.data;
  const isLoading = upcomingTrainingsQuery.isLoading;
  
  // Calcola le statistiche mensili
  const monthlyStats = React.useMemo(() => {
    if (!trainings || trainings.length === 0) {
      return {
        totalTrainings: 0,
        averageAttendance: 0,
        totalHours: 0
      };
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTrainings = trainings.filter((training: any) => {
      const trainingDate = new Date(training.date);
      return trainingDate.getMonth() === currentMonth && trainingDate.getFullYear() === currentYear;
    });
    
    const totalHours = monthlyTrainings.reduce((sum: number, training: any) => {
      return sum + (training.duration || 0);
    }, 0);
    
    return {
      totalTrainings: monthlyTrainings.length,
      averageAttendance: 0, // TODO: calcolare quando avremo i dati delle presenze
      totalHours: Math.round(totalHours / 60 * 10) / 10 // Converti in ore con 1 decimale
    };
  }, [trainings]);
  
  // Calcola allenamenti per layout
  const trainingsByTime = React.useMemo(() => {
    if (!trainings || trainings.length === 0) {
      return {
        todayTraining: null,
        nextTraining: null,
        upcomingTrainings: []
      };
    }
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Allenamento di oggi
    const todayTraining = trainings.find((training: any) => {
      const trainingDate = new Date(training.date);
      trainingDate.setHours(0, 0, 0, 0);
      return trainingDate.getTime() === today.getTime();
    });
    
    // Allenamenti futuri ordinati per data
    const futureTrainings = trainings
      .filter((training: any) => new Date(training.date) > now)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Prossimo allenamento
    const nextTraining = futureTrainings[0] || null;
    
    // Altri allenamenti programmati (escluso il prossimo)
    const upcomingTrainings = futureTrainings.slice(1);
    
    return {
      todayTraining,
      nextTraining,
      upcomingTrainings
    };
  }, [trainings]);

  return (
    <div className="space-y-6 pb-safe">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allenamenti</h1>
          <p className="text-gray-600">Programma e gestisci gli allenamenti</p>
        </div>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => setShowCreateModal(true)}
          disabled={!firstTeamId}
        >
          Nuovo Allenamento
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Allenamento Odierno */}
          {trainingsByTime.todayTraining && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-green-700">Allenamento Odierno</CardTitle>
              </CardHeader>
              <CardContent>
                <TrainingCard 
                  training={trainingsByTime.todayTraining} 
                  showEdit={true} 
                  onEdit={(training) => {
                    setSelectedTraining(training);
                    setShowEditModal(true);
                  }} 
                />
              </CardContent>
            </Card>
          )}
          
          {/* Prossimo Allenamento */}
          {trainingsByTime.nextTraining && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-700">Prossimo Allenamento</CardTitle>
              </CardHeader>
              <CardContent>
                <TrainingCard 
                  training={trainingsByTime.nextTraining} 
                  showEdit={true} 
                  onEdit={(training) => {
                    setSelectedTraining(training);
                    setShowEditModal(true);
                  }} 
                />
              </CardContent>
            </Card>
          )}
          
          {/* Allenamenti Futuri */}
          {trainingsByTime.upcomingTrainings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Allenamenti Programmati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingsByTime.upcomingTrainings.map((training: any) => (
                    <TrainingCard 
                      key={training.id} 
                      training={training} 
                      showEdit={true} 
                      onEdit={(training) => {
                        setSelectedTraining(training);
                        setShowEditModal(true);
                      }} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Se non ci sono allenamenti */}
          {!trainingsByTime.todayTraining && !trainingsByTime.nextTraining && trainingsByTime.upcomingTrainings.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun allenamento</h3>
                  <p className="text-gray-500 mb-4">Programma il tuo primo allenamento per iniziare</p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    disabled={!firstTeamId}
                  >
                    Crea Allenamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Statistiche Mensili */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiche Mensili</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Allenamenti totali:</span>
                  <span className="font-medium">{monthlyStats.totalTrainings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Presenza media:</span>
                  <span className="font-medium">{monthlyStats.averageAttendance > 0 ? `${monthlyStats.averageAttendance}%` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ore totali:</span>
                  <span className="font-medium">{monthlyStats.totalHours}h</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo Settimanale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Questa settimana:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Prossima settimana:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Media settimanale:</span>
                  <span className="font-medium">-</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Create Training Modal */}
      {firstTeamId && (
        <CreateTrainingModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          teamId={firstTeamId}
        />
      )}
      
      {/* Edit Training Modal */}
      {selectedTraining && firstTeamId && (
        <EditTrainingModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          training={selectedTraining}
          teamId={firstTeamId}
        />
      )}
    </div>
  );
}