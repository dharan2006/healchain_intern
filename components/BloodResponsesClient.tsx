'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDonationButton } from "@/components/ConfirmDonationButton";
import { Droplets, Users, Phone, Mail, CheckCircle2, Clock } from "lucide-react";

type BloodRequest = {
  id: string;
  blood_group: string;
  urgency: string;
  created_at: string;
  status: string;
  blood_pledges: any[];
};

export default function BloodResponsesClient({ requests }: { requests: BloodRequest[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'fulfilled'>('active');

  const activeRequests = requests?.filter(r => r.status === 'active') || [];
  const fulfilledRequests = requests?.filter(r => r.status === 'fulfilled') || [];

  const displayRequests = activeTab === 'active' ? activeRequests : fulfilledRequests;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Blood Request Responses</h1>
          <p className="text-sm text-slate-600 mt-1">Manage donor pledges and confirmations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-600">Total</p>
                  <p className="text-xl font-bold text-slate-900">{requests?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-600">Active</p>
                  <p className="text-xl font-bold text-blue-600">{activeRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-slate-600">Fulfilled</p>
                  <p className="text-xl font-bold text-green-600">{fulfilledRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toggle Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'active'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock className="h-4 w-4" />
            Active ({activeRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('fulfilled')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'fulfilled'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Fulfilled ({fulfilledRequests.length})
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {displayRequests.length > 0 ? (
            displayRequests.map(request => (
              <Card key={request.id} className="border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 rounded-lg px-3 py-1.5 shadow-sm">
                        <span className="text-lg font-bold text-white">{request.blood_group}</span>
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                          Request - {request.blood_group}
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(request.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {request.status === 'fulfilled' && (
                        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Fulfilled
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {request.urgency}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-600" />
                      Donors
                    </h4>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {request.blood_pledges?.length || 0}
                    </span>
                  </div>

                  {request.blood_pledges && request.blood_pledges.length > 0 ? (
                    <div className="space-y-2">
                      {request.blood_pledges.map((pledge: any) => (
                        <div 
                          key={pledge.id} 
                          className="border border-slate-200 bg-white rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {pledge.users?.full_name?.charAt(0).toUpperCase() || 'D'}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-slate-900 truncate">
                                  {pledge.users?.full_name || 'Anonymous'}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {pledge.users?.phone || 'N/A'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate max-w-[200px]">{pledge.users?.email || 'N/A'}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {request.status === 'active' && (
                              <div className="flex-shrink-0">
                                <ConfirmDonationButton pledgeId={pledge.id} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-200">
                      <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-600">No pledges yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border border-dashed border-slate-300 bg-white">
              <CardContent className="py-12 text-center">
                {activeTab === 'active' ? (
                  <>
                    <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium">No active requests</p>
                    <p className="text-xs text-slate-500 mt-1">Active blood requests will appear here</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium">No fulfilled requests</p>
                    <p className="text-xs text-slate-500 mt-1">Completed requests will appear here</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
