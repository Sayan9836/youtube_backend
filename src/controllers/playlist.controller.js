import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PlayList } from "../models/Playlist.js";
import { BSON } from "mongodb";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (!name || !description) {
    throw new ApiError(400, "name or description is missing");
  }

  try {
    const isPlayListExists = await PlayList.findOne({ name: name });

    if (isPlayListExists) {
      throw new ApiError(400, "playlist already exists");
    }

    const playlist = await PlayList.create({
      name: name,
      description: description,
      videos: [],
      owner: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist created successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "error while creating playlist");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(400, "userId is missing");
  }

  if (!BSON.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid mongodb objectId");
  }

  try {
    const playlists = await PlayList.find({ owner: userId });

    if (!playlists) {
      throw new ApiError(400, "playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlists, "playlists fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "error while fetching playlists");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "playlistId is missing");
  }

  if (!BSON.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid mongodb objectId");
  }

  try {
    const playlist = await PlayList.findById(playlistId);

    if (!playlist) {
      throw new ApiError(400, "playlist does not exists");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playList fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "error while fetching playList");
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "both playlistId and videoId is required");
  }

  if (!BSON.ObjectId.isValid(playlistId) || !BSON.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid mongodb objectId playListId or videoId");
  }

  try {
    const UpdatedPlaylist = await PlayList.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: { videos: videoId },
      },
      {
        new: true,
      }
    );

    if (!UpdatedPlaylist) {
      throw new ApiError(400, "playlist or video is missing");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          UpdatedPlaylist,
          "video added to the playList successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "error while adding video to the playList"
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.query;
  const { videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId || !videoId) {
    throw new ApiError(400, "both playlistId and videoId is required");
  }

  if (!BSON.ObjectId.isValid(playlistId) || !BSON.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid mongodb objectId playListId or videoId");
  }

  try {
    const UpdatedPlaylist = await PlayList.findByIdAndUpdate(
      playlistId,
      {
        $pull: { videos: videoId },
      },
      {
        new: true,
      }
    )
      .where("owner")
      .equals(`${req.user?._id}`);

    if (!UpdatedPlaylist) {
      throw new ApiError(400, "playlist or video is missing");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          UpdatedPlaylist,
          "video removed from playList successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "error while removing video from playList"
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "playListId is missing");
  }

  if (!BSON.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid mongodb objectId");
  }

  try {
    const deletedPlayList = await PlayList.findOneAndDelete({
      _id: playlistId,
      owner: req.user?._id,
    });

    if (!deletedPlayList) {
      throw new ApiError(400, "playList not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedPlayList, "playList deleted successfully")
      );
  } catch (error) {
    throw new ApiError(500, error?.message || "error while deleting playList");
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!playlistId) {
    throw new ApiError(400, "playListId is missing");
  }
  if (!name && !description) {
    throw new ApiError(400, "atleast one field is required");
  }

  if (!BSON.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid mongodb objectId");
  }

  try {
    const playlist = await PlayList.findOne({
      _id: playlistId,
      owner: req.user?._id,
    });

    if (name) {
      playlist.name = name;
    }
    if (description) {
      playlist.description = description;
    }

    await playlist.save();

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playList updated successfully"));
  } catch (error) {
    throw new ApiError(500, "error while updating playList");
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
