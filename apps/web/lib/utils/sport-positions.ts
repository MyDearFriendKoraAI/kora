export function getSportPositions(sport: string): string[] {
  const positions: Record<string, string[]> = {
    'calcio': [
      'Portiere',
      'Difensore centrale',
      'Terzino destro',
      'Terzino sinistro',
      'Centrocampista centrale',
      'Mediano',
      'Trequartista',
      'Ala destra',
      'Ala sinistra',
      'Attaccante',
      'Prima punta'
    ],
    'calcio a 5': [
      'Portiere',
      'Centrale',
      'Laterale',
      'Pivot',
      'Universale'
    ],
    'basket': [
      'Playmaker',
      'Guardia',
      'Ala piccola',
      'Ala grande',
      'Centro'
    ],
    'pallavolo': [
      'Palleggiatore',
      'Schiacciatore',
      'Centrale',
      'Opposto',
      'Libero'
    ],
    'rugby': [
      'Pilone',
      'Tallonatore',
      'Seconda linea',
      'Terza linea',
      'Mediano di mischia',
      'Mediano di apertura',
      'Centro',
      'Ala',
      'Estremo'
    ],
    'tennis': [
      'Singolarista',
      'Doppista'
    ],
    'nuoto': [
      'Stile libero',
      'Dorso',
      'Rana',
      'Farfalla',
      'Misti'
    ],
    'atletica': [
      'Velocista',
      'Mezzofondista',
      'Fondista',
      'Saltatore',
      'Lanciatore'
    ]
  }

  return positions[sport.toLowerCase()] || ['Giocatore']
}