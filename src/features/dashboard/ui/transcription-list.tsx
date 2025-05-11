"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, Download, FileAudio, MoreHorizontal, Search, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

interface TranscriptionListProps {
  onSelect: (id: string) => void
}

export function TranscriptionList({ onSelect }: TranscriptionListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const transcriptions = [
    {
      id: "1",
      title: "Team Meeting - May 10",
      date: "May 10, 2023",
      duration: "45:12",
      status: "completed",
    },
    {
      id: "2",
      title: "Interview with John Smith",
      date: "May 8, 2023",
      duration: "32:08",
      status: "completed",
    },
    {
      id: "3",
      title: "Product Feedback Session",
      date: "May 5, 2023",
      duration: "28:45",
      status: "completed",
    },
    {
      id: "4",
      title: "Marketing Strategy",
      date: "May 3, 2023",
      duration: "51:30",
      status: "completed",
    },
    {
      id: "5",
      title: "Quarterly Review",
      date: "May 1, 2023",
      duration: "62:15",
      status: "completed",
    },
    {
      id: "6",
      title: "Customer Support Training",
      date: "April 28, 2023",
      duration: "47:22",
      status: "completed",
    },
  ]

  const filteredTranscriptions = transcriptions.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader>
          <CardTitle>Your Transcriptions</CardTitle>
          <CardDescription>Manage and view all your transcriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transcriptions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>

            <div className="space-y-2">
              {filteredTranscriptions.length > 0 ? (
                filteredTranscriptions.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    onClick={() => onSelect(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800">
                        <FileAudio className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.date}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {item.status}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelect(item.id)
                            }}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transcriptions found</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
