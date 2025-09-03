import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Droplets, Zap } from "lucide-react";

interface DailyLog {
  date: string;
  weight: number;
  hydration: number;
  energyLevel: number;
  notes?: string;
}

interface ProgressTrackerProps {
  targetWeight: number;
  currentWeight: number;
  weightUnit: string;
}

export const ProgressTracker = ({ targetWeight, currentWeight, weightUnit }: ProgressTrackerProps) => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [todayLog, setTodayLog] = useState({
    weight: '',
    hydration: '',
    energyLevel: '5',
    notes: ''
  });

  const totalWeightToLose = currentWeight - targetWeight;
  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : currentWeight;
  const weightLost = currentWeight - latestWeight;
  const progressPercentage = (weightLost / totalWeightToLose) * 100;

  const handleSubmitLog = () => {
    const newLog: DailyLog = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(todayLog.weight),
      hydration: parseFloat(todayLog.hydration),
      energyLevel: parseInt(todayLog.energyLevel),
      notes: todayLog.notes
    };
    
    setLogs([...logs, newLog]);
    setTodayLog({ weight: '', hydration: '', energyLevel: '5', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Progress Tracker</h2>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Cut Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Current: {latestWeight} {weightUnit}</span>
              <span>Target: {targetWeight} {weightUnit}</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="w-full" />
            <div className="text-center">
              <Badge variant={progressPercentage >= 100 ? "default" : "secondary"}>
                {weightLost.toFixed(1)} {weightUnit} of {totalWeightToLose.toFixed(1)} {weightUnit} lost
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Log Input */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="todayWeight">Current Weight ({weightUnit})</Label>
              <Input
                id="todayWeight"
                type="number"
                step="0.1"
                value={todayLog.weight}
                onChange={(e) => setTodayLog({ ...todayLog, weight: e.target.value })}
                placeholder={`e.g., ${latestWeight}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hydration">Water Intake (oz)</Label>
              <Input
                id="hydration"
                type="number"
                value={todayLog.hydration}
                onChange={(e) => setTodayLog({ ...todayLog, hydration: e.target.value })}
                placeholder="e.g., 64"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="energy">Energy Level (1-10)</Label>
              <Input
                id="energy"
                type="number"
                min="1"
                max="10"
                value={todayLog.energyLevel}
                onChange={(e) => setTodayLog({ ...todayLog, energyLevel: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={todayLog.notes}
                onChange={(e) => setTodayLog({ ...todayLog, notes: e.target.value })}
                placeholder="How are you feeling?"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSubmitLog} 
            className="w-full mt-4"
            disabled={!todayLog.weight || !todayLog.hydration}
          >
            Log Today's Progress
          </Button>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.slice(-5).reverse().map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{new Date(log.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      <span>{log.weight} {weightUnit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>{log.hydration} oz</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>{log.energyLevel}/10</span>
                    </div>
                  </div>
                  {log.notes && (
                    <span className="text-sm text-muted-foreground">{log.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};