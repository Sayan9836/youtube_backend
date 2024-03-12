import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/User.js";
import { Subscription } from "../models/Subscription.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BSON } from "mongodb";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!channelId) {
    throw new ApiError(400, "channelId is missing");
  }

  try {
    const isSubscribed = await Subscription.findOne({
      channel: channelId,
      subscriber: req.user?._id,
    });

    console.log(isSubscribed);

    if (isSubscribed) {
      await Subscription.findOneAndDelete({
        channel: channelId,
        subscriber: req.user?._id,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "Unsubscribed to channel successfully")
        );
    } else {
      await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id,
      });
      return res
        .status(200)
        .json(new ApiResponse(200, null, "subscribed to channel successfully"));
    }
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "error while toggleing subscription"
    );
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  try {
    const subscribers = await User.aggregate([
      {
        $match: {
          _id: new BSON.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscribers.subscriber",
          foreignField: "_id",
          as: "mySubscribers",
        },
      },

      {
        $project: {
          _id: 0,
          statusCode: 1,
          "subscriberDetails._id": 1,
          "subscriberDetails.email": 1,
          "subscriberDetails.username": 1,
          "subscriberDetails.fullname": 1,
          "subscriberDetails.avatar": 1,
          message: 1,
          success: 1,
        },
      },
    ]);

    if (!subscribers) {
      throw new ApiError(400, "channel not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribers != {} && subscribers,
          "fetched subscribers details successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "error while fetching subscribers details "
    );
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
    const channelsSubscribed = await User.aggregate([
      {
        $match: {
          _id: new BSON.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subcribedTo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subcribedTo.channel",
          foreignField: "_id",
          as: "mySubscriptions",
        },
      },
      {
        $project: {
          _id: 0,
          statusCode: 1,
          "mySubscriptions._id": 1,
          "mySubscriptions.email": 1,
          "mySubscriptions.username": 1,
          "mySubscriptions.fullname": 1,
          "mySubscriptions.avatar": 1,
          message: 1,
          success: 1,
        },
      },
    ]);

    if (!channelsSubscribed) {
      throw new ApiError(400, "channel not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channelsSubscribed != {} && channelsSubscribed,
          "fetched subscriptions details successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "error while fetching subscription details"
    );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
