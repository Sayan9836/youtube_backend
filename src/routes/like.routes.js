import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/LikedVideos").get(getLikedVideos);
router.route("/toogle-videoLike/:videoId").post(toggleVideoLike);
router.route("/toogle-commentLike/:commentId").post(toggleCommentLike);
router.route("/toogle-tweetLike/:tweetId").post(toggleTweetLike);

export default router;
