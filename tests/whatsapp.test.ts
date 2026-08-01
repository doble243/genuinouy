import { describe, it, expect } from 'vitest';
import { formatWhatsAppMessage } from '../src/utils/whatsapp';
import { CartItem, CustomerInfo } from '../src/types';

describe('WhatsApp Dispatcher Unit Tests', () => {
  const sampleCustomer: CustomerInfo = {
    name: 'Juan Pérez',
    address: 'Av. 18 de Julio 1234',
    city: 'Montevideo',
    notes: 'Entregar por la tarde'
  };

  const sampleItems: CartItem[] = [
    {
      cartItemId: 'item-1-41',
      product: {
        id: 'item-1',
        name: 'Adidas Campus',
        category: 'Campus',
        brand: 'Adidas',
        gender: 'Unisex',
        price: 2990,
        currency: 'UYU',
        formattedPrice: '$ 2.990 UYU',
        description: 'Test product',
        availableQuantity: 5,
        inStock: true,
        status: 'Nuevo',
        sku: 'RR0001',
        whatsappLink: '',
        sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
        images: ['/fotos_productos/Adidas_Campus_1.jpg']
      },
      selectedSize: 41,
      quantity: 2
    }
  ];

  it('should format WhatsApp order message correctly with customer info and product items', () => {
    const total = 5980;
    const message = formatWhatsAppMessage(sampleItems, sampleCustomer, total);

    expect(message).toContain('🛍️ *NUEVO PEDIDO - GENUINOS UY*');
    expect(message).toContain('👤 *Cliente:* Juan Pérez');
    expect(message).toContain('📍 *Dirección:* Av. 18 de Julio 1234, Montevideo');
    expect(message).toContain('📝 *Notas:* Entregar por la tarde');
    expect(message).toContain('• Adidas Campus (Talle: 41) x2 - $5.980 UYU');
    expect(message).toContain('💰 *TOTAL:* $5.980 UYU');
  });

  it('should handle optional notes gracefully when empty', () => {
    const customerNoNotes: CustomerInfo = {
      name: 'María Silva',
      address: 'Calle Gorlero 500',
      city: 'Punta del Este'
    };
    const message = formatWhatsAppMessage(sampleItems, customerNoNotes, 5980);
    expect(message).toContain('📝 *Notas:* Sin notas');
  });

  it('should generate proper WhatsApp deep link target with phone 59891722213', () => {
    const message = formatWhatsAppMessage(sampleItems, sampleCustomer, 5980);
    const encoded = encodeURIComponent(message);
    const expectedPrefix = 'https://wa.me/59891722213?text=';
    expect(`https://wa.me/59891722213?text=${encoded}`).toContain(expectedPrefix);
  });
});
