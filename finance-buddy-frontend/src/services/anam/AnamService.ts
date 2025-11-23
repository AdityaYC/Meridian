import { unsafe_createClientWithApiKey } from '@anam-ai/js-sdk';

export class AnamService {
  private client: any = null;
  private personaId: string;
  private apiKey: string;
  private onStatusCallback: ((status: string) => void) | null = null;
  private isStreaming: boolean = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_ANAM_API_KEY || '';
    this.personaId = import.meta.env.VITE_ANAM_PERSONA_ID || '';
  }

  async initialize(videoElementId: string): Promise<void> {
    try {
      console.log('Initializing Anam client...');
      console.log('API Key:', this.apiKey ? 'Present' : 'Missing');
      console.log('Persona ID:', this.personaId);

      if (!this.apiKey || !this.personaId) {
        throw new Error('Anam API key or Persona ID not configured');
      }

      this.client = unsafe_createClientWithApiKey(this.apiKey, {
        personaId: this.personaId,
      } as any);

      console.log('Anam client created');
      this.onStatusCallback?.('connecting');

      await this.client.streamToVideoElement(videoElementId);
      
      this.isStreaming = true;
      console.log('Anam streaming started');
      this.onStatusCallback?.('connected');

    } catch (error: any) {
      console.error('Anam initialization error:', error);
      this.onStatusCallback?.('error');
      throw new Error(`Failed to initialize Anam: ${error.message}`);
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.client) {
      throw new Error('Anam client not initialized');
    }

    try {
      console.log('Sending message to Michael:', message);
    } catch (error: any) {
      console.error('Send message error:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isStreaming) {
      try {
        this.client.stopStreaming();
        console.log('Anam client disconnected');
        this.client = null;
        this.isStreaming = false;
        this.onStatusCallback?.('disconnected');
      } catch (error: any) {
        console.error('Disconnect error:', error);
      }
    }
  }

  onMessage(_callback: (message: string) => void): void {
    // Callback functionality to be implemented
  }

  onConnectionStatus(callback: (status: string) => void): void {
    this.onStatusCallback = callback;
  }

  isConnected(): boolean {
    return this.client !== null && this.isStreaming;
  }
}

export const anamService = new AnamService();
