import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check and update campaign status to 'completed' if target is reached
 * @param supabase - Supabase client instance
 * @param campaignId - Campaign UUID
 * @returns Updated campaign status or null if error
 */
export async function checkAndCompleteCampaign(
  supabase: SupabaseClient,
  campaignId: string
) {
  try {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('status, amount_raised, target_amount')
      .eq('id', campaignId)
      .single();

    if (error || !campaign) {
      console.error('Error fetching campaign:', error);
      return null;
    }

    // Check if campaign should be marked as completed
    if (
      campaign.status === 'active' && 
      campaign.amount_raised >= campaign.target_amount
    ) {
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: 'completed' })
        .eq('id', campaignId);

      if (updateError) {
        console.error('Error updating campaign status:', updateError);
        return null;
      }

      return 'completed';
    }

    return campaign.status;
  } catch (error) {
    console.error('Exception in checkAndCompleteCampaign:', error);
    return null;
  }
}

/**
 * Batch check all active campaigns and update those that reached their target
 * Useful for running as a scheduled task or manual admin action
 */
export async function batchUpdateCompletedCampaigns(supabase: SupabaseClient) {
  try {
    // Fetch all active campaigns where amount_raised >= target_amount
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, amount_raised, target_amount')
      .eq('status', 'active')
      .gte('amount_raised', supabase.rpc('target_amount'));

    if (error) {
      console.error('Error fetching campaigns for batch update:', error);
      return { success: false, updated: 0 };
    }

    if (!campaigns || campaigns.length === 0) {
      return { success: true, updated: 0 };
    }

    // Update all qualifying campaigns to 'completed'
    const campaignIds = campaigns.map(c => c.id);
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ status: 'completed' })
      .in('id', campaignIds);

    if (updateError) {
      console.error('Error in batch update:', updateError);
      return { success: false, updated: 0 };
    }

    return { success: true, updated: campaigns.length };
  } catch (error) {
    console.error('Exception in batchUpdateCompletedCampaigns:', error);
    return { success: false, updated: 0 };
  }
}

/**
 * Get campaign completion percentage
 */
export function getCampaignProgress(amountRaised: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min((amountRaised / targetAmount) * 100, 100);
}

/**
 * Check if campaign is completed (reached or exceeded target)
 */
export function isCampaignFullyFunded(amountRaised: number, targetAmount: number): boolean {
  return amountRaised >= targetAmount;
}