import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/Video.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { BSON } from "mongodb";
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    // userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // if (!userId) {
  //   throw new ApiError(404, "userId or query is not present");
  // }

  // if (!BSON.ObjectId.isValid(userId)) {
  //   throw new ApiError(404, "Invalid userId");
  // }

  const options = {
    page,
    skip: (page - 1) * limit,
    limit,
    sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
  };

  const regex = new RegExp(`.*${query ? query : ""}.*`, "i");

  const pipeline = [
    {
      $match: {
        // owner: new BSON.ObjectId(userId),
        $or: [{ title: regex }, { description: regex }],
      },
    },
  ];

  const filter = Video.aggregate(pipeline);

  const videos = await Video.aggregatePaginate(filter, options);

  if (!videos || videos.docs.length === 0) {
    throw new ApiError(404, "No videos exists");
  }

  res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title || !description) {
    throw new ApiError(404, "title or description is missing");
  }

  console.log(req.files);

  let videoFileLocalPath;
  let thumbnailLocalPath;

  try {
    if (
      req.files &&
      Array.isArray(req.files.videoFile) &&
      req.files.videoFile.length > 0
    ) {
      videoFileLocalPath = req.files.videoFile[0].path;
    }

    if (
      req.files &&
      Array.isArray(req.files.thumbnail) &&
      req.files.thumbnail.length > 0
    ) {
      thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    if (!videoFileLocalPath) {
      throw new ApiError(404, "videoFile is missing");
    }

    if (!thumbnailLocalPath) {
      throw new ApiError(404, "thumbnail is missing");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);

    if (!videoFile?.url || !videoFile?.duration) {
      throw new ApiError(404, "error while uploading videoFile");
    }
    const thumbnail = await uploadOnCloudinary(videoFileLocalPath);

    if (!thumbnail?.url) {
      throw new ApiError(404, "error while uploading thumbnail");
    }

    const video = await Video.create({
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      title: title,
      description: description,
      duration: videoFile.duration.toFixed(2),
      owner: req.user?._id,
    });

    if (!video) {
      throw new ApiError(404, "error while creating video");
    }

    res
      .status(200)
      .json(new ApiResponse(200, video, "video published successfully"));
  } catch (error) {
    throw new ApiError(404, error?.message || "error while publishing video");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  if (!BSON.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  if (!BSON.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Invalid videoId");
  }

  if (!title && !description && !thumbnail) {
    throw new ApiError(400, "Atleast One field is required");
  }

  const video = await Video.findById(videoId, {
    owner: req.user?._id,
  });

  if (thumbnail) {
    video.thumbnail = thumbnail;
  }

  if (title) {
    video.title = title;
  }

  if (description) {
    video.description = description;
  }

  await video.save();

  const updateVideo = await User.findById(videoId, {}, { new: true });

  res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  if (!BSON.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Invalid videoId");
  }

  const video = await Video.findByIdAndDelete(videoId, {
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  if (!BSON.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "video not found!");
  }

  video.isPublished = !video.isPublished;

  await video.save();

  res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
