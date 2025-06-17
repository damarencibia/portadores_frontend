export const fetchWithdrawals = async (page, itemsPerPage, search, tarjeta_combustible_id, chofer_id, tipo_combustible_id, registrado_por_id, with_trashed) => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/retiros-combustible`, { // Changed endpoint here
            params: {
                page,
                itemsPerPage,
                search,
                tarjeta_combustible_id,
                chofer_id,
                tipo_combustible_id,
                registrado_por_id,
                with_trashed
            }
        })

        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al obtener los retiros de combustible"; // Adjusted error message

        success = false;
        return { success, message, data, meta }

    }
}

export const fetchChoferNames = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/choferes/get-names`,)

        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al obtener los nombres de los choferes"; // Adjusted error message

        success = false;
        return { success, message, data, meta }

    }
}

export const fetchTarjetas = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/tarjetas-combustible`,)

        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al obtener las tarjetas de combustible"; // Adjusted error message

        success = false;
        return { success, message, data, meta }

    }
}

export const fetchTipoCombustibles = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/tipo-combustibles`,)

        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al obtener los tipos de combustible"; // Adjusted error message

        success = false;
        return { success, message, data, meta }

    }
}

export const fetchUsersByEnterprise = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/users/users-by-enterprise`,)

        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al obtener los usuarios por empresa"; // Adjusted error message

        success = false;
        return { success, message, data, meta }

    }
}

export const fetchAccessedRetirosIds = async () => {
    let message = null;
    let success = null;
    let data = null; // This will contain { count: X, ids: [...] }
    let meta = null;

    try {
        const request = await $axios.get(`/retiros-combustible/accessed-ids`);

        success = request?.data?.success;
        data = request?.data?.data; // Expecting { count: X, ids: [...] }
        message = request?.data?.message;
        meta = request?.data?.meta; // Likely null for this endpoint, but included for consistency
        return { success, message, data, meta };

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al obtener las cargas accedidas.";
        success = false;
        return { success, message, data, meta };
    }
}