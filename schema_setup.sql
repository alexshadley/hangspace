-- reset DB
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;


CREATE TABLE users (
    id serial PRIMARY KEY,
    name text
);

CREATE TABLE posts (
    id serial PRIMARY KEY,
    created_ts timestamp DEFAULT CURRENT_TIMESTAMP, 
    content text,
    user_id integer REFERENCES users(id),
    parent_id integer REFERENCES posts(id)
);

insert into users (name) values
    ('Alex'),
    ('Daisy'),
    ('Mom');

insert into posts (content, user_id, parent_id) values 
    ('Howdy, girl!', 3, null),
    ('You''re weird mom', 1, 1),
    ('Hey everyone!', 2, null)
;