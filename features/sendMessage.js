import api from "../utils/axios"

const sendMessage = async (payload) => {
  try {
    const {data}=await api.post("/agent/chat",payload)
    return data
  } catch (error) {
    console.log(error)
    return null
  }
}

export default sendMessage
