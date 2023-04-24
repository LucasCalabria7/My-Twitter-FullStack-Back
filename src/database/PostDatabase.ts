import { LikesDislikesDB, PostDB, PostWithCreatorsDB, POST_LIKE,} from "../interfaces/interfaces";
import { BaseDatabase } from "./BaseDatabase";

export class PostDatabase extends BaseDatabase {
    public static TABLE_POSTS = "posts";
    public static TABLE_LIKES_DISLIKES = "likes_dislikes";

    public getPostsWithCreators = async () => {
        const result: PostWithCreatorsDB[] = await BaseDatabase.connection(
            PostDatabase.TABLE_POSTS
        )
            .select(
                "posts.id",
                "posts.creator_id",
                "posts.content",
                "posts.comments",
                "posts.likes",
                "posts.dislikes",
                "posts.created_at",
                "posts.updated_at",
                "users.name AS creator_name"
            )
            .join("users", "posts.creator_id", "=", "users.id");
        return result;
    };

    public create = async (postDB: PostDB) => {
        await BaseDatabase.connection(PostDatabase.TABLE_POSTS).insert(postDB);
    };

    public findById = async (id: string) => {
        const result: PostDB[] = await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
            .select()
            .where({ id });
        return result[0];
    };

    public update = async (id: string, postDB: PostDB) => {
        await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
            .update(postDB)
            .where({ id });
    };

    public delete = async (id: string) => {
        await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
            .delete()
            .where({ id });
    };

    public likeOrDislikePost = async ( likeDislike: LikesDislikesDB ) => {
        await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES).insert(likeDislike);
    };

    public findPostsWithCreatorById = async ( postId: string ) => {
        const result: PostWithCreatorsDB[] = await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
            .select(
                "posts.id",
                "posts.creator_id",
                "posts.content",
                "posts.comments",
                "posts.likes",
                "posts.dislikes",
                "posts.created_at",
                "posts.updated_at",
                "users.name AS creator_name"
            )
            .join("users", "posts.creator_id", "=", "users.id")
            .where("posts.id", postId);
        return result[0];
    };

    public findLikeDislike = async ( likeDislikeToFind: LikesDislikesDB ) => {
        const [likeDislikeDB]: LikesDislikesDB[] = await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
            .select()
            .where({
                user_id: likeDislikeToFind.user_id,
                post_id: likeDislikeToFind.post_id,
            });
        if (likeDislikeDB) {
            return likeDislikeDB.like === 1
                ? POST_LIKE.LIKED
                : POST_LIKE.DISLIKED
        } else {
            return null;
        }
    };

    public removeLikeDislike = async ( likeDislikeDB: LikesDislikesDB ) => {
        await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
            .delete()
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id,
            });
    };

    public updateLikeDislike = async ( likeDislikeDB: LikesDislikesDB ) => {
        await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
            .update(likeDislikeDB)
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id,
            });
    };
}