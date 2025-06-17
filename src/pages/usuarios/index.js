export const fetchUsers = async (page, itemsPerPage, search) => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/users`, {
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

export const fetchUsersByEmpresa = async (params = {}) => {
    try {
        const response = await $axios.get('/users/by-empresa', { params })
        return response.data // Assuming response.data contains { message, data, meta }
    } catch (error) {
        console.error("Error fetching users by company:", error)
        throw new Error(error.response?.data?.message || 'Error al obtener usuarios de la misma empresa.')
    }
}

export const createUser = async (userData) => {
    try {
        const response = await $axios.post('/users', userData)
        return response.data.data // Assuming response.data.data is the created user object
    } catch (error) {
        console.error("Error creating user:", error)
        throw new Error(error.response?.data?.message || 'Error al crear el usuario.')
    }
}

export const updateUser = async (id, userData) => {
    try {
        const response = await $axios.put(`/users/${id}`, userData)
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

export const fetchUserById = async (id) => {
    try {
        const response = await $axios.get(`/users/${id}`)
        return response.data.data // Assuming response.data.data is the user object
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error)
        throw new Error(error.response?.data?.message || `Error al obtener el usuario con ID ${id}.`)
    }
}

export const deleteUser = async (id) => {
    try {
        const response = await $axios.delete(`/users/${id}`)
        return response.data.message // Assuming response.data.message is the success message
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error)
        throw new Error(error.response?.data?.message || `Error al eliminar el usuario con ID ${id}.`)
    }
}

