import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient()
;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Get the user's saved API key from our database
  const { data: hospital } = await supabase
    .from('hospitals')
    .select('gemini_api_key')
    .eq('user_id', user.id)
    .single();

  const apiKey = hospital?.gemini_api_key;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not found. Please save it in your settings.' }, { status: 400 });
  }

  // 2. Get the image data from the request
  const { imageBase64 } = await request.json();
  if (!imageBase64) {
    return NextResponse.json({ error: 'No image data provided.' }, { status: 400 });
  }

  // 3. Prepare the request to the Gemini API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: "You are an expert medical data extractor. Analyze the provided medical document image and extract the following details precisely: patient's full name, patient's age, the primary disease or diagnosis, and a brief, one-paragraph summary of the patient's condition or story. Do not add any extra explanation. Only return a JSON object with the keys 'patient_name', 'patient_age', 'disease', and 'patient_story'."
          },
          {
            inline_data: {
              mime_type: "image/png",
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
    }
  };

  // 4. Call the Gemini API and return the result
  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        console.error("Gemini API Error:", errorBody);
        return NextResponse.json({ error: `Gemini API request failed: ${geminiResponse.statusText}` }, { status: 500 });
    }

    const data = await geminiResponse.json();
    const text = data.candidates[0].content.parts[0].text;
    const extractedData = JSON.parse(text);
    
    return NextResponse.json(extractedData);

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error: `Failed to process document: ${error.message}` }, { status: 500 });
  }
}