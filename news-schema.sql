-- Table for storing news articles
CREATE TABLE articles (
  id SERIAL PRIMARY KEY, 
  title TEXT NOT NULL, 
  description TEXT NOT NULL,
  url TEXT NOT NULL, 
  urlToImage TEXT
);


-- Table for storing user account information
CREATE TABLE users (
  id SERIAL PRIMARY KEY, 
  username VARCHAR(25) UNIQUE NOT NULL, 
  password TEXT NOT NULL 
);

-- Association table for storing which articles a user has saved
CREATE TABLE user_saved_articles (
  user_id INTEGER NOT NULL
  
    REFERENCES users(id) ON DELETE CASCADE, 
  article_id INTEGER NOT NULL
    REFERENCES articles(id) ON DELETE CASCADE, 
  PRIMARY KEY (user_id, article_id) 
);
