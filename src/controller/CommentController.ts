import { Request, Response } from "express";
import { CommentBusiness } from "../business/CommentBusiness";
import { CreateCommentInputDTO, DeleteCommentInputDTO, GetCommentsInputDTO, LikeOrDislikeCommentInputDTO } from "../DTOs/CommentsDTO";

export class CommentController {
    constructor(private commentBusiness: CommentBusiness) { }
    public getAllComments = async (req: Request, res: Response) => {
        try {
            const input: GetCommentsInputDTO = {
                id: req.params.id,
                token: req.headers.authorization
            };
            console.log(input)
            const output = await this.commentBusiness.getAllComments(input);

            res.status(200).send(output);
        } catch (error) {
            console.log(error);

            if (error instanceof Error) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send("Unexpected Error");
            }
        }
    };

    public createComment = async (req: Request, res: Response) => {
        try {
            const input: CreateCommentInputDTO = {
                token: req.headers.authorization,
                postId: req.params.id,
                content: req.body.content
            }
            console.log(input)
            const output = await this.commentBusiness.createComment(input)
            res.status(201).send(output)
        } catch (error) {
            console.log(error);

            if (error instanceof Error) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send("Unexpected Error");
            }
        }
    };

    public deleteComment = async (req: Request, res: Response) => {
        try {
            const input: DeleteCommentInputDTO = {
                idToDelete: req.params.id,
                token: req.headers.authorization
            }

            await this.commentBusiness.deleteComment(input)
            res.status(200).send("Comment deleted successfully !")
        } catch (error) {
            console.log(error);

            if (error instanceof Error) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send("Unexpected Error");
            }
        }
    };

    public likeOrDislikeComment = async (req: Request, res: Response) => {
        try {
            const input: LikeOrDislikeCommentInputDTO = {
                idToLikeOrDislike: req.params.id,
                token: req.headers.authorization,
                like: req.body.like
            }
            await this.commentBusiness.likeOrDislikeComment(input)
            res.status(200).end()
        } catch (error) {
            console.log(error);

            if (error instanceof Error) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send("Unexpected Error");
            }
        }
    };
}