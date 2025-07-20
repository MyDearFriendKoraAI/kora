import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCoachSuggestion(
  prompt: string,
  context?: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Sei un AI coach esperto per squadre sportive italiane. 
                   Fornisci consigli pratici e specifici per allenatori e squadre.
                   Rispondi sempre in italiano con un tono professionale ma amichevole.
                   ${context ? `Contesto: ${context}` : ''}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Spiacente, non riesco a generare un suggerimento al momento.';
  } catch (error) {
    console.error('Errore OpenAI:', error);
    return 'Spiacente, si è verificato un errore nel generare il suggerimento.';
  }
}