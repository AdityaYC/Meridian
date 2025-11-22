import { api } from '../../lib/api';

export class TavusService {
    async createConversation(personaContext: string) {
        try {
            const response = await api.post('/banker/conversation', {
                personaContext
            });

            return response.data;
        } catch (error: any) {
            console.error('Tavus create conversation error:', error.response?.data || error.message);
            throw new Error('Failed to create conversation with Raj');
        }
    }

    async getPersona() {
        try {
            const response = await api.get('/banker/persona');
            return response.data;
        } catch (error: any) {
            console.error('Tavus get persona error:', error.response?.data || error.message);
            return null;
        }
    }

    async getConversationUrl(_conversationId: string) {
        // This method is no longer needed as the URL is returned by createConversation
        // But keeping it for compatibility if needed, or we can remove it.
        // For now, let's just return null or throw, but better to just remove usage in BankerPage.
        return null;
    }

    async endConversation(conversationId: string) {
        try {
            await api.post('/banker/conversation/end', {
                conversationId
            });
        } catch (error: any) {
            console.error('Tavus end conversation error:', error.response?.data || error.message);
        }
    }
}

export const tavusService = new TavusService();
