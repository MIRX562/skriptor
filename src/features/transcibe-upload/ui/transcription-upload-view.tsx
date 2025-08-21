"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { motion } from "framer-motion";

import TranscriptionUploadForm from "./transcription-upload-form";
import TranscriptionRecordForm from "./transcription-record-form";

export function TranscriptionUpload() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Transcription</CardTitle>
          <CardDescription>
            Upload an audio file or record directly to transcribe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Upload File
              </TabsTrigger>
              <TabsTrigger
                value="record"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Record Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <TranscriptionUploadForm />
            </TabsContent>

            <TabsContent value="record" className="space-y-6">
              <TranscriptionRecordForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
