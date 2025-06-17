export const fetchUsuarioById = async id => {
    try {
        const { data } = await $axios.get(`/users/${id}`);
        console.log(data.data);

        return { success: data.success, data: data.data };
    } catch (e) {
        return { success: false, message: e.response?.data?.message || e.message };
    }
};

export const submitUsuaio = async payload => {
    try {
        const { data } = await $axios.post('/users', payload);
        return { success: data.success, data: data.data };
    } catch ({ response }) {
        return { success: false, message: response.data.message, data: response.data.errors };
    }
};

export const updateUsuario = async (id, payload) => {
    try {
        const { data } = await $axios.put(`/users/${id}`, payload);
        return { success: data.success, data: data.data };
    } catch ({ response }) {
        return { success: false, message: response.data.message, data: response.data.errors };
    }
};

export const deleteUsuario = async id => {
    try {
        const { data } = await $axios.delete(`/users/${id}`);
        return { success: data.success, message: data.message };
    } catch ({ response }) {
        return { success: false, message: response.data.message };
    }
};

export const fetchCompanyByUserId = async (userId) => {
    try {
        const response = await $axios.get(`/empresas/by-user/${userId}`);
        // Assuming your Laravel API returns data in response.data.data on success
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching company for user ID ${userId}:`, error);
        // Extract a more specific error message if available from the backend
        const errorMessage = error.response?.data?.message || `Error al obtener la empresa para el usuario con ID ${userId}.`;
        throw new Error(errorMessage);
    }
};

export const updateCompany = async (companyId, companyData) => {
    try {
        const response = await $axios.put(`/empresas/${companyId}`, companyData);
        // Assuming your Laravel backend's update method returns { success: true, message: '...', data: { ...updatedCompanyData } }
        return response.data.data;
    } catch (error) {
        console.error(`Error updating company ${companyId}:`, error);
        // Extract a more specific error message if available from the backend
        const errorMessage = error.response?.data?.message || `Error al actualizar la empresa con ID ${companyId}.`;
        throw new Error(errorMessage);
    }
};