import { extractUrlsFromHtml } from "@/lib/bookmark-utils";
import { ExternalLink, Shield, Activity } from "lucide-react";

interface BookmarkPreviewProps {
  content: string;
}

export function BookmarkPreview({ content }: BookmarkPreviewProps) {
  const urls = extractUrlsFromHtml(content);

  if (urls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No compatible URLs detected</p>
        <p className="text-sm mt-1">Upload a bookmarks file to see preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
      {urls.map((item, index) => (
        <div
          key={index}
          className="glass-panel p-3 animate-slide-up hover:border-primary/50 transition-colors"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-md ${
              item.type === 'arkime' ? 'bg-primary/20' : 'bg-success/20'
            }`}>
              {item.type === 'arkime' ? (
                <Shield className="w-4 h-4 text-primary" />
              ) : (
                <Activity className="w-4 h-4 text-success" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{item.title || 'Untitled'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.type === 'arkime' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-success/20 text-success'
                }`}>
                  {item.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                {item.url.substring(0, 80)}...
              </p>
            </div>
            
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-secondary rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
