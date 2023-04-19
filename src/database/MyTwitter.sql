-- Active: 1681249995334@@127.0.0.1@3306

CREATE TABLE
    users(
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT DEFAULT (DATETIME()) NOT NULL
    );

CREATE TABLE
    posts(
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        creator_id TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER NOT NULL,
        dislikes INTEGER NOT NULL,
        comments INTEGER DEFAULT(0) NOT NULL,
        created_at TEXT DEFAULT (DATETIME()) NOT NULL,
        updated_at TEXT DEFAULT(DATETIME()) NOT NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id)
    );

DROP TABLE likes_dislikes_comments;

CREATE TABLE
    likes_dislikes(
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        like INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id)
    );

CREATE TABLE
    comments(
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        creator_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT(0) NOT NULL,
        dislikes INTEGER DEFAULT(0) NOT NULL,
        created_at TEXT DEFAULT (DATETIME()) NOT NULL,
        updated_at TEXT DEFAULT(DATETIME()) NOT NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id)
    );

CREATE TABLE
    likes_dislikes_comments(
        user_id TEXT NOT NULL,
        comment_id TEXT NOT NULL,
        like INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (comment_id) REFERENCES comments(id)
    );

INSERT INTO
    users (id, name, email, password, role)
VALUES
(
        "id001",
        "Lebron James",
        "kingjames@gmail.com",
        "king123",
        "USER"
    ), (
        "id002",
        "Lucas Calabria",
        "calabria@gmail.com",
        "lucas123",
        "ADM"
    ), (
        "id003",
        "Steph Curry",
        "curry3pt@gmail.com",
        "chef123",
        "USER"
    ), (
        "id004",
        "Drake",
        "champagnepapi@gmail.com",
        "babybaby123",
        "USER"
    );

INSERT INTO
    posts (id, creator_id, content, likes, dislikes )
VALUES
(
        "post001",
        "id001",
        "Tweet",
        2000,
        100
    ), (
        "post002",
        "id001",
        "Tweet",
        200,
        77
    ), (
        "post003",
        "id001",
        "Video",
        400,
        17
    ), (
        "post004",
        "id003",
        "Photo",
        555,
        13
    ), (
        "post005",
        "id004",
        "Photo",
        777,
        10
    ), (
        "post006",
        "id002",
        "Emoji",
        713,
        1
    );

INSERT INTO
    comments( id, creator_id, post_id, content )
VALUES
("com001", "id001", "post002", "Sera ?");