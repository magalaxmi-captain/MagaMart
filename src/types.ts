export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  password?: string; // In database, stored as hashed
  fullName: string;
  role: UserRole;
  createdAt?: string;
}

export interface Product {
  product_id: number;
  name: string;
  category: 'Sensors' | 'Dev Boards' | 'Wireless & IoT' | 'Actuators & Power' | 'Prototyping Gear';
  description: string;
  price: number;
  stock_quantity: number;
  sku: string;
  imageUrl?: string;
  voltage?: string;
  interfaceType?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  order_id: number;
  user_id: number;
  user_email: string;
  total_amount: number;
  items_count: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED';
  created_at: string;
}

export interface JavaCodeFile {
  id: string;
  fileName: string;
  path: string;
  language: 'java' | 'jsp' | 'sql' | 'xml' | 'html' | 'javascript';
  category: 'Configuration' | 'Model' | 'DAO' | 'Servlet / Controller' | 'Filter / Security' | 'View (JSP/HTML)' | 'Database';
  description: string;
  code: string;
}
