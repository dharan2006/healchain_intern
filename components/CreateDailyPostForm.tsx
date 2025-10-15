'use client'

import { createDailyPostAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Upload, MapPin, QrCode, FileText, ImageIcon, Leaf, CheckCircle2, Info } from "lucide-react";

export function CreateDailyPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [qrImagePreview, setQrImagePreview] = useState<string | null>(null);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    
    const result = await createDailyPostAction(formData);

    if (result?.error) {
      toast.error("Failed to create post", { description: result.error });
    } else {
      toast.success("Post created successfully!", { description: "Your daily impact post is now live!" });
      (event.target as HTMLFormElement).reset();
      setMainImagePreview(null);
      setQrImagePreview(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Professional Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 mb-8 overflow-hidden">
          <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <Leaf className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Create Daily Impact Post</h1>
                <p className="text-green-100 text-lg">Share opportunities to make a meaningful difference</p>
              </div>
            </div>
          </div>
          
          {/* Info Bar */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-8 py-4 border-t border-green-100">
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>High-quality images recommended</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>All fields are required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Post goes live immediately</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-green-200">
                <FileText className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-800">Basic Information</h2>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold text-slate-700">
                  Post Title
                </Label>
                <Input 
                  id="title" 
                  name="title" 
                  required 
                  placeholder="e.g., Lunch for children at Anbu Illam"
                  className="text-base border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg h-12 transition-all"
                />
                <p className="text-sm text-slate-500">Write a clear, compelling title for your post</p>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-semibold text-slate-700">
                  Description
                </Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  required 
                  placeholder="Describe the cause and how donations will make an impact..."
                  className="text-base border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg min-h-[140px] transition-all"
                />
                <p className="text-sm text-slate-500">Provide details about the cause and its impact</p>
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-green-200">
                <ImageIcon className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-800">Media & Images</h2>
              </div>

              {/* Main Image */}
              <div className="space-y-3">
                <Label htmlFor="post_image" className="text-base font-semibold text-slate-700">
                  Main Post Image
                </Label>
                <div className="space-y-4">
                  <div className="relative">
                    <Input 
                      id="post_image" 
                      name="post_image" 
                      type="file" 
                      accept="image/*" 
                      required 
                      onChange={handleMainImageChange}
                      className="border-2 border-slate-200 focus:border-emerald-500 rounded-lg file:mr-4 file:py-2.5 file:px-5 file:rounded-md file:border-0 file:bg-gradient-to-r file:from-emerald-600 file:to-green-600 file:text-white file:font-semibold file:text-sm hover:file:from-emerald-700 hover:file:to-green-700 file:cursor-pointer file:transition-all"
                    />
                  </div>
                  {mainImagePreview && (
                    <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-emerald-200 shadow-md bg-slate-50">
                      <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Image Preview
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500">Upload a high-quality image (JPG, PNG recommended)</p>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-green-200">
                <MapPin className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-800">Location Details</h2>
              </div>

              <div className="space-y-3">
                <Label htmlFor="location_link" className="text-base font-semibold text-slate-700">
                  Google Maps Embed Link
                </Label>
                <Input 
                  id="location_link" 
                  name="location_link" 
                  type="url" 
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="text-base border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg h-12 transition-all font-mono text-sm"
                />
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700 font-semibold mb-2">How to get the Google Maps embed link:</p>
                      <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside ml-2">
                        <li>Open Google Maps and search for the location</li>
                        <li>Click the <strong>"Share"</strong> button</li>
                        <li>Select <strong>"Embed a map"</strong> tab</li>
                        <li>Copy the <strong>URL from the src attribute</strong> in the iframe code</li>
                        <li>Paste only the URL (starting with https://www.google.com/maps/embed?pb=...)</li>
                      </ol>
                      <div className="mt-3 p-3 bg-white border border-emerald-200 rounded text-xs font-mono text-slate-600 break-all">
                        Example: https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d498034...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-green-200">
                <QrCode className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-800">Payment Information</h2>
              </div>

              {/* UPI Details */}
              <div className="space-y-3">
                <Label htmlFor="upi_details" className="text-base font-semibold text-slate-700">
                  UPI ID or Phone Number
                </Label>
                <Input 
                  id="upi_details" 
                  name="upi_details" 
                  required 
                  placeholder="e.g., 9876543210@paytm or 9876543210"
                  className="text-base border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg h-12 transition-all font-mono"
                />
                <p className="text-sm text-slate-500">Enter a valid UPI ID or phone number linked to UPI</p>
              </div>

              {/* QR Code */}
              <div className="space-y-3">
                <Label htmlFor="qr_code_image" className="text-base font-semibold text-slate-700">
                  UPI QR Code Image
                </Label>
                <div className="space-y-4">
                  <Input 
                    id="qr_code_image" 
                    name="qr_code_image" 
                    type="file" 
                    accept="image/*" 
                    required 
                    onChange={handleQrImageChange}
                    className="border-2 border-slate-200 focus:border-emerald-500 rounded-lg file:mr-4 file:py-2.5 file:px-5 file:rounded-md file:border-0 file:bg-gradient-to-r file:from-emerald-600 file:to-green-600 file:text-white file:font-semibold file:text-sm hover:file:from-emerald-700 hover:file:to-green-700 file:cursor-pointer file:transition-all"
                  />
                  {qrImagePreview && (
                    <div className="flex justify-center">
                      <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-emerald-200 shadow-md bg-white p-4">
                        <img src={qrImagePreview} alt="QR Preview" className="w-full h-full object-contain" />
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          QR Code Preview
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500">Upload the QR code image for UPI payments</p>
              </div>
            </div>

            {/* Submit Section */}
            <div className="pt-6 border-t border-slate-200">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-lg h-14 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white"></div>
                    <span>Creating Post...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Upload className="h-6 w-6" />
                    <span>Publish Daily Impact Post</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}