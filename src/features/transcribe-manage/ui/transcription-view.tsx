"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Clock, Download, FileAudio, Pencil, Save, Share2, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

interface TranscriptionViewProps {
  id: string
  onBack: () => void
}

export function TranscriptionView({ id, onBack }: TranscriptionViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [transcriptText, setTranscriptText] = useState(
    `
Speaker 1 (00:00):
Good morning everyone. Thanks for joining today's team meeting. We have a lot to cover, so let's get started.

Speaker 2 (00:12):
Before we begin, can I quickly ask about the status of the Johnson project?

Speaker 1 (00:18):
Sure. We're currently on track with the Johnson project. The development team completed the first phase last week, and we're moving into testing now.

Speaker 3 (00:32):
I have some concerns about the timeline for the testing phase. I think we might need an additional week.

Speaker 1 (00:40):
Let's discuss that in detail when we get to the project updates section. For now, let's go through the agenda.

Speaker 2 (00:48):
Sounds good to me.

Speaker 1 (00:50):
First item is the quarterly results. I'm happy to report that we've exceeded our targets by 12%.
  `.trim(),
  )

  // This would normally come from an API
  const transcription = {
    id,
    title: "Team Meeting - May 10",
    date: "May 10, 2023",
    duration: "45:12",
    status: "completed",
    speakers: 3,
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <CardTitle>{transcription.title}</CardTitle>
            </div>
            <CardDescription>
              <div className="flex items-center gap-3 text-sm">
                <span>{transcription.date}</span>
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {transcription.duration}
                </span>
                <Badge variant="outline" className="text-xs font-normal">
                  {transcription.status}
                </Badge>
              </div>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transcript" className="space-y-4">
            <TabsList>
              <TabsTrigger
                value="transcript"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Transcript
              </TabsTrigger>
              <TabsTrigger
                value="speakers"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Speakers
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileAudio className="h-4 w-4" />
                <span>Full transcript • {transcription.duration}</span>
              </div>

              {isEditing ? (
                <textarea
                  className="w-full h-[400px] p-4 text-sm font-mono border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                />
              ) : (
                <div className="border rounded-md p-4 h-[400px] overflow-y-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">{transcriptText}</pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="speakers" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>S1</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Speaker 1</h3>
                      <p className="text-xs text-muted-foreground">25:18 total speaking time</p>
                    </div>
                  </div>
                  <Badge>Primary</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>S2</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Speaker 2</h3>
                      <p className="text-xs text-muted-foreground">12:45 total speaking time</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>S3</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Speaker 3</h3>
                      <p className="text-xs text-muted-foreground">7:09 total speaking time</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="border rounded-md p-4 h-[400px] overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h3>Meeting Summary</h3>
                  <p>
                    The team meeting covered several key topics including project updates, quarterly results, and
                    upcoming deadlines.
                  </p>

                  <h4>Key Points:</h4>
                  <ul>
                    <li>The Johnson project is on track with the first phase completed</li>
                    <li>There are concerns about the testing phase timeline</li>
                    <li>Quarterly results exceeded targets by 12%</li>
                    <li>New marketing strategy to be implemented next month</li>
                    <li>Team restructuring planned for Q3</li>
                  </ul>

                  <h4>Action Items:</h4>
                  <ul>
                    <li>Review testing phase timeline (Owner: Speaker 3)</li>
                    <li>Prepare detailed quarterly report (Owner: Speaker 1)</li>
                    <li>Schedule follow-up meeting for marketing strategy (Owner: Speaker 2)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Transcription
          </Button>

          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
