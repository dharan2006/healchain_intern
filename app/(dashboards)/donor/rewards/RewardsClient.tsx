'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, Gift, CheckCircle } from "lucide-react";
import { generateRedemptionCodeAction } from "@/app/actions";
import { toast } from "sonner";
import QRCode from 'qrcode';

export default function RewardsClient({ humanPoints, availablePoints, redemptions }: any) {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAvailablePoints, setCurrentAvailablePoints] = useState(availablePoints);

  const handleGenerateCode = async (checkupType: string, requiredPoints: number) => {
    if (currentAvailablePoints < requiredPoints) {
      toast.error(`You need ${requiredPoints} available points. You have ${currentAvailablePoints} available.`);
      return;
    }

    setIsLoading(true);
    const result = await generateRedemptionCodeAction(checkupType, requiredPoints);
    
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else if (result.code) {
      setGeneratedCode(result.code);
      setCurrentAvailablePoints(result.newAvailablePoints || 0);
      
      // Generate QR code
      QRCode.toDataURL(result.code, { width: 300 })
        .then(url => {
          setQrCodeUrl(url);
          setIsDialogOpen(true);
          toast.success("Code generated! Available points decreased.");
        })
        .catch(err => console.error(err));
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rewards & Benefits</h1>
            <p className="text-slate-600 mt-1">Redeem your points for free checkups</p>
          </div>
        </div>

        {/* Points Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Human Points (Never Decreases) */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Human Points</p>
                  <p className="text-5xl font-bold mt-2">{humanPoints}</p>
                  <p className="text-purple-100 text-xs mt-1">Lifetime Achievement</p>
                </div>
                <Award className="h-20 w-20 text-purple-200 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Available Points (Decreases When Redeemed) */}
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Available to Redeem</p>
                  <p className="text-5xl font-bold mt-2">{currentAvailablePoints}</p>
                  <p className="text-green-100 text-xs mt-1">Points you can use now</p>
                </div>
                <Gift className="h-20 w-20 text-green-200 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Rewards */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Checkups</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Checkup</CardTitle>
                <CardDescription>Basic health screening</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 mb-4">10 Points</p>
                <Button 
                  onClick={() => handleGenerateCode('general', 10)}
                  disabled={currentAvailablePoints < 10 || isLoading}
                  className="w-full"
                >
                  {currentAvailablePoints < 10 ? 'Not Enough Points' : 'Generate Code'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blood Test</CardTitle>
                <CardDescription>Complete blood count</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 mb-4">25 Points</p>
                <Button 
                  onClick={() => handleGenerateCode('blood_test', 25)}
                  disabled={currentAvailablePoints < 25 || isLoading}
                  className="w-full"
                >
                  {currentAvailablePoints < 25 ? 'Not Enough Points' : 'Generate Code'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Full Body Checkup</CardTitle>
                <CardDescription>Comprehensive health exam</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 mb-4">50 Points</p>
                <Button 
                  onClick={() => handleGenerateCode('full_body', 50)}
                  disabled={currentAvailablePoints < 50 || isLoading}
                  className="w-full"
                >
                  {currentAvailablePoints < 50 ? 'Not Enough Points' : 'Generate Code'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* QR Code Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Your Redemption Code</DialogTitle>
              <DialogDescription>
                Show this code or QR at the hospital
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-4">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
              )}
              <div className="text-3xl font-bold tracking-wider bg-purple-100 py-4 rounded">
                {generatedCode}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800 font-semibold">
                  Available Points: {currentAvailablePoints}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Your total Human Points ({humanPoints}) never decrease!
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Redemption History */}
        <Card>
          <CardHeader>
            <CardTitle>Redemption History</CardTitle>
            <CardDescription>Your past checkup redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            {redemptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Checkup Type</TableHead>
                    <TableHead>Points Used</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{r.redemption_code}</TableCell>
                      <TableCell className="capitalize">{r.checkup_type.replace('_', ' ')}</TableCell>
                      <TableCell className="font-bold text-purple-600">{r.required_points} pts</TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{r.hospitals?.hospital_name || '—'}</TableCell>
                      <TableCell>
                        <Badge className={r.status === 'redeemed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-gray-500">No redemptions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
