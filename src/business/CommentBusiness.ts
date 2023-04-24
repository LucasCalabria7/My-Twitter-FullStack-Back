import { CommentDatabase } from "../database/CommentsDatabase";
import { CreateCommentInputDTO, DeleteCommentInputDTO, GetCommentsInputDTO, GetCommentsOutputDTO, LikeOrDislikeCommentInputDTO } from "../DTOs/CommentsDTO";
import {CommentWithCreatorsDB, COMMENT_LIKE, LikesDislikesCommentsDB, ROLES, CommentDB,} from "../interfaces/interfaces";
import { Comment } from "../models/Comments";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class CommentBusiness {
    constructor(
        private commentDataBase: CommentDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
    ) { }
    public getAllComments = async (input: GetCommentsInputDTO) => {
        const { token, id } = input;
        console.log(id)

        if (token === undefined) {
            throw new Error("Token not found");
        }

        const payload = this.tokenManager.getPayload(token);

        if (payload === null) {
            throw new Error("Invalid Token");
        }

        const commentsWithCreatorsDB: CommentWithCreatorsDB[] = await this.commentDataBase.getCommentsWithCreators(id);

        const comments = commentsWithCreatorsDB.map((commentWithCreatorsDB) => {
            const comment = new Comment(
                commentWithCreatorsDB.id,
                commentWithCreatorsDB.content,
                commentWithCreatorsDB.likes,
                commentWithCreatorsDB.dislikes,
                commentWithCreatorsDB.created_at,
                commentWithCreatorsDB.post_id,
                commentWithCreatorsDB.creator_id,
                commentWithCreatorsDB.creator_name
            );
            return comment.toBusinessModel();
        });
        const output: GetCommentsOutputDTO = comments;

        return output;
    };
    public createComment = async (input: CreateCommentInputDTO) => {
        const { token, content, postId } = input;
        console.log(postId)

        if (token === undefined) {
            throw new Error("Token not found");
        }

        const payload = this.tokenManager.getPayload(token);

        if (payload === null) {
            throw new Error("Invalid Token");
        }

        if (typeof content !== "string") {
            throw new Error("Content must be a string");
        }

        const id = this.idGenerator.generate();
        const createdAt = new Date().toISOString();
        const creatorId = payload.id;
        const creatorName = payload.name;

        const comment = new Comment(
            id,
            content,
            0,
            0,
            createdAt,
            postId,
            creatorId,
            creatorName
        );

        const commentDB = comment.toDBModel();

        await this.commentDataBase.create(commentDB);

        return commentDB;
    };

    public deleteComment = async (input: DeleteCommentInputDTO) => {
        const { idToDelete, token } = input;

        if (token === undefined) {
            throw new Error("Token not found");
        }

        const payload = this.tokenManager.getPayload(token);

        if (payload === null) {
            throw new Error("Invalid Token");
        }

        const commentDB = await this.commentDataBase.findById(idToDelete);

        if (!commentDB) {
            throw new Error("ID not found");
        }

        const creatorId = payload.id;

        if (payload.role !== ROLES.ADM && commentDB.creator_id !== creatorId) {
            throw new Error("You're not thw owner of this post");
        }

        await this.commentDataBase.delete(idToDelete);
    };
    public likeOrDislikeComment = async (input: LikeOrDislikeCommentInputDTO) => {
        const { idToLikeOrDislike, token, like } = input;

        if (token === undefined) {
            throw new Error("Token not found");
        }

        const payload = this.tokenManager.getPayload(token);

        if (payload === null) {
            throw new Error("Invalid Token");
        }

        if (typeof like !== "boolean") {
            throw new Error("Like must be a boolean");
        }

        const commentsWithCreatorDB = await this.commentDataBase.findCommentsWithCreatorById(idToLikeOrDislike);

        if (!commentsWithCreatorDB) {
            throw new Error("ID not found");
        }

        const userId = payload.id;
        const likeSQLite = like ? 1 : 0;
        const likeDislikeDB: LikesDislikesCommentsDB = {
            user_id: userId,
            comment_id: commentsWithCreatorDB.id,
            like: likeSQLite,
        };

        const comment = new Comment(
            commentsWithCreatorDB.id,
            commentsWithCreatorDB.content,
            commentsWithCreatorDB.likes,
            commentsWithCreatorDB.dislikes,
            commentsWithCreatorDB.created_at,
            commentsWithCreatorDB.post_id,
            commentsWithCreatorDB.creator_id,
            commentsWithCreatorDB.creator_name
        );

        const commentLikeOrDislike = await this.commentDataBase.findLikeDislike(
            likeDislikeDB
        );

        if (commentLikeOrDislike === COMMENT_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.commentDataBase.removeLikeDislike(likeDislikeDB);
                comment.removeLike();
            } else {
                await this.commentDataBase.updateLikeDislike(likeDislikeDB);
                comment.removeLike();
                comment.addDislike();
            }
        } else if (commentLikeOrDislike === COMMENT_LIKE.ALREADY_DESLIKED) {
            if (like) {
                await this.commentDataBase.updateLikeDislike(likeDislikeDB);
                comment.removeDislike();
                comment.addLike();
            } else {
                await this.commentDataBase.removeLikeDislike(likeDislikeDB);
                comment.removeDislike();
            }
        } else {
            await this.commentDataBase.likeOrDislikeComment(likeDislikeDB);

            if (like) {
                comment.addLike();
            } else {
                comment.addDislike();
            }
        }
        const updatedPostDB = comment.toDBModel();
        await this.commentDataBase.update(idToLikeOrDislike, updatedPostDB);
    };
}