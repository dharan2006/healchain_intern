'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { redeemCheckupCodeAction } from "@/app/actions";
import { toast } from "sonner";
import { QrCode } from "lucide-react";

export default function HospitalRedemptionsClient({ redemptions }: any) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error("Please enter a code");
      return;
    }

    setIsLoading(true);
    const result = await redeemCheckupCodeAction(code);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Redeemed for ${result.donor?.full_name}`);
      setCode("");
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Redeem Checkup Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter redemption code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="uppercase"
            />
            <Button onClick={handleRedeem} disabled={isLoading}>
              Redeem
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redeemed Checkups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Redeemed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">{r.redemption_code}</TableCell>
                  <TableCell>{r.users?.full_name}</TableCell>
                  <TableCell className="capitalize">{r.checkup_type.replace('_', ' ')}</TableCell>
                  <TableCell>{new Date(r.redeemed_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
