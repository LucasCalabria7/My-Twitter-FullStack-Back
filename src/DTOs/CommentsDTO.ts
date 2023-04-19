import { CommentModel } from "../interfaces/interfaces";

export interface GetCommentsInputDTO {
    token: string | undefined;
    id: string;
}

export type GetCommentsOutputDTO = CommentModel[];

export interface CreateCommentInputDTO {
    token: string | undefined;
    content: unknown;
    postId: string;
}

export interface EditCommentInputDTO {
    idToEdit: string;
    token: string | undefined;
    content: unknown;
}

export interface DeleteCommentInputDTO {
    idToDelete: string;
    token: string | undefined;
}

export interface LikeOrDislikeCommentInputDTO {
    idToLikeOrDislike: string;
    token: string | undefined;
    like: unknown;
}