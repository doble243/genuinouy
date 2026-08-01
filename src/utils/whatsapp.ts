import { CartItem, CustomerInfo } from '../types';

export function formatWhatsAppMessage(items: CartItem[], customer: CustomerInfo, total: number): string {
  const notesText = customer.notes && customer.notes.trim().length > 0 ? customer.notes.trim() : 'Sin notas';

  const productLines = items.map(item => {
    const subtotal = item.product.price * item.quantity;
    const formattedSubtotal = subtotal.toLocaleString('es-UY');
    return `• ${item.product.name} (Talle: ${item.selectedSize}) x${item.quantity} - $${formattedSubtotal} UYU`;
  }).join('\n');

  const formattedTotal = total.toLocaleString('es-UY');

  return `🛍️ *NUEVO PEDIDO - GENUINOS UY*

👤 *Cliente:* ${customer.name || 'Consulta Directa'}
📍 *Dirección:* ${customer.address ? `${customer.address}, ${customer.city}` : 'A coordinar'}
📝 *Notas:* ${notesText}

🛒 *PRODUCTOS:*
${productLines}

💰 *TOTAL:* $${formattedTotal} UYU`;
}

export function createWhatsAppOrderUrl(items: CartItem[], customer: CustomerInfo, total?: number): string {
  const calculatedTotal = total ?? items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const message = formatWhatsAppMessage(items, customer, calculatedTotal);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/59891722213?text=${encodedText}`;
}

export function sendWhatsAppOrder(items: CartItem[], customer: CustomerInfo, total: number): void {
  const whatsappUrl = createWhatsAppOrderUrl(items, customer, total);
  
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }
}
