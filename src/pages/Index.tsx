import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Download, Upload, Target, FlaskConical, FolderArchive, Crosshair,
  RefreshCw, Copy, FileCode2, Clock, Calendar, ExternalLink, Shield, Activity
} from "lucide-react";

// Types
interface TimeRange { start: string; end: string; }
interface HuntConfig { [key: string]: TimeRange; }

// Utility functions
const dateToUnixTimestamp = (dateStr: string) => Math.floor(new Date(dateStr).getTime() / 1000);
const dateToISO8601 = (dateStr: string) => new Date(dateStr).toISOString();

const detectUrlType = (url: string): 'arkime' | 'kibana' | 'unknown' => {
  if (url.includes('startTime=') && url.includes('stopTime=')) return 'arkime';
  if (url.includes("from:'") && url.includes("to:'")) return 'kibana';
  return 'unknown';
};

const updateArkimeUrl = (url: string, startTime: string, endTime: string) => {
  return url
    .replace(/stopTime=\d+/g, `stopTime=${dateToUnixTimestamp(endTime)}`)
    .replace(/startTime=\d+/g, `startTime=${dateToUnixTimestamp(startTime)}`);
};

const updateKibanaUrl = (url: string, startTime: string, endTime: string) => {
  return url
    .replace(/from:'[^']+'/g, `from:'${dateToISO8601(startTime)}'`)
    .replace(/to:'[^']+'/g, `to:'${dateToISO8601(endTime)}'`);
};

const updateBookmarkContent = (content: string, hunts: HuntConfig, tests: HuntConfig) => {
  let updated = content;
  const processConfig = (config: HuntConfig, prefix: string) => {
    Object.entries(config).forEach(([key, timeRange]) => {
      const num = key.replace(prefix, '');
      const regex = new RegExp(`(${prefix}\\s*${num}[^<]*<A[^>]*HREF=")([^"]+)`, 'gi');
      updated = updated.replace(regex, (_, pre, url) => {
        const type = detectUrlType(url);
        if (type === 'arkime') return pre + updateArkimeUrl(url, timeRange.start, timeRange.end);
        if (type === 'kibana') return pre + updateKibanaUrl(url, timeRange.start, timeRange.end);
        return pre + url;
      });
    });
  };
  processConfig(hunts, 'Hunt');
  processConfig(tests, 'Test');
  return updated;
};

const extractUrlsFromHtml = (content: string) => {
  const regex = /<A[^>]*HREF="([^"]+)"[^>]*>([^<]*)</gi;
  const matches: { title: string; url: string; type: string }[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const type = detectUrlType(match[1]);
    if (type !== 'unknown') matches.push({ title: match[2], url: match[1], type });
  }
  return matches;
};

// Components
const TimeRangeInput = ({ label, startValue, endValue, onStartChange, onEndChange, index }: {
  label: string; startValue: string; endValue: string;
  onStartChange: (v: string) => void; onEndChange: (v: string) => void; index: number;
}) => (
  <div className="glass-panel p-4 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
      <span className="font-semibold text-foreground">{label}</span>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />Start Time
        </Label>
        <Input type="datetime-local" value={startValue} onChange={(e) => onStartChange(e.target.value)} className="input-cyber text-sm font-mono" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />End Time
        </Label>
        <Input type="datetime-local" value={endValue} onChange={(e) => onEndChange(e.target.value)} className="input-cyber text-sm font-mono" />
      </div>
    </div>
  </div>
);

const BookmarkPreview = ({ content }: { content: string }) => {
  const urls = extractUrlsFromHtml(content);
  if (!urls.length) return (
    <div className="text-center py-8 text-muted-foreground">
      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No compatible URLs detected</p>
      <p className="text-sm mt-1">Upload a bookmarks file to see preview</p>
    </div>
  );
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
      {urls.map((item, i) => (
        <div key={i} className="glass-panel p-3 animate-slide-up hover:border-primary/50 transition-colors" style={{ animationDelay: `${i * 30}ms` }}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-md ${item.type === 'arkime' ? 'bg-primary/20' : 'bg-success/20'}`}>
              {item.type === 'arkime' ? <Shield className="w-4 h-4 text-primary" /> : <Activity className="w-4 h-4 text-success" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{item.title || 'Untitled'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'arkime' ? 'bg-primary/20 text-primary' : 'bg-success/20 text-success'}`}>{item.type}</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate mt-1">{item.url.substring(0, 80)}...</p>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-secondary rounded-md transition-colors">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Page
const Index = () => {
  const [hunts, setHunts] = useState<HuntConfig>(() => Object.fromEntries([...Array(7)].map((_, i) => [`Hunt${i + 1}`, { start: "", end: "" }])));
  const [tests, setTests] = useState<HuntConfig>(() => Object.fromEntries([...Array(2)].map((_, i) => [`Test${i + 1}`, { start: "", end: "" }])));
  const [artifactDate, setArtifactDate] = useState("");
  const [bookmarkContent, setBookmarkContent] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setBookmarkContent(ev.target?.result as string); toast({ title: "File loaded", description: `${file.name} loaded` }); };
      reader.readAsText(file);
    }
  };

  const handleUpdate = () => {
    if (!bookmarkContent) { toast({ title: "No content", description: "Upload a bookmarks file first", variant: "destructive" }); return; }
    setUpdatedContent(updateBookmarkContent(bookmarkContent, hunts, tests));
    toast({ title: "Updated", description: "Timestamps updated successfully" });
  };

  const handleDownload = () => {
    if (!updatedContent) { toast({ title: "No content", description: "Update bookmarks first", variant: "destructive" }); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([updatedContent], { type: "text/html" }));
    a.download = `bookmarks_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    toast({ title: "Downloaded" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 glow-primary"><Crosshair className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Bookmark Time Updater</h1>
            <p className="text-xs text-muted-foreground">SOC Analyst Tool • Arkime & Kibana</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="artifacts" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                <TabsTrigger value="artifacts" className="flex items-center gap-2"><FolderArchive className="w-4 h-4" />Artifacts</TabsTrigger>
                <TabsTrigger value="hunts" className="flex items-center gap-2"><Target className="w-4 h-4" />Hunts</TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center gap-2"><FlaskConical className="w-4 h-4" />Tests</TabsTrigger>
              </TabsList>
              <TabsContent value="artifacts" className="mt-4">
                <div className="glass-panel p-4">
                  <Label className="text-sm font-medium mb-2 block">Artifacts Start Date</Label>
                  <Input type="date" value={artifactDate} onChange={(e) => setArtifactDate(e.target.value)} className="input-cyber font-mono" />
                  <p className="text-xs text-muted-foreground mt-2">Starting point for Artifact folders</p>
                </div>
              </TabsContent>
              <TabsContent value="hunts" className="mt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.keys(hunts).map((k, i) => (
                    <TimeRangeInput key={k} label={`Hunt ${i + 1}`} startValue={hunts[k].start} endValue={hunts[k].end}
                      onStartChange={(v) => setHunts(p => ({ ...p, [k]: { ...p[k], start: v } }))}
                      onEndChange={(v) => setHunts(p => ({ ...p, [k]: { ...p[k], end: v } }))} index={i} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tests" className="mt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.keys(tests).map((k, i) => (
                    <TimeRangeInput key={k} label={`Test ${i + 1}`} startValue={tests[k].start} endValue={tests[k].end}
                      onStartChange={(v) => setTests(p => ({ ...p, [k]: { ...p[k], start: v } }))}
                      onEndChange={(v) => setTests(p => ({ ...p, [k]: { ...p[k], end: v } }))} index={i} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="glass-panel p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2"><FileCode2 className="w-4 h-4 text-primary" />Bookmark Content</Label>
                <div className="flex gap-2">
                  <label>
                    <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                    <Button variant="outline" size="sm" asChild><span className="cursor-pointer"><Upload className="w-4 h-4 mr-1" />Upload</span></Button>
                  </label>
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(updatedContent || bookmarkContent); toast({ title: "Copied" }); }}>
                    <Copy className="w-4 h-4 mr-1" />Copy
                  </Button>
                </div>
              </div>
              <Textarea value={bookmarkContent} onChange={(e) => setBookmarkContent(e.target.value)} placeholder="Paste bookmarks HTML or upload a file..." className="input-cyber font-mono text-xs min-h-32 resize-y" />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleUpdate} className="flex-1" variant="cyber"><RefreshCw className="w-4 h-4 mr-2" />Update Timestamps</Button>
              <Button onClick={handleDownload} variant="success" disabled={!updatedContent}><Download className="w-4 h-4 mr-2" />Download</Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-panel p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success animate-pulse" />URL Preview</h3>
              <BookmarkPreview content={updatedContent || bookmarkContent} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel p-4 text-center">
                <div className="text-2xl font-bold text-primary">{Object.values(hunts).filter(h => h.start && h.end).length}</div>
                <div className="text-xs text-muted-foreground">Hunts Configured</div>
              </div>
              <div className="glass-panel p-4 text-center">
                <div className="text-2xl font-bold text-success">{Object.values(tests).filter(t => t.start && t.end).length}</div>
                <div className="text-xs text-muted-foreground">Tests Configured</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
