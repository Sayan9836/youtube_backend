import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/get-subscribers").get(getUserChannelSubscribers);
router.route("/toogle-subscription/:channelId").post(toggleSubscription);
router.route("/get-subscriptions").get(getSubscribedChannels);

export default router;
