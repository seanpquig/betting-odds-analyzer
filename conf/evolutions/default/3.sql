# athletes schema
 
# --- !Ups
 
CREATE TABLE athletes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(256) NOT NULL,
  nickname VARCHAR(256),
  birth_date DATE NOT NULL,
  birth_locality VARCHAR(256),
  nationality VARCHAR(256) NOT NULL,
  height_cm DOUBLE NOT NULL,
  weight_kg DOUBLE NOT NULL,
  weight_class VARCHAR(256) NOT NULL,
  wins INT UNSIGNED NOT NULL,
  wins_ko_tko INT UNSIGNED NOT NULL,
  wins_sub INT UNSIGNED NOT NULL,
  wins_dec INT UNSIGNED NOT NULL,
  losses INT UNSIGNED NOT NULL,
  losses_ko_tko INT UNSIGNED NOT NULL,
  losses_sub INT UNSIGNED NOT NULL,
  losses_dec INT UNSIGNED NOT NULL,
  CONSTRAINT uc_key UNIQUE (fullname(200), birth_date)
);
 
# --- !Downs
 
DROP TABLE athletes;
