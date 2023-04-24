import { PostDatabase } from "../database/PostDatabase";
import {CreatePostInputDTO,DeletePostInputDTO,EditPostInputDTO,GetPostsInputDTO,GetPostsOutputDTO,LikeOrDislikePostInputDTO} from "../DTOs/DTOs";
import {LikesDislikesDB, PostWithCreatorsDB, POST_LIKE, ROLES} from "../interfaces/interfaces";
import { Post } from "../models/Post";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class PostBusiness {
    constructor(
        private postDataBase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) { }
    public getAllPosts = async ( input: GetPostsInputDTO) => {
        const { token } = input;

        if (token === undefined) {
            throw new Error("Tokes doesn't exist");
        }

        const payload = this.tokenManager.getPayload(token);

        if (payload === null) {
            throw new Error("Invalid Token");
        }

        const postsWithCreatorsDB: PostWithCreatorsDB[] = await this.postDataBase.getPostsWithCreators();

        const posts = postsWithCreatorsDB.map((postWithCreatorsDB) => {
            const post = new Post(
                postWithCreatorsDB.id,
                postWithCreatorsDB.content,
                postWithCreatorsDB.comments,
                postWithCreatorsDB.likes,
                postWithCreatorsDB.dislikes,
                postWithCreatorsDB.created_at,
                postWithCreatorsDB.updated_at,
                postWithCreatorsDB.creator_id,
                postWithCreatorsDB.creator_name
            );
            return post.toBusinessModel();
        });
        const output: GetPostsOutputDTO = posts;

        return output;
    };
    public createPost = async (input: CreatePostInputDTO) => {
        const { token, content } = input;

        if (token === undefined) {
            throw new Error("Token doesn't exist");
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
        const updatedAt = new Date().toISOString();
        const creatorId = payload.id;
        const creatorName = payload.name;

        const post = new Post(
            id,
            content,
            0,
            0,
            0,
            createdAt,
            updatedAt,
            creatorId,
            creatorName
        );

        const postDB = post.toDBModel();

        await this.postDataBase.create(postDB);
    };
    public editPost = async (input: EditPostInputDTO) => {
        const { idToEdit, token, content } = input;

        if (token === undefined) {
            throw new Error("Token doesn't exist");
        }

        const payload = this.tokenManager.getPayload(token);

        if (payload === null) {
            throw new Error("Invalid Token");
        }

        // if (!payload) {
        //   throw new Error("Invalid Token");
        // }

        if (typeof content !== "string") {
            throw new Error("Content must be a string");
        }

        const postDB = await this.postDataBase.findById(idToEdit);

        if (!postDB) {
            throw new Error("Id not found");
        }

        const creatorId = payload.id;

        if (postDB.creator_id !== payload.id) {
            throw new Error("You're not the owner of the post");
        }

        const creatorName = payload.name;

        const post = new Post(
            postDB.id,
            postDB.content,
            postDB.comments,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.updated_at,
            creatorId,
            creatorName
        );

        post.setContent(content);
        post.setUpdatedAt(new Date().toISOString());

        const updatedPostDB = post.toDBModel();

        await this.postDataBase.update(idToEdit, updatedPostDB);
    };

    public deletePost = async (input: DeletePostInputDTO) => {
        const { idToDelete, token } = input;

        if (token === undefined) {
            throw new Error("Token doesn't exist");
        }

        const payload = this.tokenManager.getPayload(token);

        if (payload === null) {
            throw new Error("Invalid Token");
        }

        const postDB = await this.postDataBase.findById(idToDelete);

        if (!postDB) {
            throw new Error("Id not found");
        }

        const creatorId = payload.id;

        if (payload.role !== ROLES.ADM && postDB.creator_id !== creatorId) {
            throw new Error("You're not the owner of the post");
        }

        await this.postDataBase.delete(idToDelete);
    };
    public likeOrDislikePost = async (input: LikeOrDislikePostInputDTO) => {
        const { idToLikeOrDislike, token, like } = input;

        if (token === undefined) {
            throw new Error("Token doesn't exist");
        }

        const payload = this.tokenManager.getPayload(token);

        if (payload === null) {
            throw new Error("Invalid Token");
        }

        if (typeof like !== "boolean") {
            throw new Error("Like must be a Boolean");
        }

        const postsWithCreatorDB = await this.postDataBase.findPostsWithCreatorById(idToLikeOrDislike);

        if (!postsWithCreatorDB) {
            throw new Error("Id not found");
        }

        const userId = payload.id;
        const likeSQLite = like ? 1 : 0;
        const likeDislikeDB: LikesDislikesDB = {
            user_id: userId,
            post_id: postsWithCreatorDB.id,
            like: likeSQLite,
        };

        const post = new Post(
            postsWithCreatorDB.id,
            postsWithCreatorDB.content,
            postsWithCreatorDB.comments,
            postsWithCreatorDB.likes,
            postsWithCreatorDB.dislikes,
            postsWithCreatorDB.created_at,
            postsWithCreatorDB.updated_at,
            postsWithCreatorDB.creator_id,
            postsWithCreatorDB.creator_name
        );

        const postLikeOrDislike = await this.postDataBase.findLikeDislike(likeDislikeDB);

        if (postLikeOrDislike === POST_LIKE.LIKED) {
            if (like) {
                await this.postDataBase.removeLikeDislike(likeDislikeDB);
                post.removeLike();
            } else {
                await this.postDataBase.updateLikeDislike(likeDislikeDB);
                post.removeLike();
                post.addDislike();
            }
        } else if (postLikeOrDislike === POST_LIKE.DISLIKED) {
            if (like) {
                await this.postDataBase.updateLikeDislike(likeDislikeDB);
                post.removeDislike();
                post.addLike();
            } else {
                await this.postDataBase.removeLikeDislike(likeDislikeDB);
                post.removeDislike();
            }
        } else {
            await this.postDataBase.likeOrDislikePost(likeDislikeDB);

            if (like) {
                post.addLike();
            } else {
                post.addDislike();
            }
        }
        const updatedPostDB = post.toDBModel();
        await this.postDataBase.update(idToLikeOrDislike, updatedPostDB);
    };
}