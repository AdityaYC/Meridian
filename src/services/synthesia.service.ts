import axios from 'axios';

const SYNTHESIA_API_URL = 'https://api.synthesia.io/v2';

export class SynthesiaService {
  private apiKey: string;
  private avatarId: string;

  constructor() {
    this.apiKey = process.env.SYNTHESIA_API_KEY || '';
    this.avatarId = process.env.SYNTHESIA_AVATAR_ID || '';
  }

  async generateVideo(script: string): Promise<{ id: string }> {
    try {
      console.log('Generating Synthesia video for script:', script.substring(0, 50) + '...');
      const response = await axios.post(
        `${SYNTHESIA_API_URL}/videos`,
        {
          test: true,
          visibility: 'private',
          title: `Michael Response - ${Date.now()}`,
          input: [
            {
              avatarSettings: {
                horizontalAlign: 'center',
                scale: 1,
                style: 'rectangular',
              },
              scriptText: script,
              avatar: this.avatarId,
              background: 'off_white',
            },
          ],
        },
        {
          headers: {
            Authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Synthesia video created:', response.data);
      return { id: response.data.id };
    } catch (error: any) {
      console.error('Synthesia generation error:', error.response?.data || error.message);
      throw new Error(`Video generation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getVideoStatus(videoId: string) {
    try {
      const response = await axios.get(
        `${SYNTHESIA_API_URL}/videos/${videoId}`,
        {
          headers: {
            Authorization: this.apiKey,
          },
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        url: response.data.download,
        duration: response.data.duration,
      };
    } catch (error: any) {
      console.error('Status check error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const synthesiaService = new SynthesiaService();
