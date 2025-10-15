import { PostBloodRequestForm } from '@/components/PostBloodRequestForm';
import { Droplets, Shield, Clock } from 'lucide-react';

export default function PostBloodRequestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500 rounded-full blur opacity-30" />
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-4 shadow-xl">
                <Droplets className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-blue-900">
              Blood Request Portal
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Submit urgent blood requirements to connect with nearby donors instantly
          </p>
        </div>

        {/* Form Container */}
        <div className="flex justify-center">
          <PostBloodRequestForm />
        </div>

        {/* Info Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Instant Reach</h3>
            </div>
            <p className="text-sm text-slate-600">
              Your request reaches all registered donors in your area immediately
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Real-time Updates</h3>
            </div>
            <p className="text-sm text-slate-600">
              Track responses and manage requests from your dashboard
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">24/7 Available</h3>
            </div>
            <p className="text-sm text-slate-600">
              Post emergency requests anytime with automated donor notifications
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
