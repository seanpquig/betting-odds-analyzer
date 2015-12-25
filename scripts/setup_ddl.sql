-- Create MMA database
CREATE DATABASE IF NOT EXISTS mma_betting_db;

-- Create organizations table
CREATE TABLE IF NOT EXISTS mma_betting_db.organizations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(256) NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (name(200))
);

-- Create events table
CREATE TABLE IF NOT EXISTS mma_betting_db.events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY ,
  name VARCHAR(256) NOT NULL,
  event_date VARCHAR(256) NOT NULL,
  location VARCHAR(256) NOT NULL,
  org_id INT UNSIGNED NOT NULL,
  CONSTRAINT uc_key UNIQUE (name(200), org_id),

  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- Create athletes table
CREATE TABLE IF NOT EXISTS mma_betting_db.athletes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(256) NOT NULL,
  nickname VARCHAR(256) NOT NULL,
  birth_date DATE NOT NULL,
  birth_locality VARCHAR(256) NOT NULL,
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
  CONSTRAINT uc_key UNIQUE (fullname(200), nickname(200), birth_date)
);

-- Create fights table
CREATE TABLE IF NOT EXISTS mma_betting_db.fights (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  athlete1_id INT UNSIGNED NOT NULL,
  athlete2_id INT UNSIGNED NOT NULL,
  athlete1_result VARCHAR(256) NOT NULL,
  athlete2_result VARCHAR(256) NOT NULL,
  end_round INT UNSIGNED NOT NULL,
  end_round_time TIME NOT NULL,
  method VARCHAR(256) NOT NULL,
  referee VARCHAR(256) NOT NULL,
  CONSTRAINT uc_key UNIQUE (event_id, athlete1_id, athlete2_id),

  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (athlete1_id) REFERENCES athletes(id),
  FOREIGN KEY (athlete2_id) REFERENCES athletes(id),
);
