export const fetchChoferById = async id => {
    try {
        const { data } = await $axios.get(`/choferes/${id}`);
        console.log(data.data);

        return { success: data.success, data: data.data };
    } catch (e) {
        return { success: false, message: e.response?.data?.message || e.message };
    }
};

export const fetchChoferDetails = async id => {
    try {
        const { data } = await $axios.get(`/choferes/get-details/${id}`);
        return { success: data.success, data: data.data };
    } catch (e) {
        return { success: false, message: e.response?.data?.message || e.message };
    }
};

export const submitChofer= async payload => {
    try {
        const { data } = await $axios.post('/choferes', payload);
        return { success: data.success, data: data.data };
    } catch ({ response }) {
        return { success: false, message: response.data.message, data: response.data.errors };
    }
};

export const updateChofer = async (id, payload) => {
    try {
        const { data } = await $axios.put(`/choferes/${id}`, payload);
        return { success: data.success, data: data.data };
    } catch ({ response }) {
        return { success: false, message: response.data.message, data: response.data.errors };
    }
};

export const deleteChofer = async id => {
    try {
        const { data } = await $axios.delete(`/choferes/${id}`);
        return { success: data.success, message: data.message };
    } catch ({ response }) {
        return { success: false, message: response.data.message };
    }
};
