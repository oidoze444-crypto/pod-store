const API_URL = "https://pod-store-md9c.onrender.com/api";

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("API ERROR:", text);
    throw new Error("Erro na API");
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const productsApi = {
  list: () => request("products"),
  get: (id) => request(`products/${id}`),

  create: (data) =>
    request("products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`products/${id}`, {
      method: "DELETE",
    }),

  filter: () => request("products"),
};

export const flavorsApi = {
  list: () => request("flavors"),

  create: (data) =>
    request("flavors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`flavors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`flavors/${id}`, {
      method: "DELETE",
    }),
};

export const bannersApi = {
  list: () => request("banners"),

  create: (data) =>
    request("banners", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`banners/${id}`, {
      method: "DELETE",
    }),
};

export const ordersApi = {
  list: () => request("orders"),
  get: (id) => request(`orders/${id}`),

  create: (data) =>
    request("orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`orders/${id}`, {
      method: "DELETE",
    }),
};

export const settingsApi = {
  get: () => request("settings"),

  save: async (data) => {
    const res = await fetch(`${API_URL}/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("SETTINGS SAVE ERROR:", text);
      throw new Error("Erro ao salvar configurações");
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
};