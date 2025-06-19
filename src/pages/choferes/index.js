export const fetchChoferes = async (page, itemsPerPage, search) => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/choferes`, {
            params: {
                page,
                itemsPerPage,
                search
            }
        })

        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al actualizar el evento";

        success = false;
        return { success, message, data, meta }

    }

}
export const createChofer = async (userData) => {
    try {
        const response = await $axios.post('/choferes', userData)
        return response.data.data // Assuming response.data.data is the created user object
    } catch (error) {
        console.error("Error creating user:", error)
        throw new Error(error.response?.data?.message || 'Error al crear el usuario.')
    }
}

export const updateChofer = async (id, userData) => {
    try {
        const response = await $axios.put(`/choferes/${id}`, userData)
        // The backend's update method returns the updated user with
        // empresa_id, empresa_nombre, empresa_direccion at the top level,
        // and the nested 'empresa' object.
        const updatedUserData = response.data.data;
        return updatedUserData // Return the structured data from your API
    } catch (error) {
        console.error(`Error updating user ${id}:`, error)
        const errorMessage = error.response?.data?.message || `Error al actualizar el usuario con ID ${id}.`
        throw new Error(errorMessage)
    }
}

export const fetchChoferById = async (id) => {
    try {
        const response = await $axios.get(`/choferes/${id}`)
        return response.data.data // Assuming response.data.data is the user object
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error)
        throw new Error(error.response?.data?.message || `Error al obtener el usuario con ID ${id}.`)
    }
}


