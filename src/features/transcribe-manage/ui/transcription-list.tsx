"use client";

import type React from "react";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Download,
  FileAudio,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useTranscriptionListStore } from "../store/transcription-list-store";
import { useToast } from "@/hooks/use-toast";

interface TranscriptionListProps {
  onSelect: (id: string) => void;
}

export function TranscriptionList({ onSelect }: TranscriptionListProps) {
  const { toast } = useToast();
  const {
    transcriptions,
    searchQuery,
    isLoading,
    error,
    fetchTranscriptions,
    setSearchQuery,
    deleteTranscription,
  } = useTranscriptionListStore();

  useEffect(() => {
    fetchTranscriptions().catch((err) => {
      console.error("Error fetching transcriptions:", err);
    });
  }, [fetchTranscriptions]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Add null checks to prevent the toLowerCase error
  const filteredTranscriptions = transcriptions.filter((item) => {
    // Check if item and item.title exist and are not null/undefined
    if (!item || typeof item.title !== "string") {
      return false;
    }

    // Safe toLowerCase calls with null checks
    const title = item.title.toLowerCase();
    const query = searchQuery ? searchQuery.toLowerCase() : "";

    return title.includes(query);
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await deleteTranscription(id);
      toast({
        title: "Success",
        description: "Transcription deleted successfully",
      });
    } catch (err) {
      // Error is already handled in the store and displayed via the useEffect above
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Transcriptions</CardTitle>
          <CardDescription>
            Manage and view all your transcriptions
          </CardDescription>
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
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Loading transcriptions...
                  </p>
                </div>
              ) : filteredTranscriptions.length > 0 ? (
                filteredTranscriptions.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    onClick={() => item.id && onSelect(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800">
                        <FileAudio className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {item.title || "Untitled"}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.date || "No date"}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.duration || "00:00"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "in_progress" &&
                        item.progress !== undefined && (
                          <div className="w-24 mr-2">
                            <Progress value={item.progress} className="h-2" />
                            <p className="text-xs text-right mt-1 text-muted-foreground">
                              {item.progress}%
                            </p>
                          </div>
                        )}

                      {item.mode && (
                        <Badge
                          variant={
                            item.mode === "fast"
                              ? "outline"
                              : item.mode === "medium"
                                ? "secondary"
                                : "default"
                          }
                          className="text-xs font-normal capitalize"
                        >
                          {item.mode}
                        </Badge>
                      )}

                      <Badge
                        variant={
                          item.status === "completed"
                            ? "outline"
                            : item.status === "in_progress"
                              ? "secondary"
                              : "default"
                        }
                        className="text-xs font-normal capitalize"
                      >
                        {item.status?.replace("_", " ") || "Unknown"}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              item.id && onSelect(item.id);
                            }}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            onClick={(e) => item.id && handleDelete(item.id, e)}
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
                  <p className="text-muted-foreground">
                    No transcriptions found
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
