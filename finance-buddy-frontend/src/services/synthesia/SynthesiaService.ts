import axios from 'axios';

const API_URL = 'http://localhost:3001/api/banker';

interface VideoStatus {
  id: string;
  status: 'in_progress' | 'complete' | 'failed';
  url?: string;
  duration?: number;
  error?: string;
}

class SynthesiaService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async generateVideo(script: string): Promise<{ id: string }> {
    const response = await axios.post(
      `${API_URL}/video`,
      { script },
      { headers: this.getHeaders() }
    );
    return { id: response.data.id };
  }

  async getVideoStatus(videoId: string): Promise<VideoStatus> {
    const response = await axios.get(
      `${API_URL}/video/${videoId}`,
      { headers: this.getHeaders() }
    );

    return {
      id: response.data.id,
      status: response.data.status,
      url: response.data.url,
      duration: response.data.duration,
    };
  }

  async waitForVideo(videoId: string, maxAttempts = 120): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getVideoStatus(videoId);

      if (status.status === 'complete' && status.url) {
        return status.url;
      }

      if (status.status === 'failed') {
        throw new Error('Video generation failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    throw new Error('Video generation timeout');
  }

  async generateAndWaitForVideo(script: string): Promise<string> {
    const { id } = await this.generateVideo(script);
    return this.waitForVideo(id);
  }
}

export const synthesiaService = new SynthesiaService();
