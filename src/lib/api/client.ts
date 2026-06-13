// Centralized frontend API client for NexaStock

const DEFAULT_API_URL = "http://localhost:4000/api/v1";

export function getApiUrl(): string {
  // Read from Vite environment variable or default to localhost:4000
  return (import.meta.env.VITE_API_URL as string) || DEFAULT_API_URL;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  roleLabel: string;
  tenantId: string;
}

// Local storage keys
const TOKEN_KEY = "nexastock_token";
const PROFILE_KEY = "nexastock_profile";
const TENANT_KEY = "nexastock_tenant_id";

export const authState = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  getProfile(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const profile = localStorage.getItem(PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  },
  setProfile(profile: UserProfile) {
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      localStorage.setItem(TENANT_KEY, profile.tenantId);
    }
  },
  getTenantId(): string {
    if (typeof window === "undefined") return "tenant_acme";
    return localStorage.getItem(TENANT_KEY) || "tenant_acme";
  },
  setTenantId(tenantId: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TENANT_KEY, tenantId);
    }
  },
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(TENANT_KEY);
    }
  },
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
};

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${getApiUrl()}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  const token = authState.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const tenantId = authState.getTenantId();
  if (tenantId) {
    headers["x-tenant-id"] = tenantId;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let errMsg = "API Request failed";
    try {
      const errorJson = await response.json();
      errMsg = errorJson.error?.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const resJson = await response.json();
  return resJson.data as T;
}

// Client methods mapping directly to backend routes
export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const result = await apiRequest<{ token: string; user: UserProfile }>("POST", "/auth/login", {
      email,
      password,
      tenantId: authState.getTenantId()
    });
    authState.setToken(result.token);
    authState.setProfile(result.user);
    return result;
  },

  // Onboarding
  async startOnboarding(payload: any): Promise<any> {
    const result = await apiRequest<any>("POST", "/onboarding/start", payload);
    if (result.token) {
      authState.setToken(result.token);
    }
    if (result.user) {
      authState.setProfile(result.user);
    }
    if (result.tenant?.id) {
      authState.setTenantId(result.tenant.id);
    }
    return result;
  },

  // Tenants & Meta
  async getTenantSummary(): Promise<any> {
    return apiRequest<any>("GET", "/tenants/current");
  },

  async getUsers(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/users");
  },

  // Locations
  async getLocations(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/locations");
  },

  async createLocation(location: {
    name: string;
    code: string;
    type: string;
    city: string;
    state: string;
    country: string;
  }): Promise<any> {
    return apiRequest<any>("POST", "/locations", location);
  },

  // Products
  async getProducts(category?: string): Promise<any[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return apiRequest<any[]>("GET", `/products${query}`);
  },

  async createProduct(product: {
    sku: string;
    name: string;
    category: string;
    unitOfMeasure: string;
    purchasePrice: number;
    sellingPrice: number;
    reorderLevel: number;
    reorderQuantity: number;
    taxRate?: number;
    industry: string;
    brand?: string;
  }): Promise<any> {
    return apiRequest<any>("POST", "/products", product);
  },

  // Suppliers
  async getSuppliers(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/suppliers");
  },

  // Inventory
  async getInventoryBalances(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/inventory/balances");
  },

  async getInventoryMovements(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/inventory/movements");
  },

  async adjustInventory(adjustment: {
    productId: string;
    locationId: string;
    quantity: number;
    reason: string;
  }): Promise<any> {
    return apiRequest<any>("POST", "/inventory/adjustments", adjustment);
  },

  // Transfers
  async getTransfers(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/transfers");
  },

  async createTransfer(transfer: {
    fromLocationId: string;
    toLocationId: string;
    items: Array<{ productId: string; requestedQuantity: number }>;
  }): Promise<any> {
    return apiRequest<any>("POST", "/transfers", transfer);
  },

  // POS
  async getPOSSummary(): Promise<any> {
    return apiRequest<any>("GET", "/pos/summary");
  },

  async createPOSInvoice(invoice: {
    locationId: string;
    paymentMode: string;
    customerName?: string;
    customerPhone?: string;
    lines: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      discount: number;
    }>;
  }): Promise<any> {
    return apiRequest<any>("POST", "/pos/invoices", invoice);
  },

  // Analytics
  async getAnalyticsDashboard(): Promise<any> {
    return apiRequest<any>("GET", "/analytics/dashboard");
  },

  // AI Insights
  async getAIInsights(): Promise<any> {
    return apiRequest<any>("GET", "/ai/insights");
  },

  // Audit Events
  async getAuditEvents(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/audit/events");
  },

  // Profile
  async getProfile(): Promise<any> {
    return apiRequest<any>("GET", "/settings/profile");
  },

  // Modules
  async getModules(): Promise<any> {
    return apiRequest<any>("GET", "/modules");
  }
};
