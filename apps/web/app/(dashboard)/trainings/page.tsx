import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrainingsPage() {
  const trainings = [
    {
      id: "1",
      titolo: "Allenamento Tattico",
      data: "2024-01-15",
      ora: "18:00",
      squadra: "Squadra A",
      durata: "90 min",
      partecipanti: 18,
    },
    {
      id: "2",
      titolo: "Preparazione Fisica",
      data: "2024-01-16",
      ora: "17:30",
      squadra: "Under 18",
      durata: "75 min",
      partecipanti: 14,
    },
    {
      id: "3",
      titolo: "Tecnica Individuale",
      data: "2024-01-17",
      ora: "19:00",
      squadra: "Femminile",
      durata: "60 min",
      partecipanti: 12,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allenamenti</h1>
          <p className="text-gray-600">Programma e gestisci gli allenamenti</p>
        </div>
        <Button>Nuovo Allenamento</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {trainings.map((training) => (
            <Card key={training.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{training.titolo}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {training.squadra}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Data</p>
                    <p className="font-medium">{training.data}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ora</p>
                    <p className="font-medium">{training.ora}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Durata</p>
                    <p className="font-medium">{training.durata}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Partecipanti</p>
                    <p className="font-medium">{training.partecipanti}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm">
                    Modifica
                  </Button>
                  <Button variant="outline" size="sm">
                    Presenze
                  </Button>
                  <Button variant="outline" size="sm">
                    Dettagli
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiche Mensili</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Allenamenti totali:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Presenza media:</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ore totali:</span>
                <span className="font-medium">18h</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prossimi Allenamenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="text-sm font-medium">Oggi, 18:00</p>
                  <p className="text-xs text-gray-500">Squadra A - Tattico</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm font-medium">Domani, 17:30</p>
                  <p className="text-xs text-gray-500">Under 18 - Fisico</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3">
                  <p className="text-sm font-medium">Mercoledì, 19:00</p>
                  <p className="text-xs text-gray-500">Femminile - Tecnica</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}