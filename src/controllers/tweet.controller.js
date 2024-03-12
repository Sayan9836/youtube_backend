import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/Tweet.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BSON } from "mongodb";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  try {
    if (!content) {
      throw new ApiError(400, "content is missing");
    }

    const tweet = await Tweet.create({
      content: content,
      owner: req.user?._id,
    });

    if (!tweet) {
      throw new ApiError(400, "user not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "tweet created successfully"));
  } catch (error) {
    throw new ApiError(400, error?.message || "error while creating tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets

  try {
    const tweets = await Tweet.find({ owner: req.user?._id });

    if (!tweets) {
      throw new ApiError(400, "tweets not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "successfully fetched all tweets"));
  } catch (error) {
    throw new ApiError(400, error?.message || "error while fetching tweets");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  try {
    if (!tweetId) {
      throw new ApiError(400, "tweetId is missing");
    }

    if (!content) {
      throw new ApiError(400, "content is missing");
    }

    if (!BSON.ObjectId.isValid(tweetId)) {
      throw new ApiError("Not a valid mongoDB ObjectId");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
      {
        _id: tweetId,
        owner: req.user?._id,
      },
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );

    if (!updatedTweet) {
      throw new ApiError(400, "tweet not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet Updated successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "error while updating tweet");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweetId is missing");
  }

  try {
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
      throw new ApiError(400, "tweet not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "error while deleting tweet ");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
