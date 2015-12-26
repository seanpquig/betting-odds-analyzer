# organizations schema
 
# --- !Ups
 
CREATE TABLE organizations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(256) NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (name(200))
);
 
# --- !Downs
 
DROP TABLE organizations;
