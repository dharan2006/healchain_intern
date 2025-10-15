'use client'

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useBloodNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Listen for new blood requests in real-time
    const channel = supabase
      .channel('blood-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blood_requests',
        },
        async (payload) => {
          console.log('🩸 New blood request detected:', payload.new);
          
          // Get donor's blood group
          const { data: donor } = await supabase
            .from('donors')
            .select('blood_group, notify_blood_requests')
            .eq('user_id', userId)
            .single();

          if (!donor?.notify_blood_requests) return;

          const request = payload.new;
          
          // Check if blood group matches
          if (donor.blood_group === request.blood_group) {
            // Show toast notification
            toast.error('🩸 Urgent Blood Donation Request!', {
              description: `${request.blood_group} blood needed urgently. Someone needs your help!`,
              duration: 10000,
              action: {
                label: 'View Request',
                onClick: () => window.location.href = '/donor/blood-bank'
              },
            });

            // Play notification sound
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}

function playNotificationSound() {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => console.log('Could not play sound'));
  } catch (e) {
    console.log('Audio not available');
  }
}
