import { describe, it, expect } from 'vitest';
import { parseCSVLine, parseProductRow, parseCSVContent } from '../scripts/parse-csv.js';

describe('CSV Parser Unit Tests', () => {
  it('should correctly parse a quoted CSV line', () => {
    const line = '81101293,"Adidas 2000","Nuevos Ingresos",Adidas,Unisex,2550,UYU,"$ 2.550 UYU","Sin descripción",1,Nuevo,RR0002';
    const fields = parseCSVLine(line);
    expect(fields[0]).toBe('81101293');
    expect(fields[1]).toBe('Adidas 2000');
    expect(fields[2]).toBe('Nuevos Ingresos');
    expect(fields[5]).toBe('2550');
  });

  it('should parse a complete product row into structured object', () => {
    const headers = ['ID', 'Nombre', 'Categoría/Modelo', 'Marca', 'Género', 'Precio', 'Moneda', 'Precio Formateado', 'Descripción', 'Cantidad Disponible', 'Estado', 'SKU', 'Enlace de Compra (WhatsApp)', 'Fotos Locales'];
    const row = [
      'test-id-1',
      'Nike Air Max',
      'Air Max',
      'Nike',
      'Hombre',
      '3500',
      'UYU',
      '$ 3.500 UYU',
      'Zapatillas deportivas',
      '5',
      'Nuevo',
      'NK001',
      'https://wa.me/59891722213',
      'Nike_Air_Max_1.jpg; Nike_Air_Max_2.jpg'
    ];

    const product = parseProductRow(headers, row);
    expect(product.id).toBe('test-id-1');
    expect(product.name).toBe('Nike Air Max');
    expect(product.brand).toBe('Nike');
    expect(product.gender).toBe('Hombre');
    expect(product.price).toBe(3500);
    expect(product.formattedPrice).toBe('$ 3.500 UYU');
    expect(product.sizes).toEqual([36, 37, 38, 39, 40, 41, 42, 43, 44]);
    expect(product.images).toEqual([
      '/fotos_productos/Nike_Air_Max_1.jpg',
      '/fotos_productos/Nike_Air_Max_2.jpg'
    ]);
  });

  it('should throw error for non-numeric price', () => {
    const headers = ['ID', 'Nombre', 'Precio'];
    const row = ['test-id-2', 'Bad Item', 'abc_not_a_number'];
    expect(() => parseProductRow(headers, row)).toThrow(/Invalid non-numeric price/);
  });

  it('should throw error for missing ID or Name', () => {
    const headers = ['ID', 'Nombre', 'Precio'];
    const row = ['', 'No ID Item', '2000'];
    expect(() => parseProductRow(headers, row)).toThrow(/Malformed product row/);
  });

  it('should parse entire CSV content string', () => {
    const csvData = `ID,Nombre,Categoría/Modelo,Marca,Género,Precio,Moneda,Precio Formateado,Descripción,Cantidad Disponible,Estado,SKU,Enlace de Compra (WhatsApp),Fotos Locales
id-100,Puma Suede,Suede,Puma,Unisex,2200,UYU,$ 2.200 UYU,Puma clasica,2,Nuevo,PM01,https://wa.me/59891722213,Puma_Suede_1.jpg`;

    const products = parseCSVContent(csvData);
    expect(products.length).toBe(1);
    expect(products[0].name).toBe('Puma Suede');
    expect(products[0].price).toBe(2200);
  });
});
