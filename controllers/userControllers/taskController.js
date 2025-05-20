const Task = require("../../models/taskModel");
const response = require("../../helpers/response");
const imageTryOnService = require("../../servcices/imageTryOn.service");
const moment = require("moment");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const {
  uploadBase64ToS3Bucket,
  uploadToS3Bucket,
} = require("../../config/S3ImageUpload");
require("dotenv").config();

const addTask = async (req, res) => {
  try {
    const {
      // cloth_image: cloth,
      // human_image: human,
      date,
      title,
      note,
    } = req.body;
    const userId = req.user.userId;
    console.log(req.files);
    // const { human_image: human, cloth_image: cloth } = req.files;
    const [human, cloth] = req.files;

    if (!date || !title) {
      return res.send(response.error(400, "Date and title are required"));
    }

    console.log(human, cloth);

    const human_image = await uploadToS3Bucket(human);
    const cloth_image = await uploadToS3Bucket(cloth);
    // const human_image = await uploadBase64ToS3Bucket(human);
    // const cloth_image = await uploadBase64ToS3Bucket(cloth);

    const aiResponce = await imageTryOnService({
      human_image: human_image.url,
      cloth_image: cloth_image.url,
    });

    let tryOnImageUrl = aiResponce?.data?.task_result?.images[0]?.url;

    const task = new Task({
      userId,
      date,
      title,
      note,
      tryOnImageUrl,
    });
    await task.save();

    res.send(response.success(201, "Task added successfully"));
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .send(response.error(500, "Internal Server Error", error.message));
  }
};

const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await Task.find({ userId });

    if (!tasks.length) {
      return res.send(response.error(404, "No tasks found"));
    }

    res.send(response.success(200, "Tasks fetched successfully", tasks));
  } catch (error) {
    res.send(response.error(500, "Internal Server Error", error.message));
  }
};

const taskByDate = async (req, res) => {
  try {
    const userId = req?.user?.userId;
    const date = req?.body?.date;

    if (!date) {
      return res.send(response.error(400, "Date is required"));
    }
    if (!userId) {
      return res.send(response.error(400, "User id is required"));
    }
    const tasks = await Task.find({
      userId,
      date,
    });

    if (!tasks.length) {
      return res.send(response.error(404, "No tasks found"));
    }
    res.send(response.success(200, `Tasks for this date ${date}`, tasks));
  } catch (error) {
    res.send(response.error(500, "Internal Server Error", error.message));
  }
};

module.exports = { addTask, getUserTasks, taskByDate };
