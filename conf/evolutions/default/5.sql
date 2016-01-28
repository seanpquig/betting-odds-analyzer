# fight_odds_bookmaker_eu schema
 
# --- !Ups
 
CREATE TABLE IF NOT EXISTS fight_odds_bookmaker_eu (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league VARCHAR(256) NOT NULL,
  event VARCHAR(256) NOT NULL,
  event_sub_portion VARCHAR(256),
  event_location VARCHAR(256) NOT NULL,
  visitor_athlete VARCHAR(256) NOT NULL,
  home_athlete VARCHAR(256) NOT NULL,
  fight_time VARCHAR(256) NOT NULL,
  vistor_moneyline INT NOT NULL,
  home_moneyline INT NOT NULL,
  under_moneyline INT NOT NULL,
  over_moneyline INT NOT NULL,
  prop_count INT UNSIGNED NOT NULL,
  CONSTRAINT uc_key UNIQUE (event(200), visitor_athlete(200), home_athlete(200))
);
 
# --- !Downs
 
-- DROP TABLE fight_odds_bookmaker_eu;