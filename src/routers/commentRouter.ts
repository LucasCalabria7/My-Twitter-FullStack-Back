import express from "express";
import { CommentBusiness } from "../business/CommentBusiness";
import { CommentController } from "../controller/CommentController";
import { CommentDatabase } from "../database/CommentsDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export const commentRouter = express.Router();

const commentController = new CommentController(
    new CommentBusiness(
        new CommentDatabase(),
        new IdGenerator(),
        new TokenManager(),
    )
);

//get comments
commentRouter.get("/:id", commentController.getAllComments);

//create comment
commentRouter.post("/:id", commentController.createComment);

//delete comment
commentRouter.delete("/:id", commentController.deleteComment);

//edit comment
commentRouter.put("/:id/like", commentController.likeOrDislikeComment);