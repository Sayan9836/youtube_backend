import mongoose from "mongoose";
import { Comment } from "../models/Comment.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BSON } from "mongodb";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }
  if (!BSON.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "videoId is not a valid mongodb ObjectId");
  }

  try {
    const filter = await Comment.aggregate([
      {
        $match: {
          video: videoId,
        },
      },
    ]);

    const options = {
      page,
      skip: (page - 1) * limit,
      limit,
    };

    const comments = await Comment.aggregatePaginate(filter, options);

    return res
      .status(200)
      .json(
        new ApiResponse(200, comments.docs, "comments fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "error while fetching comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }
  if (!BSON.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "videoId is not a valid mongodb ObjectId");
  }

  if (!content) {
    throw new ApiError(400, "content cannot be empty");
  }

  try {
    const comment = await Comment.create({
      content: content,
      video: videoId,
      owner: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment added successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "error while adding comment");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId) {
    throw new ApiError(400, "commentId is missing");
  }

  if (!BSON.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "commentId is not a valid mongodb ObjectId");
  }

  if (!content) {
    throw new ApiError(400, "content cannot be empty");
  }

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content: content,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedComment) {
      throw new ApiError(400, "comment not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedComment, "comment updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, error?.message || "error while updating comment");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "commentId is missing");
  }

  if (!BSON.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "commentId is not a valid mongodb ObjectId");
  }

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      throw new ApiError(400, "comment not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "comment deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "error while deleting comment");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
