import type { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  vendorId: string;
  vendorDisplayName: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageURL: string | null;
  stock: number;
  isActive: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageFile?: File | null;
  currency?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageFile?: File | null;
  isActive?: boolean;
}

export interface CartItem {
  productId: string;
  vendorId: string;
  name: string;
  unitPrice: number;
  imageURL: string | null;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Timestamp | null;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderLine {
  productId: string;
  vendorId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageURL: string | null;
}

export interface Order {
  id: string;
  buyerId: string;
  vendorId: string;
  lines: OrderLine[];
  subtotal: number;
  currency: string;
  status: OrderStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
