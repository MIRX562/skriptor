import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Mail, MessageCircle, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function HelpView() {
  const faqs = [
    {
      question: "How do I upload larger files?",
      answer: "Standard accounts support files up to 50MB. For larger files, please contact support for custom limits.",
    },
    {
      question: "Which languages are supported?",
      answer: "We support over 90 languages including English, Spanish, French, German, and many more using WhisperX models.",
    },
    {
      question: "How accurate is the transcription?",
      answer: "Accuracy varies by audio quality and model size. 'Large' models provide the highest accuracy (95%+) for most clear recordings.",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Help & Support
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Find answers to common questions or get in touch with our team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer group">
          <CardContent className="pt-6">
            <div className="rounded-full bg-teal-50 dark:bg-teal-900/20 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition-colors">
              <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Email Support</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Get help via email within 24 hours.</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer group">
          <CardContent className="pt-6">
            <div className="rounded-full bg-teal-50 dark:bg-teal-900/20 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition-colors">
              <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Documentation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Read our guides and API docs.</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer group">
          <CardContent className="pt-6">
            <div className="rounded-full bg-teal-50 dark:bg-teal-900/20 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition-colors">
              <MessageCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Community</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Join our Discord for quick questions.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-white">{faq.question}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.answer}
              </p>
              {index < faqs.length - 1 && <Separator className="mt-4 bg-slate-100 dark:bg-slate-800" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
