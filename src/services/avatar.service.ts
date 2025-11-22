import axios from 'axios';

export const generateSpeech = async (text: string, emotion: string = 'cheerful') => {
  try {
    const response = await axios.post(
      'https://api.fish.audio/v1/tts',
      {
        text: `<${emotion}>${text}</${emotion}>`,
        voice_id: process.env.FISH_AUDIO_VOICE_ID || 'default',
        format: 'mp3',
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.audio_url || null;
  } catch (error) {
    console.error('Fish Audio error:', error);
    return null;
  }
};

export const generateAvatarVideo = async (audioUrl: string) => {
  try {
    const response = await axios.post(
      'https://api.tavus.io/v1/videos',
      {
        audio_url: audioUrl,
        avatar_id: process.env.TAVUS_AVATAR_ID,
        background: 'professional',
      },
      {
        headers: {
          'x-api-key': process.env.TAVUS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.video_url || null;
  } catch (error) {
    console.error('Tavus error:', error);
    return null;
  }
};
