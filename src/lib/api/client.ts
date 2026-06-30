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
  effectivePermissions?: string[];
  assignedLocations?: string[];
}

// Local storage keys
const TOKEN_KEY = "nexastock_token";
const REFRESH_TOKEN_KEY = "nexastock_refresh_token";
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
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
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
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(TENANT_KEY);
    }
  },
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
};

let refreshPromise: Promise<{ token: string; refreshToken: string }> | null = null;

async function doRefresh(): Promise<{ token: string; refreshToken: string }> {
  if (!refreshPromise) {
    const refreshToken = authState.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const url = `${getApiUrl()}/auth/refresh`;
    refreshPromise = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": authState.getTenantId()
      },
      body: JSON.stringify({ refreshToken })
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Refresh failed");
        }
        const data = await res.json();
        return data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

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

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    throw new Error("Network error occurred. Please check your internet connection and try again.");
  }

  if (!response.ok) {
    if (response.status === 401 && !path.includes("/auth/refresh")) {
      try {
        const refreshResult = await doRefresh();
        authState.setToken(refreshResult.token);
        authState.setRefreshToken(refreshResult.refreshToken);

        // Fetch profile to update permissions dynamically
        try {
          const profileRes = await fetch(`${getApiUrl()}/settings/profile`, {
            headers: {
              "Authorization": `Bearer ${refreshResult.token}`,
              "x-tenant-id": authState.getTenantId()
            }
          });
          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            if (profileJson.data && profileJson.data.user) {
              authState.setProfile(profileJson.data.user);
            }
          }
        } catch (profileErr) {
          console.error("Failed to sync profile on refresh:", profileErr);
        }

        // Retry the original request
        headers["Authorization"] = `Bearer ${refreshResult.token}`;
        const retryResponse = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined
        });

        if (retryResponse.ok) {
          if (retryResponse.status === 204) {
            return undefined as unknown as T;
          }
          const resJson = await retryResponse.json();
          return resJson.data as T;
        }

        response = retryResponse;
      } catch (refreshErr) {
        authState.logout();
        if (typeof window !== "undefined") {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
        throw new Error("Session expired. Please sign in again.");
      }
    }
  }

  if (!response.ok) {
    let errMsg = "API Request failed";
    try {
      const errorJson = await response.json();
      const serverMsg = errorJson.error?.message;
      const errorCode = errorJson.error?.code;

      if (serverMsg) {
        errMsg = serverMsg;
      }

      // Map Prisma & database unique constraint errors or custom errors to friendly client messages
      if (errorCode === "P2002" || errMsg.toLowerCase().includes("unique constraint") || errMsg.toLowerCase().includes("already registered")) {
        errMsg = "This email address is already registered.";
      } else if (errMsg.toLowerCase().includes("invalid credentials") || errMsg.toLowerCase().includes("invalid email or password")) {
        errMsg = "Invalid email or password.";
      } else if (response.status === 401 || errMsg.toLowerCase().includes("session expired") || errMsg.toLowerCase().includes("unauthorized")) {
        errMsg = "Session expired or unauthorized. Please sign in again.";
      } else if (response.status === 404 || errMsg.toLowerCase().includes("not found")) {
        errMsg = "Account not found.";
      }
    } catch {
      if (response.status === 401) {
        errMsg = "Session expired. Please sign in again.";
      } else if (response.status === 403) {
        errMsg = "Invalid email or password.";
      } else if (response.status === 404) {
        errMsg = "Account not found.";
      }
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
  async login(email: string, password: string): Promise<{ token: string; refreshToken?: string; user: UserProfile }> {
    const result = await apiRequest<{ token: string; refreshToken?: string; user: UserProfile }>("POST", "/auth/login", {
      email,
      password,
      tenantId: authState.getTenantId()
    });
    authState.setToken(result.token);
    if (result.refreshToken) {
      authState.setRefreshToken(result.refreshToken);
    }
    authState.setProfile(result.user);
    return result;
  },

  async googleLogin(credential: string): Promise<{ isNewUser?: boolean; email?: string; fullName?: string; googleId?: string; token?: string; refreshToken?: string; user?: UserProfile }> {
    const result = await apiRequest<any>("POST", "/auth/google", { credential });
    if (result.token) {
      authState.setToken(result.token);
    }
    if (result.refreshToken) {
      authState.setRefreshToken(result.refreshToken);
    }
    if (result.user) {
      authState.setProfile(result.user);
    }
    return result;
  },

  // Onboarding
  async startOnboarding(payload: any): Promise<any> {
    const result = await apiRequest<any>("POST", "/onboarding/start", payload);
    if (result.token) {
      authState.setToken(result.token);
    }
    if (result.refreshToken) {
      authState.setRefreshToken(result.refreshToken);
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
    quantity?: number;
    locationId?: string;
  }): Promise<any> {
    return apiRequest<any>("POST", "/products", product);
  },

  async updateProduct(id: string, product: {
    sku?: string;
    name?: string;
    category?: string;
    unitOfMeasure?: string;
    purchasePrice?: number;
    sellingPrice?: number;
    reorderLevel?: number;
    reorderQuantity?: number;
    taxRate?: number;
    industry?: string;
    brand?: string | null;
  }): Promise<any> {
    return apiRequest<any>("PUT", `/products/${id}`, product);
  },

  // Suppliers
  async getSuppliers(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/suppliers");
  },

  async createSupplier(supplier: {
    name: string;
    code?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  }): Promise<any> {
    return apiRequest<any>("POST", "/suppliers", supplier);
  },

  async updateSupplier(id: string, supplier: {
    name?: string;
    code?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    status?: "active" | "paused";
  }): Promise<any> {
    return apiRequest<any>("PUT", `/suppliers/${id}`, supplier);
  },

  async setSupplierProducts(id: string, productIds: string[]): Promise<any> {
    return apiRequest<any>("PUT", `/suppliers/${id}/products`, { productIds });
  },

  async deleteSupplier(id: string): Promise<any> {
    return apiRequest<any>("DELETE", `/suppliers/${id}`);
  },

  async sendSupplierOrder(id: string, order: {
    items: Array<{ productId: string; quantity: number }>;
    notes?: string;
  }): Promise<{ success: boolean; poId: string; poNumber: string; grandTotal: number; formattedMessage: string; phone: string; email: string }> {
    return apiRequest<any>("POST", `/suppliers/${id}/send-order`, order);
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

  async importInventory(payload: {
    locationId: string;
    fileType: "csv" | "xlsx";
    items: Array<{
      sku: string;
      name: string;
      category: string;
      quantity: number;
      unit: string;
      purchasePrice: number;
      sellingPrice: number;
      reorderLevel: number;
    }>;
  }): Promise<{ success: boolean; added: number; updated: number }> {
    return apiRequest<any>("POST", "/inventory/import", payload);
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
  async getAnalyticsDashboard(startDate?: string, endDate?: string, extraParams?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    let query = params.toString() ? `?${params.toString()}` : "";
    if (extraParams) {
      const cleanParams = extraParams.startsWith("?") ? extraParams.substring(1) : extraParams;
      query = query ? `${query}&${cleanParams}` : `?${cleanParams}`;
    }
    return apiRequest<any>("GET", `/analytics/dashboard${query}`);
  },


  // AI Insights
  async getAIInsights(): Promise<any> {
    return apiRequest<any>("GET", "/ai/insights");
  },

  async askAIQuery(queryStr: string): Promise<any> {
    return apiRequest<any>("POST", "/ai/query", { query: queryStr });
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
  },

  // Team Management & Invitations
  async inviteUser(
    email: string, 
    fullName: string, 
    roleId: string,
    extra?: {
      assignedLocations?: string[];
      permissionOverrides?: Array<{ permissionId: string; allowed: boolean }>;
      department?: string;
      reportsTo?: string;
      userProfile?: {
        jobTitle?: string;
        dateOfBirth?: string;
        phoneNumber?: string;
        emergencyContact?: string;
        emergencyPhone?: string;
        hireDate?: string;
        employmentType?: string;
        workSchedule?: string;
        probationEndDate?: string;
        managerUserId?: string;
        skills?: string[];
        certifications?: string[];
        nationalId?: string;
        passportNumber?: string;
        taxId?: string;
        bankAccountNumber?: string;
        bankName?: string;
        bankBranch?: string;
        languagesSpoken?: string[];
        profileImageUrl?: string;
        notes?: string;
      };
    }
  ): Promise<any> {
    const payload: any = { email, fullName, roleId };
    if (extra) {
      if (extra.assignedLocations) payload.assignedLocations = extra.assignedLocations;
      if (extra.permissionOverrides) payload.permissionOverrides = extra.permissionOverrides;
      if (extra.department) payload.department = extra.department;
      if (extra.reportsTo) payload.reportsTo = extra.reportsTo;
      if (extra.userProfile) payload.userProfile = extra.userProfile;
    }
    return apiRequest<any>("POST", "/users/invite", payload);
  },

  async resendInvitation(userId: string): Promise<any> {
    return apiRequest<any>("POST", `/users/${userId}/resend-invite`);
  },

  async cancelInvitation(userId: string): Promise<any> {
    return apiRequest<any>("POST", `/users/${userId}/cancel-invite`);
  },

  async updateUserRole(userId: string, roleId: string): Promise<any> {
    return apiRequest<any>("PUT", `/users/${userId}/role`, { roleId });
  },

  async deactivateUser(userId: string): Promise<any> {
    return apiRequest<any>("POST", `/users/${userId}/deactivate`);
  },

  async reactivateUser(userId: string): Promise<any> {
    return apiRequest<any>("POST", `/users/${userId}/reactivate`);
  },

  async removeUser(userId: string): Promise<any> {
    return apiRequest<any>("DELETE", `/users/${userId}`);
  },

  // Public invitation acceptance
  async getInvitationDetails(token: string): Promise<any> {
    return apiRequest<any>("GET", `/auth/invitation/${token}`);
  },

  async acceptInvitation(payload: { token: string; password?: string }): Promise<any> {
    return apiRequest<any>("POST", "/auth/invitation/accept", payload);
  },

  // Profile and password
  async updateProfile(payload: { fullName: string; email: string }): Promise<any> {
    return apiRequest<any>("PUT", "/settings/profile", payload);
  },

  async changePassword(payload: any): Promise<any> {
    return apiRequest<any>("PUT", "/settings/password", payload);
  },

  // Security policy and sessions
  async getActiveSessions(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/security/sessions");
  },

  async revokeOtherSessions(currentSessionId?: string): Promise<any> {
    return apiRequest<any>("POST", "/security/sessions/revoke-others", { currentSessionId });
  },

  async getPasswordPolicy(): Promise<any> {
    return apiRequest<any>("GET", "/security/policy");
  },

  async updatePasswordPolicy(payload: any): Promise<any> {
    return apiRequest<any>("PUT", "/security/policy", payload);
  },

  // Notification Preferences
  async getNotificationPreferences(): Promise<any> {
    return apiRequest<any>("GET", "/settings/notifications");
  },

  async updateNotificationPreferences(payload: any): Promise<any> {
    return apiRequest<any>("PUT", "/settings/notifications", payload);
  },

  // Workspace Personalization
  async getWorkspaceSettings(): Promise<any> {
    return apiRequest<any>("GET", "/settings/workspace");
  },

  async updateWorkspaceSettings(payload: any): Promise<any> {
    return apiRequest<any>("PUT", "/settings/workspace", payload);
  },


  // Roles & Permissions matrix
  async getRoles(): Promise<any[]> {
    return apiRequest<any[]>("GET", "/roles");
  },

  async createCustomRole(name: string, description: string): Promise<any> {
    return apiRequest<any>("POST", "/roles", { name, description });
  },

  async getRolePermissions(roleId: string): Promise<any[]> {
    return apiRequest<any[]>("GET", `/roles/${roleId}/permissions`);
  },

  async saveRolePermissions(roleId: string, permissions: Array<{ code: string; allowed: boolean }>): Promise<any> {
    return apiRequest<any>("PUT", `/roles/${roleId}/permissions`, { permissions });
  },

  async updateUserLocations(userId: string, locationIds: string[]): Promise<any> {
    return apiRequest<any>("PUT", `/users/${userId}/locations`, { locationIds });
  },

  async updateUserPermissions(userId: string, overrides: Array<{ permissionId: string; allowed: boolean }>): Promise<any> {
    return apiRequest<any>("PUT", `/users/${userId}/permissions`, { overrides });
  },

  async cloneRole(roleId: string, name?: string, description?: string): Promise<any> {
    return apiRequest<any>("POST", `/roles/${roleId}/clone`, { name, description });
  },

  // Organization settings
  async updateTenantSummary(payload: { name: string; legalName: string; timezone: string; primaryCurrency: string }): Promise<any> {
    return apiRequest<any>("PUT", "/tenants/current", payload);
  },

  // NEW: User Profile Management (Task 11)
  async getUserProfile(userId: string): Promise<any> {
    return apiRequest<any>("GET", `/users/${userId}/profile`);
  },

  async updateUserProfile(userId: string, profileData: any): Promise<any> {
    return apiRequest<any>("PATCH", `/users/${userId}/profile`, profileData);
  },

  // NEW: Permission Matrix Management (Task 10)
  async getPermissionMatrix(): Promise<any> {
    return apiRequest<any>("GET", "/settings/permissions");
  },

  async togglePermission(roleId: string, permissionId: string, allowed: boolean): Promise<any> {
    return apiRequest<any>("PATCH", `/settings/permissions/${roleId}/${permissionId}`, { roleId, permissionId, allowed });
  }
};
