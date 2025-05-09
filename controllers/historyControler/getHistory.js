const mongoose = require("mongoose");
const response = require("../../helpers/response");
const historyModal = require("../../models/historyModal");

// exports.getHistoryByUserId = async (req, res) => {
//   try {
//     const userId = new mongoose.Types.ObjectId(req.user.userId); // ✅ Ensure ObjectId conversion

//     // Aggregate to group by date
//     const history = await historyModal.aggregate([
//       { $match: { userId } }, // Filter by userId
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
//           records: { $push: "$$ROOT" } // Store all records in an array
//         }
//       },
//       { $sort: { _id: -1 } } // Sort by latest date
//     ]);

//     if (!history || history.length === 0) {
//       return res.send(response.error(404, "No history found"));
//     }

//     res.send(response.success(200, "History fetched successfully", history));
//   } catch (error) {
//     console.error("Error fetching history:", error);
//     res.send(response.error(500, "Internal Server Error", error.message));
//   }
// };

exports.getHistoryByUserId = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId);
  
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
  
      const cursor = historyModal.find({ userId }).sort({ createdAt: -1 }).cursor();
  
      res.write("["); // Start JSON Array
      let first = true;
      let groupedHistory = {};
  
      for await (const doc of cursor) {
        const date = doc.createdAt.toISOString().split("T")[0]; // Extract YYYY-MM-DD
  
        if (!groupedHistory[date]) {
          groupedHistory[date] = [];
        }
  
        groupedHistory[date].push(doc);
  
        // Stream chunked response
        if (!first) res.write(",");
        res.write(JSON.stringify({ _id: date, records: groupedHistory[date] }));
        first = false;
      }
  
      res.write("]"); // End JSON Array
      res.end();
    } catch (error) {
      console.error("Stream Error:", error);
      if (!res.writableEnded) {
        res.write("]");
        res.end();
      }
    }
  };
  