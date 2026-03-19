export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  rating: number;
  reviews: Review[];
}

export interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  address?: Address;
  wishlist?: string[];
  role: 'admin' | 'client';
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'Residencial' | 'Comercial';
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentId?: string;
  address?: Address;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entry' | 'exit';
  quantity: number;
  value: number;
  reason: string;
  createdAt: string;
}
