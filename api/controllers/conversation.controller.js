import Conversation from "../models/conversation.models.js";
import User from "../models/user.models.js";
import { throwError } from "../utils/error.js";

// Get Conversation controller
export const getConversation = async (req, res, next) => {
  // if (req.user.id !== req.params.id)
  //   return next(throwError(401, "user is not valid"));

  try {
    const userConversation = await Conversation.find({
      $or: [{ creatorId: req.params.id }, { participantId: req.params.id }],
    });
    res.status(200).json(userConversation);
  } catch (error) {
    next(error);
  }
};
export const createConversation = async (req, res, next) => {
  // Ensure creator and participant are not the same
  if (req.body.creatorId === req.body.participantId) {
    return next(throwError(402, "Creator and participant cannot be the same user."));
  }

  try {
    // Check if a conversation already exists
    const conversations = await Conversation.find({
      $or: [
        {
          $and: [
            { creatorId: req.body.creatorId },
            { participantId: req.body.participantId },
          ],
        },
        {
          $and: [
            { creatorId: req.body.participantId },
            { participantId: req.body.creatorId },
          ],
        },
      ],
    });

    if (conversations.length === 0) {
      // Fetch user details for chatCreator and chatPartner
      const chatCreator = await User.findById(req.body.creatorId);
      const chatPartner = await User.findById(req.body.participantId);

      if (!chatCreator || !chatPartner) {
        return next(throwError(404, "One or both users not found."));
      }

      // Create a new conversation
      const newConversation = new Conversation({
        creatorId: req.body.creatorId,
        participantId: req.body.participantId,
        chatCreator: chatCreator, // Add full user object if needed, or specific fields
        chatPartner: chatPartner, // Add full user object if needed, or specific fields
      });

      await newConversation.save();
      res.status(201).json({ message: "Conversation created successfully." });
    } else {
      res.status(403).json({ message: "Conversation already exists." });
    }
  } catch (error) {
    next(error);
  }
};

// ====== Delete Conversations ==========//

export const deleteConversation = async (req, res, next) => {
  const chatId = req.params.chatId;
  try {
    await Conversation.findByIdAndDelete(chatId);
    res.status(204).json("conversation deleted successfully");
  } catch (error) {
    next(error);
  }
};
