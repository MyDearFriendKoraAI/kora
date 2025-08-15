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
                <span>Richieste oggi:</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span>Token risparmiati:</span>
                <span className="font-medium text-green-600">~70%</span>
              </div>
              <div className="flex justify-between">
                <span>Efficienza prompt:</span>
                <span className="font-medium text-blue-600">Ottimizzata</span>
              </div>
              <div className="flex justify-between">
                <span>Modello:</span>
                <span className="font-medium">GPT-4o-mini</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
              ⚡ Sistema ottimizzato per massime prestazioni e risparmio costi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}