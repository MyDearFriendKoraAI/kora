import ChatInterface from "@/components/features/ai/chat-interface";

export default function AICoachPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Coach</h1>
        <p className="text-gray-600">Chiedi consigli al tuo assistente AI per allenatori</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatInterface />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Suggerimenti Rapidi</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Come migliorare la resistenza della squadra?
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Strategie per motivare i giocatori
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Esercizi per il lavoro di squadra
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Statistiche AI</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Domande questo mese:</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span>Suggerimenti utilizzati:</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span>Valutazione media:</span>
                <span className="font-medium">4.8/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}