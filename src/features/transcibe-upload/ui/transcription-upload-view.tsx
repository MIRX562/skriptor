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
import { type Dictionary } from "@/i18n/dictionaries";

export function TranscriptionUpload({ dict }: { dict: Dictionary }) {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <Card className="max-w-2xl mx-auto md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50 md:bg-card">
      <CardHeader>
        <CardTitle>{dict.transcribe.title}</CardTitle>
        <CardDescription>
          {dict.transcribe.description}
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
              {dict.transcribe.tabs.upload}
            </TabsTrigger>
            <TabsTrigger
              value="record"
              className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
            >
              {dict.transcribe.tabs.record}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <TranscriptionUploadForm dict={dict} />
          </TabsContent>

          <TabsContent value="record" className="space-y-6">
            <TranscriptionRecordForm dict={dict} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
