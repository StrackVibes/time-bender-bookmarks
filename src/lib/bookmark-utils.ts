export interface TimeRange {
  start: string;
  end: string;
}

export interface HuntConfig {
  [key: string]: TimeRange;
}

export function dateToUnixTimestamp(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

export function dateToISO8601(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

export function updateArkimeUrl(url: string, startTime: string, endTime: string): string {
  const startUnix = dateToUnixTimestamp(startTime);
  const endUnix = dateToUnixTimestamp(endTime);
  
  let updatedUrl = url.replace(/stopTime=\d+/g, `stopTime=${endUnix}`);
  updatedUrl = updatedUrl.replace(/startTime=\d+/g, `startTime=${startUnix}`);
  
  return updatedUrl;
}

export function updateKibanaUrl(url: string, startTime: string, endTime: string): string {
  const startISO = dateToISO8601(startTime);
  const endISO = dateToISO8601(endTime);
  
  let updatedUrl = url.replace(/from:'[^']+'/g, `from:'${startISO}'`);
  updatedUrl = updatedUrl.replace(/to:'[^']+'/g, `to:'${endISO}'`);
  
  return updatedUrl;
}

export function detectUrlType(url: string): 'arkime' | 'kibana' | 'unknown' {
  if (url.includes('startTime=') && url.includes('stopTime=')) {
    return 'arkime';
  }
  if (url.includes("from:'") && url.includes("to:'")) {
    return 'kibana';
  }
  return 'unknown';
}

export function updateBookmarkContent(
  content: string,
  hunts: HuntConfig,
  tests: HuntConfig,
  artifactStartDate: string
): string {
  let updatedContent = content;
  
  // Process Hunt folders
  Object.entries(hunts).forEach(([key, timeRange]) => {
    const huntNumber = key.replace('Hunt', '');
    const huntRegex = new RegExp(`(Hunt\\s*${huntNumber}[^<]*<A[^>]*HREF=")([^"]+)`, 'gi');
    
    updatedContent = updatedContent.replace(huntRegex, (match, prefix, url) => {
      const urlType = detectUrlType(url);
      let newUrl = url;
      
      if (urlType === 'arkime') {
        newUrl = updateArkimeUrl(url, timeRange.start, timeRange.end);
      } else if (urlType === 'kibana') {
        newUrl = updateKibanaUrl(url, timeRange.start, timeRange.end);
      }
      
      return prefix + newUrl;
    });
  });
  
  // Process Test folders
  Object.entries(tests).forEach(([key, timeRange]) => {
    const testNumber = key.replace('Test', '');
    const testRegex = new RegExp(`(Test\\s*${testNumber}[^<]*<A[^>]*HREF=")([^"]+)`, 'gi');
    
    updatedContent = updatedContent.replace(testRegex, (match, prefix, url) => {
      const urlType = detectUrlType(url);
      let newUrl = url;
      
      if (urlType === 'arkime') {
        newUrl = updateArkimeUrl(url, timeRange.start, timeRange.end);
      } else if (urlType === 'kibana') {
        newUrl = updateKibanaUrl(url, timeRange.start, timeRange.end);
      }
      
      return prefix + newUrl;
    });
  });
  
  return updatedContent;
}

export function extractUrlsFromHtml(content: string): { title: string; url: string; type: string }[] {
  const urlRegex = /<A[^>]*HREF="([^"]+)"[^>]*>([^<]*)</gi;
  const matches: { title: string; url: string; type: string }[] = [];
  let match;
  
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[1];
    const title = match[2];
    const type = detectUrlType(url);
    
    if (type !== 'unknown') {
      matches.push({ title, url, type });
    }
  }
  
  return matches;
}
