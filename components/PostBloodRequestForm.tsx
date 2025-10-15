'use client'

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBloodRequestAction } from '@/app/actions';
import { Droplets, Send, Loader2, Info } from 'lucide-react';

export function PostBloodRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const result = await createBloodRequestAction(formData);

    if (result?.error) {
        toast.error("Failed to post request", {
            description: String(result.error) // ← FIXED
        });
    } else {
        toast.success("Blood request posted successfully!");
        event.currentTarget.reset();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-lg">
      <Card className="border-2 border-blue-200 shadow-2xl bg-white">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-6 pt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              New Blood Request
            </CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            Fill in the details below to post your blood requirement
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Group */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                Blood Group
              </Label>
              <Select name="blood_group" required>
                <SelectTrigger className="h-12 border-2 border-blue-200 bg-white hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-500 text-base">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-200">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                    <SelectItem 
                      key={group} 
                      value={group}
                      className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer font-semibold text-base py-3"
                    >
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                Urgency Level
              </Label>
              <Select name="urgency" required defaultValue="normal">
                <SelectTrigger className="h-12 border-2 border-blue-200 bg-white hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-500 text-base">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-200">
                  <SelectItem 
                    value="normal"
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-3"
                  >
                    Normal
                  </SelectItem>
                  <SelectItem 
                    value="high"
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-3"
                  >
                    High Priority
                  </SelectItem>
                  <SelectItem 
                    value="immediate"
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-3"
                  >
                    Immediate
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Posting Request...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Post Request
                  </>
                )}
              </Button>
            </div>

            {/* Info Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-4">
              <p className="text-xs text-slate-700 flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Request will be visible to nearby donors with hospital details attached.</span>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
