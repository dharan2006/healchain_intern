'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSuccessStoryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in as a hospital." };

  const caption = formData.get('caption') as string;
  const patientName = formData.get('patient_name') as string;
  const campaignId = formData.get('campaign_id') as string;
  const videoFile = formData.get('video') as File;

  if (!videoFile || videoFile.size === 0) {
    return { error: "Please upload a video." };
  }

  if (videoFile.size > 50 * 1024 * 1024) {
    return { error: "Video size must be less than 50MB." };
  }

  try {
    const videoFileName = `${user.id}/${Date.now()}-${videoFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('success-stories')
      .upload(videoFileName, videoFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('success-stories')
      .getPublicUrl(uploadData.path);

    const { error: dbError } = await supabase.from('success_stories').insert({
      hospital_id: user.id,
      campaign_id: campaignId || null,
      video_url: publicUrl,
      caption,
      patient_name: patientName,
    });

    if (dbError) throw dbError;

  } catch (error: any) {
    return { error: `Failed to create story: ${error.message}` };
  }

  revalidatePath('/hospital/campaigns');
  revalidatePath('/donor');
  redirect('/hospital/campaigns'); // ✅ Fixed - redirects to campaigns page
}

export async function likeStoryAction(storyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: existingLike } = await supabase
    .from('story_likes')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingLike) {
    await supabase.from('story_likes').delete().eq('id', existingLike.id);
    await supabase.rpc('decrement_story_likes', { story_uuid: storyId });
  } else {
    await supabase.from('story_likes').insert({ story_id: storyId, user_id: user.id });
    await supabase.rpc('increment_story_likes', { story_uuid: storyId });
  }

  revalidatePath('/donor');
  return { success: true };
}

export async function trackStoryViewAction(storyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existingView } = await supabase
    .from('story_views')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existingView) {
    await supabase.from('story_views').insert({ story_id: storyId, user_id: user.id });
    await supabase.rpc('increment_story_views', { story_uuid: storyId });
  }
}
