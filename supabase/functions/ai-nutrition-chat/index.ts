import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // Get the OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('OpenAI API Key exists:', !!openAIApiKey);
    console.log('Request received with message:', message);
    console.log('Function is running - timestamp:', new Date().toISOString());

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    // Create context from plan data if available
    let systemPrompt = `You are a knowledgeable nutrition and weight cutting coach. You help athletes with their nutrition plans, provide food alternatives, and offer safe weight cutting advice. Always prioritize athlete health and safety.

Key guidelines:
- Provide practical, actionable advice
- Suggest healthy food alternatives when requested
- Never recommend dangerous rapid weight loss methods
- Keep responses concise but informative
- If asked about substituting foods, provide multiple alternatives with similar nutritional profiles

IMPORTANT: When you provide suggestions that can be applied to the user's plan (like adding workouts, changing meals, adjusting hydration), format your response as JSON with this structure:
{
  "response": "Your regular conversational response",
  "actionable": true,
  "suggestion": {
    "title": "Brief title of the change",
    "description": "What will be changed",
    "changes": {
      "day": number (1-7, or null for all days),
      "field": "meals" | "workout" | "hydration" | "recovery",
      "action": "replace" | "add" | "modify",
      "content": "The new content or modification"
    }
  }
}

If your response is just informational without actionable changes, respond normally without JSON formatting.`;

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

    // Try to parse as JSON for actionable suggestions
    let responseData;
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.actionable && parsed.suggestion) {
        responseData = parsed;
      } else {
        responseData = { response: aiResponse, actionable: false };
      }
    } catch {
      // Not JSON, treat as regular response
      responseData = { response: aiResponse, actionable: false };
    }

    return new Response(JSON.stringify(responseData), {
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