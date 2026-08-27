import axiosInstance from "@/lib/axios";

const ENDPOINT = "member/profile/admin/members";

export const memberApprovalService = {
    /**
     * List member profiles (optionally filtered by approval status).
     * @param {"pending"|"approved"|"rejected"} [status]
     */
    getMembers: async ({ status } = {}) => {
        const params = {};
        if (status) params.status = status;
        const response = await axiosInstance.get(ENDPOINT, { params });
        return response.data;
    },

    /**
     * Fetch a single member profile for the review screen.
     * @param {string} id
     */
    getMemberById: async (id) => {
        const response = await axiosInstance.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    /**
     * Fetch the franchise profile linked to a given User record.
     * Used by the Admin User Details page (Franchise Information section).
     * @param {string} userId
     */
    getMemberProfileByUser: async (userId) => {
        const response = await axiosInstance.get(`member/profile/admin/user/${userId}`);
        return response.data;
    },

    /**
     * Approve or reject a member's submitted profile.
     * @param {string} id
     * @param {"approved"|"rejected"} action
     * @param {string} [rejection_reason]
     */
    reviewMember: async (id, action, rejection_reason = "") => {
        const response = await axiosInstance.patch(`${ENDPOINT}/${id}/review`, {
            action,
            rejection_reason,
        });
        return response.data;
    },
};
