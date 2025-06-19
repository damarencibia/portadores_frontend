export const fetchCombustibleById = async id => {
    try {
        const { data } = await $axios.get(`/tipo-combustibles/${id}`);
        console.log(data.data);

        return { success: data.success, data: data.data };
    } catch (e) {
        return { success: false, message: e.response?.data?.message || e.message };
    }
};

export const submitCombustible= async payload => {
    try {
        const { data } = await $axios.post('/tipo-combustibles', payload);
        return { success: data.success, data: data.data };
    } catch ({ response }) {
        return { success: false, message: response.data.message, data: response.data.errors };
    }
};

export const updateCombustible = async (id, payload) => {
    try {
        const { data } = await $axios.put(`/tipo-combustibles/${id}`, payload);
        return { success: data.success, data: data.data };
    } catch ({ response }) {
        return { success: false, message: response.data.message, data: response.data.errors };
    }
};

export const deleteCombustible = async id => {
    try {
        const { data } = await $axios.delete(`/tipo-combustibles/${id}`);
        return { success: data.success, message: data.message };
    } catch ({ response }) {
        return { success: false, message: response.data.message };
    }
};
