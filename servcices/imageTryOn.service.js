const { default: axios } = require("axios");
const All_Ai_Modals = require("./Ai_Modals");

const AI_MODEL = All_Ai_Modals[process.env.AI_MODEL];

const imageTryOnService = async (data) => {
  try {
    const aiRawData = await AI_MODEL(data);
    const requestId = aiRawData?.data?.request_id;

    if (requestId) {
      return await getVirtualTryOnStatus(requestId);
    } else {
      throw new Error(JSON.stringify(aiRawData));
    }
  } catch (error) {
    throw error;
  }
};

// const getVirtualTryOnStatus = async (taskId, retries = 100, delay = 4000) => {
//   try {
//     console.log(`Checking status for Task ID: ${taskId}`);

//     const response = await axios.post(
//       "https://gateway.appypie.com/kling-ai-polling/v1/getVirtualTryOnStatus",
//       { task_id: taskId },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "Cache-Control": "no-cache",
//         },
//       }
//     );

//     // Ensure response structure is correct
//     if (
//       !response.data ||
//       !response.data.data ||
//       !response.data.data.task_result
//     ) {
//       throw new Error("Invalid response structure");
//     }

//     // Check if task_result is empty and retry if necessary
//     if (Object.keys(response.data.data.task_result).length === 0) {
//       if (retries > 0) {
//         console.log(`Retrying... Remaining attempts: ${retries}`);
//         await new Promise((res) => setTimeout(res, delay));
//         return getVirtualTryOnStatus(taskId, retries - 1, delay);
//       } else {
//         throw new Error("Max retries reached. Task result is still empty.");
//       }
//     }

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error in getVirtualTryOnStatus:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

const getVirtualTryOnStatus = async (taskId, retries = 100, delay = 5000) => {
  while (retries > 0) {
    try {
      console.log(
        `Checking status for Task ID: ${taskId}. Retries left: ${retries}`
      );

      const response = await axios.post(
        "https://gateway.appypie.com/kling-ai-polling/v1/getVirtualTryOnStatus",
        { task_id: taskId },
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );

      const data = response.data;

      // Check for success condition
      if (
        data &&
        data.code === 0 &&
        data.message === "SUCCEED" &&
        data.data &&
        data.data.task_status === "succeed" &&
        data.data.task_result &&
        Object.keys(data.data.task_result).length > 0
      ) {
        console.log("Task succeeded!");
        return data;
      }

      // Not succeeded yet
      console.log("Task not complete. Retrying...");
    } catch (error) {
      console.error(
        "Error occurred, will retry...",
        error.response?.data || error.message
      );
    }

    // Wait before next attempt
    await new Promise((res) => setTimeout(res, delay));
    retries--;
  }

  throw new Error("Max retries reached. Task did not succeed.");
};

module.exports = imageTryOnService;
