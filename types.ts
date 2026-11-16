
export interface PackageInfo {
  weight: number;
  length: number;
  width: number;
  height: number;
  origin: 'España' | 'Camerún' | 'Guinea Ecuatorial';
  destination: 'Malabo' | 'Bata' | 'Ebebiyín' | 'Mongomo' | 'Luba' | 'España';
  type: 'Aéreo' | 'Marítimo' | 'Documento';
}

export interface TrackingStep {
  date: string;
  status: string;
  location: string;
  completed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum ShippingStatus {
  COLLECTED = 'Recogido',
  IN_TRANSIT = 'En tránsito',
  CUSTOMS = 'En Aduanas',
  ARRIVED = 'Llegado a destino',
  DELIVERED = 'Entregado'
}

export interface Product {
  id: string;
  name: string;
  color: string;
  price: string;
  description: string;
  image: string;
  /** Fotos del producto (la primera es la principal). Si falta, se usa `image`. */
  images?: string[];
  /** Tallas a elegir (ej. camiseta). */
  tallas?: string[];
  tag: string;
  slogan: string;
  waLink: string;
}

export interface AppConfig {
  logoText: string;
  customLogoUrl?: string;
}
