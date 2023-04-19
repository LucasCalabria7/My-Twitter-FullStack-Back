export enum ROLES {
    USER = "USER",
    ADM = "ADM"
}

export enum POST_LIKE {
    LIKED = "Already Liked",
    DISLIKED = "Already Disliked"
}

export enum COMMENT_LIKE {
    ALREADY_LIKED = "Já deu like",
    ALREADY_DESLIKED = "Já deu dislike",
}

export interface UserDB {
    id: string;
    name: string;
    email: string;
    password: string;
    role: ROLES;
    created_at: string;
}

export interface PostDB {
    id: string;
    creator_id: string;
    content: string;
    likes: number;
    dislikes: number;
    comments: number;
    created_at: string;
    updated_at: string;
}

export interface UserModel {
    id: string;
    name: string;
    email: string;
    password: string;
    role: ROLES;
    createdAt: string;
}

export interface PostModel {
    id: string;
    content: string;
    likes: number;
    dislikes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
    creator: {
        id: string;
        name: string;
    };
}

export interface CommentModel {
    id: string;
    content: string;
    likes: number;
    dislikes: number;
    createdAt: string;
    postId: string;
    creator: {
        id: string;
        name: string;
    };
}

export interface CommentDB {
    id: string;
    creator_id: string;
    content: string;
    likes: number;
    dislikes: number;
    created_at: string;
    post_id: string;
}

export interface LikesDislikesCommentsDB {
    user_id: string;
    comment_id: string;
    like: number;
}

export interface PostWithCreatorsDB extends PostDB {
    creator_name: string;
}

export interface CommentWithCreatorsDB extends CommentDB {
    creator_name: string;
}

export interface LikesDislikesDB {
    user_id: string,
    post_id: string,
    like: number
}

export interface TokenPayload {
    id: string;
    name: string;
    role: ROLES;
}