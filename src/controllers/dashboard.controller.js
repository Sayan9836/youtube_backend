import mongoose from "mongoose";
import { Video } from "../models/Video.js";
import { Subscription } from "../models/Subscription.js";
import { Like } from "../models/Like.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  try {
    const subscribersCount = await Subscription.find({
      channel: req.user?._id,
    }).countDocuments();

    const totalVideos = await Video.find({
      owner: req.user?._id,
    }).countDocuments();

    const likesCount = await Like.find({
      likedBy: { $ne: req.user?._id },
    })
      .where("video")
      .ne(null)
      .countDocuments();

    const resultObj = { subscribersCount, totalVideos, likesCount };

    return res
      .status(200)
      .json(
        new ApiResponse(200, resultObj, "channelStats fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      200,
      error?.message || "error while fetching channelStats"
    );
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  try {
    const videos = await Video.find({
      owner: req.user?._id,
    });

    if (!videos) {
      throw new ApiError(400, "user not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "error while fetching videos");
  }
});

export { getChannelStats, getChannelVideos };
