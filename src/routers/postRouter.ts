import express from "express";
import { PostBusiness } from "../business/PostBusiness";
import { PostController } from "../controller/PostController";
import { PostDatabase } from "../database/PostDatabase";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export const postRouter = express.Router();

const postController = new PostController(
    new PostBusiness(
        new PostDatabase(),
        new IdGenerator(),
        new TokenManager(),
        new HashManager()
    )
);
//Get posts
postRouter.get("/", postController.getAllPosts);

//create post
postRouter.post("/", postController.createPost);

//Edit post
postRouter.put("/:id", postController.editPost);

//delete post
postRouter.delete("/:id", postController.deletePost);

//edit like/dislike
postRouter.put("/:id/like", postController.likeOrDislikePost);