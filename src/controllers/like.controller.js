import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BSON } from "mongodb";
import { Like } from "../models/Like.js";
import { Video } from "../models/Video.js";
import { Comment } from "../models/Comment.js";
import { Tweet } from "../models/Tweet.js";
import { User } from "../models/User.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log(videoId);
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }

  try {
    const video = await Video.findById(videoId);

    console.log(video.owner, req.user._id);

    if (video.owner.equals(req.user?._id)) {
      throw new ApiError(400, "you cannot like your own videos");
    }

    if (!video) {
      throw new ApiError(400, "video not found");
    }

    const isLikeExists = await Like.findOne({
      video: videoId,
      likedBy: req.user?._id,
    });

    if (!isLikeExists) {
      const like = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, like, "video liked successfully"));
    } else {
      const like = await Like.deleteOne({
        video: videoId,
        likedBy: req.user?._id,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(200, like, "removed like from video successfully")
        );
    }
  } catch (error) {
    throw new ApiError(500, error?.message || "error while toggling videoLike");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!commentId) {
    throw new ApiError(400, "commentId is missing");
  }

  if (!BSON.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "not a valid mongoDB OjectId");
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(400, "comment not found");
    }

    const isLikeExists = await Like.findOne({
      comment: commentId,
      likedBy: req.user?._id,
    });

    if (!isLikeExists) {
      const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, like, "comment liked successfully"));
    } else {
      const like = await Like.deleteOne({
        comment: commentId,
        likedBy: req.user?._id,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(200, like, "removed like from comment successfully")
        );
    }
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "error while toggling commentLike"
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweetId is missing");
  }

  if (!BSON.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "not a valid mongoDB OjectId");
  }

  try {
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(400, "tweet not found");
    }

    const isLikeExists = await Like.findOne({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    if (!isLikeExists) {
      const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, like, "tweet liked successfully"));
    } else {
      const like = await Like.deleteOne({
        tweet: tweetId,
        likedBy: req.user?._id,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(200, like, "removed like from tweet successfully")
        );
    }
  } catch (error) {
    throw new ApiError(500, error?.message || "error while toggling tweetLike");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const {
    page = 1,
    limit = 10,
    // query,
    sortBy = "createdAt",
    sortType = "asc",
  } = req.query;

  const options = {
    page,
    skip: (page - 1) * limit,
    limit,
    sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
  };

  // const regex = new RegExp(`.*${query ? query : ""}.*`, "i");

  const likedVideos = await Like.find({
    likedBy: req.user?._id,
    video: {
      $ne: null,
    },
  })
    .populate({
      path: "video",
      populate: {
        path: "owner",
        select: "_id username avatar",
      },
      select: "_id title duration views createdAt",
    })
    .select("-likedBy -createdAt -updatedAt -__v")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
