// Order types
export type OrderStatus = 
  | 'PENDING'          // 1. Chờ xác nhận
  | 'CONFIRMED'        // 2. Đã xác nhận
  | 'PROCESSING'       // 3. Đang xử lý
  | 'SHIPPING'         // 4. Đang giao hàng
  | 'DELIVERED'        // 5. Đã giao thành công
  | 'CANCELLED'        // 6. Đã hủy
  | 'NEW'              // legacy
  | 'PREPARING'        // legacy
  | 'CANCEL_REQUESTED'; // Yêu cầu hủy đơn

export type PaymentMethod = 'COD' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER' | 'CREDIT_CARD';

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  note?: string;
}

export interface Order {
  id: string;          // order_number
  numericId?: number;  // orders.id (bigint) - dùng cho review
  order_number?: string;
  code?: string;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  deliveredAt?: string;
  canCancel: boolean; // Chỉ cho phép hủy trong 30 phút
  cancelDeadline?: string;
}
