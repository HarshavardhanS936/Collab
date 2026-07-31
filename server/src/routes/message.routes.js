import express from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true }); // mergeParams so we can access projectId from project.routes.js

router.use(protect);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

export default router;
