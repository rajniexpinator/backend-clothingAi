const { default: axios } = require("axios");

const KOLORS_API_URL =
  "https://gateway.appypie.com/kling-ai-vton/v1/getVirtualTryOnTask";

const API_KEY = process.env.KOLORS_API_KEY;

const KolorsTryOn = async (data)=>{


    try {
        const response = await axios.post(
            KOLORS_API_URL,
            {
           ...data,
              callback_url: "",
            },
            { 
              headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": API_KEY,
                
              },
            }
          );
     
          
        return {susuccess:true,data:response.data}
    } catch (error) {
        return { success: false, message: error.response?.data || error.message };
    }
}
module.exports= KolorsTryOn