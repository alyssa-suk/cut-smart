import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, planData } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create context from plan data if available
    let systemPrompt = `You are a knowledgeable nutrition and weight cutting coach. You help athletes with their nutrition plans, provide food alternatives, and offer safe weight cutting advice. Always prioritize athlete health and safety.

Key guidelines:
- Provide practical, actionable advice
- Suggest healthy food alternatives when requested
- Never recommend dangerous rapid weight loss methods
- Keep responses concise but informative
- If asked about substituting foods, provide multiple alternatives with similar nutritional profiles`;

    if (planData && planData.length > 0) {
      systemPrompt += `\n\nCurrent user's plan context: The user has a ${planData.length}-day weight cutting plan with daily meals, hydration, and workout recommendations. Use this context when providing advice.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-nutrition-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get AI response',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});