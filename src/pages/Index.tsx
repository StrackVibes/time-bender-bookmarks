import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeRangeInput } from "@/components/TimeRangeInput";
import { BookmarkPreview } from "@/components/BookmarkPreview";
import { updateBookmarkContent, HuntConfig, TimeRange } from "@/lib/bookmark-utils";
import { toast } from "@/hooks/use-toast";
import { 
  Download, 
  Upload, 
  Target, 
  FlaskConical, 
  FolderArchive,
  Crosshair,
  RefreshCw,
  Copy,
  FileCode2
} from "lucide-react";

const Index = () => {
  const [hunts, setHunts] = useState<HuntConfig>(() => {
    const initial: HuntConfig = {};
    for (let i = 1; i <= 7; i++) {
      initial[`Hunt${i}`] = { start: "", end: "" };
    }
    return initial;
  });

  const [tests, setTests] = useState<HuntConfig>(() => {
    const initial: HuntConfig = {};
    for (let i = 1; i <= 2; i++) {
      initial[`Test${i}`] = { start: "", end: "" };
    }
    return initial;
  });

  const [artifactDate, setArtifactDate] = useState("");
  const [bookmarkContent, setBookmarkContent] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setBookmarkContent(content);
        toast({
          title: "File loaded",
          description: `${file.name} loaded successfully`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleUpdateBookmarks = () => {
    if (!bookmarkContent) {
      toast({
        title: "No content",
        description: "Please upload a bookmarks file first",
        variant: "destructive",
      });
      return;
    }

    const result = updateBookmarkContent(bookmarkContent, hunts, tests, artifactDate);
    setUpdatedContent(result);
    toast({
      title: "Bookmarks updated",
      description: "Timestamps have been updated successfully",
    });
  };

  const handleDownload = () => {
    if (!updatedContent) {
      toast({
        title: "No updated content",
        description: "Please update bookmarks first",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([updatedContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookmarks_updated_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Updated bookmarks file has been downloaded",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(updatedContent || bookmarkContent);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const updateHunt = (huntKey: string, field: keyof TimeRange, value: string) => {
    setHunts((prev) => ({
      ...prev,
      [huntKey]: { ...prev[huntKey], [field]: value },
    }));
  };

  const updateTest = (testKey: string, field: keyof TimeRange, value: string) => {
    setTests((prev) => ({
      ...prev,
      [testKey]: { ...prev[testKey], [field]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 glow-primary">
              <Crosshair className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Bookmark Time Updater</h1>
              <p className="text-xs text-muted-foreground">SOC Analyst Tool • Arkime & Kibana</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Time Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="hunts" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                <TabsTrigger value="hunts" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Hunts
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  Tests
                </TabsTrigger>
                <TabsTrigger value="artifacts" className="flex items-center gap-2">
                  <FolderArchive className="w-4 h-4" />
                  Artifacts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hunts" className="mt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.keys(hunts).map((huntKey, index) => (
                    <TimeRangeInput
                      key={huntKey}
                      label={`Hunt ${index + 1}`}
                      startValue={hunts[huntKey].start}
                      endValue={hunts[huntKey].end}
                      onStartChange={(v) => updateHunt(huntKey, "start", v)}
                      onEndChange={(v) => updateHunt(huntKey, "end", v)}
                      index={index}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tests" className="mt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.keys(tests).map((testKey, index) => (
                    <TimeRangeInput
                      key={testKey}
                      label={`Test ${index + 1}`}
                      startValue={tests[testKey].start}
                      endValue={tests[testKey].end}
                      onStartChange={(v) => updateTest(testKey, "start", v)}
                      onEndChange={(v) => updateTest(testKey, "end", v)}
                      index={index}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="artifacts" className="mt-4">
                <div className="glass-panel p-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Artifacts Start Date
                  </Label>
                  <Input
                    type="date"
                    value={artifactDate}
                    onChange={(e) => setArtifactDate(e.target.value)}
                    className="input-cyber font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This date will be used as the starting point for Artifact folders
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Bookmark Input */}
            <div className="glass-panel p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-primary" />
                  Bookmark Content
                </Label>
                <div className="flex gap-2">
                  <label>
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </span>
                    </Button>
                  </label>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              <Textarea
                value={bookmarkContent}
                onChange={(e) => setBookmarkContent(e.target.value)}
                placeholder="Paste your bookmarks HTML content here or upload a file..."
                className="input-cyber font-mono text-xs min-h-32 resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleUpdateBookmarks}
                className="flex-1"
                variant="cyber"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Timestamps
              </Button>
              <Button
                onClick={handleDownload}
                variant="success"
                disabled={!updatedContent}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <div className="glass-panel p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                URL Preview
              </h3>
              <BookmarkPreview content={updatedContent || bookmarkContent} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {Object.values(hunts).filter(h => h.start && h.end).length}
                </div>
                <div className="text-xs text-muted-foreground">Hunts Configured</div>
              </div>
              <div className="glass-panel p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {Object.values(tests).filter(t => t.start && t.end).length}
                </div>
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
