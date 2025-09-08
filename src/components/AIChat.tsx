import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestion?: {
    title: string;
    description: string;
    changes: {
      day: number | null;
      field: string;
      action: string;
      content: string;
    };
  };
}

interface AIChatProps {
  planData: any;
  planId?: string;
  onPlanUpdate?: (updatedPlan: any) => void;
}

export const AIChat = ({ planData, planId, onPlanUpdate }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI nutrition coach. I can help you modify your plan, answer questions about nutrition, or suggest alternatives to foods you don't like. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-nutrition-chat', {
        body: {
          message: currentInput,
          planData: planData
        }
      });

      if (error) {
        throw error;
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestion: data.actionable ? data.suggestion : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const applyPlanChange = async (suggestion: any) => {
    if (!planId || !planData) {
      toast({
        title: "Error",
        description: "Cannot update plan at this time.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clone the current plan data
      const updatedPlan = [...planData];
      const { day, field, action, content } = suggestion.changes;

      if (day !== null) {
        // Apply to specific day
        const dayIndex = day - 1;
        if (dayIndex >= 0 && dayIndex < updatedPlan.length) {
          if (action === 'replace') {
            updatedPlan[dayIndex][field] = content;
          } else if (action === 'add') {
            if (field === 'meals') {
              // Add to existing meals
              const meals = updatedPlan[dayIndex][field];
              if (typeof meals === 'object') {
                meals.snacks = meals.snacks ? `${meals.snacks}, ${content}` : content;
              }
            } else {
              updatedPlan[dayIndex][field] = Array.isArray(updatedPlan[dayIndex][field]) 
                ? [...updatedPlan[dayIndex][field], content]
                : content;
            }
          }
        }
      } else {
        // Apply to all days
        updatedPlan.forEach((dayPlan: any) => {
          if (action === 'replace') {
            dayPlan[field] = content;
          } else if (action === 'add') {
            if (field === 'meals' && typeof dayPlan[field] === 'object') {
              dayPlan[field].snacks = dayPlan[field].snacks ? `${dayPlan[field].snacks}, ${content}` : content;
            } else {
              dayPlan[field] = Array.isArray(dayPlan[field]) 
                ? [...dayPlan[field], content]
                : content;
            }
          }
        });
      }

      // Update the plan in Supabase
      const { error: updateError } = await supabase
        .from('weight_cutting_plans')
        .update({ ai_generated_plan: updatedPlan })
        .eq('id', planId);

      if (updateError) {
        throw updateError;
      }

      // Call the callback to refresh the plan view
      if (onPlanUpdate) {
        onPlanUpdate(updatedPlan);
      }

      toast({
        title: "Plan Updated",
        description: `Successfully applied: ${suggestion.title}`,
      });

    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Update Failed",
        description: "Could not update the plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Nutrition Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`flex-1 space-y-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}>
                    {message.content}
                  </div>
                  {message.suggestion && (
                    <div className="mt-2 p-3 bg-accent/50 rounded-lg border">
                      <div className="text-sm font-medium mb-1">{message.suggestion.title}</div>
                      <div className="text-xs text-muted-foreground mb-2">{message.suggestion.description}</div>
                      <Button 
                        size="sm" 
                        onClick={() => applyPlanChange(message.suggestion)}
                        className="text-xs"
                      >
                        Apply to Plan
                      </Button>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-3 py-2 rounded-lg text-sm bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about nutrition, alternatives, or modifications..."
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};