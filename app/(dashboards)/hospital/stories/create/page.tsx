import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createSuccessStoryAction } from "@/app/actions/stories";

export default async function CreateStoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, patient_name')
    .eq('hospital_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Create Success Story 🎬
        </h1>
        <p className="text-gray-600">
          Share a recovery video to inspire donors and showcase the impact of their contributions.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-pink-100">
        {/* @ts-ignore */}
        <form action={createSuccessStoryAction} className="space-y-6">
          {/* Patient Name */}
          <div>
            <label htmlFor="patient_name" className="block text-sm font-semibold text-gray-700 mb-2">
              Patient Name *
            </label>
            <input
              type="text"
              id="patient_name"
              name="patient_name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
              placeholder="e.g., John Doe"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The name of the patient who recovered
            </p>
          </div>

          {/* Link to Campaign */}
          <div>
            <label htmlFor="campaign_id" className="block text-sm font-semibold text-gray-700 mb-2">
              Link to Campaign (Optional)
            </label>
            <select 
              id="campaign_id"
              name="campaign_id" 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
            >
              <option value="">None - Standalone story</option>
              {campaigns?.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.patient_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Link this story to an existing fundraising campaign
            </p>
          </div>

          {/* Caption */}
          <div>
            <label htmlFor="caption" className="block text-sm font-semibold text-gray-700 mb-2">
              Story Caption *
            </label>
            <textarea
              id="caption"
              name="caption"
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
              placeholder="Tell the recovery story... How did the patient recover? What was the journey like? Thank the donors!"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Share the patient&apos;s recovery journey and impact
            </p>
          </div>

          {/* Video Upload */}
          <div>
            <label htmlFor="video" className="block text-sm font-semibold text-gray-700 mb-2">
              Recovery Video *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition">
              <input
                type="file"
                id="video"
                name="video"
                accept="video/*"
                className="w-full"
                required
              />
            </div>
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">📹 Video Requirements:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Maximum file size: 50MB</li>
                <li>• Recommended duration: 30-60 seconds</li>
                <li>• Format: MP4, MOV, AVI</li>
                <li>• Show patient&apos;s recovery progress or thank you message</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-4 rounded-lg font-semibold hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Post Success Story</span>
            </button>
            
            <a
              href="/hospital"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Tips for Great Success Stories
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">•</span>
            <span>Keep videos short and authentic - 30-60 seconds is perfect</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">•</span>
            <span>Show the patient&apos;s recovery progress or a thank you message</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">•</span>
            <span>Thank donors and highlight the impact of their contributions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">•</span>
            <span>Stories expire after 48 hours (like Instagram Stories)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
