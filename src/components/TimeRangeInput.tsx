import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Calendar } from "lucide-react";

interface TimeRangeInputProps {
  label: string;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  index: number;
}

export function TimeRangeInput({
  label,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  index,
}: TimeRangeInputProps) {
  return (
    <div 
      className="glass-panel p-4 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        <span className="font-semibold text-foreground">{label}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Start Time
          </Label>
          <Input
            type="datetime-local"
            value={startValue}
            onChange={(e) => onStartChange(e.target.value)}
            className="input-cyber text-sm font-mono"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            End Time
          </Label>
          <Input
            type="datetime-local"
            value={endValue}
            onChange={(e) => onEndChange(e.target.value)}
            className="input-cyber text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
}
