import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranscriptionStore } from "../store/transcription-view-store";

export function TranscriptionTabs() {
  const { metadata, segments } = useTranscriptionStore();

  return (
    <Tabs defaultValue="transcript" className="space-y-4">
      <TabsList>
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
        <TabsTrigger value="summary">Summary</TabsTrigger>
      </TabsList>

      <TabsContent value="transcript">
        <div className="border rounded-md p-4 h-[400px] overflow-y-auto">
          {segments.map((segment, index) => (
            <div key={index} className="p-2 border-b">
              <p>
                <strong>{segment.speaker}:</strong> {segment.text}
              </p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="summary">
        <div className="border rounded-md p-4 h-[400px] overflow-y-auto">
          <p>{metadata.summary}</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
