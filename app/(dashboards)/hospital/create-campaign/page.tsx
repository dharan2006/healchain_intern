import { CreateCampaignForm } from "@/components/CreateCampaignForm";
import { HeartHandshake, TrendingUp } from "lucide-react";

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-4">
              <HeartHandshake className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                Create Fundraising Campaign
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg max-w-2xl mx-auto">
                Help patients access critical medical treatment through community support. Use our AI-powered tool to get started quickly.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Step 1</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fill campaign details</p>
              </div>
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Step 2</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Submit for verification</p>
              </div>
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Step 3</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Start receiving donations</p>
              </div>
            </div>
          </div>

          {/* Form Component */}
          <CreateCampaignForm />

          {/* Guidelines Section */}
          <div className="bg-blue-50/50 dark:bg-blue-950/30 backdrop-blur-sm rounded-xl p-6 border border-blue-200 dark:border-blue-800 max-w-3xl mx-auto">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Campaign Guidelines for Success
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Provide accurate and verifiable patient information with proper documentation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Upload clear medical documents and detailed treatment plans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Set realistic funding goals based on actual treatment costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Update campaign regularly with patient progress and milestones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Use our AI tool to auto-fill details from medical documents for faster setup</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}