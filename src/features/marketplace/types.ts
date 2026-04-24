import type { Timestamp } from "firebase/firestore";

export type ProductStatus = "pending" | "approved" | "rejected";

export interface Product {
  id: string;
  vendorId: string;
  vendorDisplayName: string;
  name: string;
  nameLower: string;
  description: string;
  price: number;
  currency: string;
  imageURL: string | null;
  stock: number;
  isActive: boolean;
  status: ProductStatus;
  rejectionReason: string | null;
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

export type OrderStatus = "pending" | "accepted" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type PaymentMethod = "cod";

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  governorate: string;
  city: string;
  addressLine: string;
  notes: string;
}

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
  shippingFee: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface PlaceOrderInput {
  items: CartItem[];
  shippingAddress: ShippingAddress;
}

export type ReturnStatus = "pending" | "approved" | "rejected";

export interface ReturnRequest {
  id: string;
  orderId: string;
  buyerId: string;
  vendorId: string;
  reason: string;
  imageURLs: string[];
  status: ReturnStatus;
  adminNote: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface CreateReturnInput {
  orderId: string;
  vendorId: string;
  reason: string;
  imageFiles: File[];
}
