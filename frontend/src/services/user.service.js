import api from "@/lib/api";

export const userService = {
    /**
     * Submit driver registration data to convert RIDER to DRIVER.
     * @param {Object} data { license_number, vehicle_number }
     */
    becomeADriver: async (data) => {
        try {
            const response = await api.post("/users/become-a-driver", data, { showToast: true });
            return response.data;
        } catch (error) {
            console.error("Error in becomeADriver service:", error);
            throw error;
        }
    }
};
