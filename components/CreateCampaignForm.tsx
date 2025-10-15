'use client'

import { useState, type FormEvent, useRef } from 'react'
import { createCampaignAction } from '@/app/actions'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Upload, User, FileText, IndianRupee, Image as ImageIcon, Video, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export function CreateCampaignForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // State for each form field
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [disease, setDisease] = useState('');
  const [targetAmount, setTargetAmount] = useState('50000');
  const [patientStory, setPatientStory] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [patientPhotoFile, setPatientPhotoFile] = useState<File | null>(null);
  const [proofDocumentFile, setProofDocumentFile] = useState<File | null>(null);

  // Refs for file inputs
  const patientPhotoRef = useRef<HTMLInputElement>(null);
  const proofDocumentRef = useRef<HTMLInputElement>(null);

  // AI AUTO-FILL FUNCTION
  const handleAutoFill = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = ''; 

    setIsProcessingAI(true);
    toast.info("Processing document with AI...", { 
      description: "This may take a moment. Ensure your Gemini API key is saved in settings." 
    });

    try {
      const imageBase64 = await fileToBase64(file);
      const response = await fetch('/api/gemini/extract-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract details.");
      }

      const data = await response.json();
      
      setPatientName(data.patient_name || '');
      setPatientAge(data.patient_age?.toString() || '');
      setDisease(data.disease || '');
      setPatientStory(data.patient_story || '');

      toast.success("Details extracted successfully!", { 
        description: "Please review and complete the form." 
      });
    } catch (error: any) {
      console.error("AI Auto-fill Error:", error);
      toast.error("AI Auto-fill Failed", { 
        description: error.message || "An unexpected error occurred." 
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('patient_name', patientName);
    formData.append('patient_age', patientAge);
    formData.append('disease', disease);
    formData.append('target_amount', targetAmount);
    formData.append('patient_story', patientStory);
    formData.append('youtube_video_link', youtubeLink);

    if (patientPhotoFile) {
      formData.append('patient_photo', patientPhotoFile);
    }
    if (proofDocumentFile) {
      formData.append('proof_document', proofDocumentFile);
    }

    const result = await createCampaignAction(formData);

    if (result?.error) {
      if (typeof result.error === 'object') {
        const errors = Object.values(result.error).flat().join(', ');
        toast.error("Validation Error", { description: errors });
      } else {
        toast.error("Campaign creation failed", { description: result.error });
      }
    } else {
      toast.success("Campaign created successfully!");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-blue-100 dark:border-blue-900 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <CardHeader className="border-b border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 pb-6">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Create a New Campaign
          </CardTitle>
          <CardDescription className="text-base">
            Fill in the details below, or use our AI helper to auto-fill from medical documents.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 space-y-8">
          {/* AI AUTO-FILL SECTION */}
          <div className="relative overflow-hidden rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 dark:from-blue-950/50 dark:via-blue-950/30 dark:to-indigo-950/50 p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 dark:bg-blue-600/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Label htmlFor="ai_document" className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    AI-Powered Auto-Fill
                  </Label>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Upload a medical document to extract patient details instantly
                  </p>
                </div>
              </div>

              <Alert className="bg-white/80 dark:bg-slate-900/50 border-blue-300 dark:border-blue-700">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Tip:</strong> Upload a clear PNG image of diagnosis reports, prescriptions, or medical certificates for best results.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Input 
                  id="ai_document" 
                  type="file" 
                  accept="image/png" 
                  onChange={handleAutoFill} 
                  disabled={isProcessingAI} 
                  className="h-12 bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 dark:file:bg-blue-700 dark:hover:file:bg-blue-600 cursor-pointer"
                />
                {isProcessingAI && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">Analyzing document with AI...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Uploads Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Photo */}
              <div className="space-y-2">
                <Label htmlFor="patient_photo" className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Patient Photo
                </Label>
                <div className="relative">
                  <Input 
                    id="patient_photo" 
                    name="patient_photo" 
                    type="file" 
                    accept="image/*" 
                    ref={patientPhotoRef}
                    onChange={(e) => setPatientPhotoFile(e.target.files?.[0] || null)} 
                    className="h-12 border-slate-300 dark:border-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300"
                  />
                </div>
                {patientPhotoFile && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                    <CheckCircle2 className="h-3 w-3" />
                    {patientPhotoFile.name}
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-500">Optional - Helps build trust with donors</p>
              </div>

              {/* Proof Document */}
              <div className="space-y-2">
                <Label htmlFor="proof_document" className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-red-600 dark:text-red-400" />
                  Proof Document <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input 
                    id="proof_document" 
                    name="proof_document" 
                    type="file" 
                    accept="image/*,.pdf"
                    required 
                    ref={proofDocumentRef}
                    onChange={(e) => setProofDocumentFile(e.target.files?.[0] || null)}
                    className="h-12 border-slate-300 dark:border-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 dark:file:bg-red-900/30 dark:file:text-red-400"
                  />
                </div>
                {proofDocumentFile && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                    <CheckCircle2 className="h-3 w-3" />
                    {proofDocumentFile.name}
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-500">Required - Medical report or certificate</p>
              </div>
            </div>

            {/* Patient Details Section */}
            <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Patient Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patient_name" className="text-slate-700 dark:text-slate-300 font-semibold">
                    Patient's Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="patient_name" 
                    name="patient_name" 
                    type="text" 
                    value={patientName} 
                    onChange={(e) => setPatientName(e.target.value)} 
                    required 
                    placeholder="Enter full name"
                    className="h-11 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient_age" className="text-slate-700 dark:text-slate-300 font-semibold">
                    Patient's Age <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="patient_age" 
                    name="patient_age" 
                    type="number" 
                    value={patientAge} 
                    onChange={(e) => setPatientAge(e.target.value)} 
                    required 
                    min="0"
                    max="150"
                    placeholder="Age in years"
                    className="h-11 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disease" className="text-slate-700 dark:text-slate-300 font-semibold">
                  Disease/Medical Condition <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="disease" 
                  name="disease" 
                  type="text" 
                  value={disease} 
                  onChange={(e) => setDisease(e.target.value)} 
                  required 
                  placeholder="e.g., Heart Surgery, Cancer Treatment"
                  className="h-11 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Campaign Details Section */}
            <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
                Campaign Details
              </h3>

              <div className="space-y-2">
                <Label htmlFor="target_amount" className="text-slate-700 dark:text-slate-300 font-semibold">
                  Target Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold">
                    ₹
                  </span>
                  <Input 
                    id="target_amount" 
                    name="target_amount" 
                    type="number" 
                    value={targetAmount} 
                    onChange={(e) => setTargetAmount(e.target.value)} 
                    required 
                    min="100"
                    placeholder="50000"
                    className="h-11 pl-8 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Minimum ₹100 - Be realistic about treatment costs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_story" className="text-slate-700 dark:text-slate-300 font-semibold">
                  Patient Story/Details <span className="text-red-500">*</span>
                </Label>
                <Textarea 
                  id="patient_story" 
                  name="patient_story" 
                  value={patientStory} 
                  onChange={(e) => setPatientStory(e.target.value)} 
                  required 
                  rows={6}
                  placeholder="Share the patient's story, medical condition details, treatment plan, and why this campaign is important..."
                  className="border-slate-300 dark:border-slate-700 resize-none bg-white dark:bg-slate-900"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  A compelling story helps donors connect emotionally
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube_video_link" className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-600 dark:text-red-400" />
                  YouTube Video Link
                </Label>
                <Input 
                  id="youtube_video_link" 
                  name="youtube_video_link" 
                  type="url" 
                  value={youtubeLink} 
                  onChange={(e) => setYoutubeLink(e.target.value)} 
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-11 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Optional - Video testimonials increase donations by 50%
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Important:</strong> All information will be verified. False or misleading campaigns will be removed and may result in legal action.
              </AlertDescription>
            </Alert>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting || isProcessingAI} 
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Campaign
                </>
              )}
            </Button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              By submitting, you agree to our <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">terms and conditions</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}