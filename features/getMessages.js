import api from "../utils/axios"

export const getMessages=async(id)=>{
   try {
   const {data}= await api.get(`/chat/get-messge/${id}`)
   console.log("message:" , data)
   return data
   } catch (error) {
    console.log(error)
    return null
   } 
}