"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CreateTrainingModal } from "@/components/features/training/create-training-modal";
import { useTeams } from "@/hooks/queries/useTeams";
import { useUpcomingTrainings } from "@/hooks/queries/useTrainings";
import moment from "moment";
import "moment/locale/it";

moment.locale("it");

export default function TrainingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { teams } = useTeams();
  const firstTeamId = teams?.[0]?.id || "";
  const upcomingTrainingsQuery = useUpcomingTrainings();
  
  console.log('Teams:', teams);
  console.log('First team ID:', firstTeamId);
  console.log('useUpcomingTrainings full result:', upcomingTrainingsQuery);
  console.log('Trainings data:', upcomingTrainingsQuery.data);
  console.log('Is loading:', upcomingTrainingsQuery.isLoading);
  console.log('Is error:', upcomingTrainingsQuery.isError);
  console.log('Error:', upcomingTrainingsQuery.error);

  const trainings = upcomingTrainingsQuery.data;
  const isLoading = upcomingTrainingsQuery.isLoading;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
          ) : trainings && trainings.length > 0 ? (
            <div className="space-y-4">
              {trainings.map((training: any) => (
                <Card key={training.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{training.type === 'REGULAR' ? 'Allenamento Regolare' : training.type}</h3>
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
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          training.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                          training.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {training.status === 'SCHEDULED' ? 'Programmato' :
                           training.status === 'COMPLETED' ? 'Completato' :
                           training.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
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
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiche Mensili</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Allenamenti totali:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Presenza media:</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ore totali:</span>
                <span className="font-medium">0h</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prossimi Allenamenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Nessun allenamento programmato</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Training Modal */}
      {firstTeamId && (
        <CreateTrainingModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          teamId={firstTeamId}
        />
      )}
    </div>
  );
}