import axiosCreate from "@/src/services/axiosCreate";

export const apiUserService = {
  async getAllUsers(filters: any) {
    try {
      const { operator, role, page = 1, limit = 10, search } = filters;

      // Construir la URL con parámetros dinámicos
      const params = new URLSearchParams();

      if (operator) params.append("operator", operator);
      if (role) params.append("role", role);
      if (search) params.append("search", search);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      // Realizar la solicitud GET con los filtros
        const response = await axiosCreate.get(`/api/users/findAll?${params.toString()}`);
      // const response = await axiosCreate.get(`/api/users/findAll`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getUserById(userId: any) {
    try {
      const response = await axiosCreate.get(`/api/users/findOne/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  },
};
