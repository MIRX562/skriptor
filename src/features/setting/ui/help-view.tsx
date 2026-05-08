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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm hover:border-teal-500/50 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-8">
            <div className="rounded-2xl bg-teal-50 dark:bg-teal-950 w-12 h-12 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Mail className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Email Support</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">Get expert help via email within 24 hours.</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm hover:border-teal-500/50 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-8">
            <div className="rounded-2xl bg-teal-50 dark:bg-teal-950 w-12 h-12 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Documentation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">Read our comprehensive guides and API docs.</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm hover:border-teal-500/50 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-8">
            <div className="rounded-2xl bg-teal-50 dark:bg-teal-900/20 w-12 h-12 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Community</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">Join our Discord community for quick help.</p>
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
