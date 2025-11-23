import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/database';

class ReceiptService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async processReceipt(imageBuffer: Buffer, userId: string) {
    try {
      // Optimize image for OCR
      const optimizedImage = await sharp(imageBuffer)
        .resize(2000, null, { withoutEnlargement: true })
        .greyscale()
        .normalize()
        .toBuffer();

      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(optimizedImage, 'eng');

      // Extract structured data using AI
      const receiptData = await this.extractReceiptData(text);

      return {
        ocrText: text,
        ...receiptData,
      };
    } catch (error) {
      console.error('Process receipt error:', error);
      throw error;
    }
  }

  async extractReceiptData(ocrText: string) {
    try {
      const prompt = `Extract structured data from this receipt OCR text:

${ocrText}

Return ONLY valid JSON with this structure:
{
  "merchantName": "store name",
  "amount": total amount as number,
  "date": "YYYY-MM-DD",
  "category": "Food & Dining" | "Shopping" | "Transportation" | "Entertainment" | "Education" | "Bills & Utilities" | "Healthcare" | "Other",
  "items": [
    {"name": "item name", "price": number, "quantity": number}
  ],
  "paymentMethod": "card type or cash",
  "taxAmount": number or null,
  "tipAmount": number or null
}

If you cannot extract a field, use null. Be accurate with the total amount.`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const dataText = responseText.replace(/```json\n?|\n?```/g, '');
      
      try {
        const data = JSON.parse(dataText);
        return data;
      } catch (e) {
        console.error('Failed to parse AI response as JSON:', dataText);
        return {
            merchantName: null,
            amount: null,
            date: new Date().toISOString().split('T')[0],
            category: 'Other',
            items: [],
        };
      }
    } catch (error) {
      console.error('Extract receipt data error:', error);
      return {
        merchantName: null,
        amount: null,
        date: new Date().toISOString().split('T')[0],
        category: 'Other',
        items: [],
      };
    }
  }

  async saveReceipt(userId: string, imageUrl: string, receiptData: any, transactionId: string | null = null) {
    try {
      const result = await prisma.receipt.create({
        data: {
          userId,
          transactionId: transactionId || undefined,
          imageUrl,
          merchantName: receiptData.merchantName,
          amount: receiptData.amount ? parseFloat(receiptData.amount) : null,
          date: receiptData.date ? new Date(receiptData.date) : null,
          category: receiptData.category,
          items: receiptData.items ? JSON.stringify(receiptData.items) : undefined,
          ocrText: receiptData.ocrText,
        },
      });

      // If amount and merchant found, create transaction if doesn't exist
      if (receiptData.amount && receiptData.merchantName && !transactionId) {
        // Find a bank account to associate with (simplified)
        const account = await prisma.bankAccount.findFirst({ where: { userId } });
        
        if (account) {
            await prisma.transaction.create({
                data: {
                    userId,
                    bankAccountId: account.id,
                    description: receiptData.merchantName,
                    amount: -Math.abs(receiptData.amount),
                    type: 'debit',
                    category: receiptData.category,
                    date: receiptData.date ? new Date(receiptData.date) : new Date(),
                    merchantName: receiptData.merchantName,
                    tellerTransactionId: `receipt_${result.id}`,
                    status: 'completed',
                }
            });
        }
      }

      return result;
    } catch (error) {
      console.error('Save receipt error:', error);
      throw error;
    }
  }
}

export default new ReceiptService();
