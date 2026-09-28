import api from "../utils/axios"

export const logout=async () => {
    try {
        const {data}=await api.get("/auth/logout")
        console.log(data)
    } catch (error) {
        console.log(error)
    }
}