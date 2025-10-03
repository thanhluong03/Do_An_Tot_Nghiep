export interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role: {
    id?: string;
    name?: string;
    permissions?: string[];
  };
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  preferences: UserPreferences;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  phone: string;
  recipientName: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  currency: string;
}
