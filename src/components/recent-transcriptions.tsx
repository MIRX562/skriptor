import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FileAudio, FileText } from "lucide-react"

export function RecentTranscriptions() {
  const transcriptions = [
    {
      id: "1",
      title: "Team Meeting - May 10",
      date: "2 hours ago",
      status: "completed",
      duration: "45:12",
      type: "audio",
    },
    {
      id: "2",
      title: "Interview with John Smith",
      date: "Yesterday",
      status: "completed",
      duration: "32:08",
      type: "audio",
    },
    {
      id: "3",
      title: "Product Feedback Session",
      date: "2 days ago",
      status: "completed",
      duration: "28:45",
      type: "audio",
    },
    {
      id: "4",
      title: "Marketing Strategy",
      date: "3 days ago",
      status: "completed",
      duration: "51:30",
      type: "audio",
    },
  ]

  return (
    <div className="space-y-4">
      {transcriptions.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-lg border p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <Avatar className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800">
            <AvatarFallback className="rounded-md">
              {item.type === "audio" ? (
                <FileAudio className="h-5 w-5 text-slate-500" />
              ) : (
                <FileText className="h-5 w-5 text-slate-500" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{item.title}</p>
              <Badge variant="outline" className="text-xs font-normal">
                {item.duration}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
