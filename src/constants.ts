import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Camiseta Oversized Glitch',
    description: 'Camiseta com estampa glitch urbana, 100% algodão premium, caimento oversized.',
    price: 129.90,
    discountPrice: 99.90,
    category: 'Camisetas',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Branco'],
    images: ['https://picsum.photos/seed/streetwear-oversized-tshirt/800/1000'],
    stock: 15,
    rating: 4.8,
    reviews: []
  },
  {
    id: '2',
    name: 'Calça Cargo Neon Tech',
    description: 'Calça cargo com detalhes em neon refletivo, múltiplos bolsos e ajuste no tornozelo.',
    price: 249.90,
    discountPrice: 199.90,
    category: 'Calças',
    sizes: ['38', '40', '42', '44'],
    colors: ['Cinza', 'Preto'],
    images: ['https://picsum.photos/seed/streetwear-cargo-pants/800/1000'],
    stock: 5,
    rating: 4.9,
    reviews: []
  },
  {
    id: '3',
    name: 'Moletom Cyberpunk Hoodie',
    description: 'Moletom pesado com capuz, estampa cyberpunk e interior flanelado.',
    price: 299.90,
    category: 'Moletons',
    sizes: ['M', 'G', 'GG'],
    colors: ['Preto', 'Roxo'],
    images: ['https://picsum.photos/seed/streetwear-hoodie-black/800/1000'],
    stock: 10,
    rating: 4.7,
    reviews: []
  },
  {
    id: '4',
    name: 'Boné Strapback Urban',
    description: 'Boné strapback com aba curva e bordado minimalista.',
    price: 89.90,
    discountPrice: 69.90,
    category: 'Acessórios',
    sizes: ['Único'],
    colors: ['Preto', 'Branco', 'Verde'],
    images: ['https://picsum.photos/seed/streetwear-cap/800/1000'],
    stock: 20,
    rating: 4.5,
    reviews: []
  },
  {
    id: '5',
    name: 'Jaqueta Bomber Reflective',
    description: 'Jaqueta bomber com tecido totalmente refletivo sob luz direta.',
    price: 399.90,
    category: 'Jaquetas',
    sizes: ['P', 'M', 'G'],
    colors: ['Cinza'],
    images: ['https://picsum.photos/seed/streetwear-bomber-jacket/800/1000'],
    stock: 3,
    rating: 5.0,
    reviews: []
  },
  {
    id: '6',
    name: 'Tênis Street Walker',
    description: 'Tênis cano alto com sola robusta e design futurista.',
    price: 459.90,
    discountPrice: 389.90,
    category: 'Calçados',
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['Preto/Neon', 'Branco/Cinza'],
    images: ['https://picsum.photos/seed/streetwear-sneakers/800/1000'],
    stock: 8,
    rating: 4.9,
    reviews: []
  }
];
