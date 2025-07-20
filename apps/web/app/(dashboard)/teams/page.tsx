import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function TeamsPage() {
  const teams = [
    {
      id: "1",
      nome: "Squadra A",
      sport: "calcio",
      giocatori: 22,
      allenamenti: 5,
    },
    {
      id: "2",
      nome: "Under 18",
      sport: "basket",
      giocatori: 15,
      allenamenti: 3,
    },
    {
      id: "3",
      nome: "Femminile",
      sport: "volley",
      giocatori: 12,
      allenamenti: 4,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Le Mie Squadre</h1>
          <p className="text-gray-600">Gestisci le tue squadre sportive</p>
        </div>
        <Button>Aggiungi Squadra</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{team.nome}</span>
                <span className="text-sm font-normal text-gray-500 capitalize">
                  {team.sport}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Giocatori:</span>
                  <span className="font-medium">{team.giocatori}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Allenamenti attivi:</span>
                  <span className="font-medium">{team.allenamenti}</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Gestisci
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Statistiche
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attività Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Marco Rossi aggiunto alla Squadra A</p>
                <p className="text-xs text-gray-500">2 ore fa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Allenamento completato - Under 18</p>
                <p className="text-xs text-gray-500">1 giorno fa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuova formazione salvata - Femminile</p>
                <p className="text-xs text-gray-500">2 giorni fa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}