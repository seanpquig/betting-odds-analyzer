-- Create MMA database
CREATE DATABASE IF NOT EXISTS mma_betting_db;

-- Create athletes table
CREATE TABLE IF NOT EXISTS mma_betting_db.athletes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(128) NOT NULL,
  lastname VARCHAR(128) NOT NULL,
  nickname VARCHAR(128),
  birthday DATE,
  height_cm DOUBLE,
  weight_kg DOUBLE
);

-- Create fights table
CREATE TABLE IF NOT EXISTS mma_betting_db.fights (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_date DATE NOT NULL,
  athlete1_id INT UNSIGNED NOT NULL,
  athlete2_id INT UNSIGNED NOT NULL,
  athlete1_result VARCHAR(64),
  athlete2_result VARCHAR(64),

  FOREIGN KEY (athlete1_id) REFERENCES athletes(id),
  FOREIGN KEY (athlete2_id) REFERENCES athletes(id)
);
