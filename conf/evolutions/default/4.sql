# fights schema
 
# --- !Ups
 
CREATE TABLE IF NOT EXISTS fights (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  athlete1_id INT UNSIGNED NOT NULL,
  athlete2_id INT UNSIGNED NOT NULL,
  athlete1_result VARCHAR(256),
  athlete2_result VARCHAR(256),
  end_round INT UNSIGNED,
  end_round_time VARCHAR(256),
  method VARCHAR(256),
  referee VARCHAR(256),
  CONSTRAINT uc_key UNIQUE (event_id, athlete1_id, athlete2_id),

  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (athlete1_id) REFERENCES athletes(id),
  FOREIGN KEY (athlete2_id) REFERENCES athletes(id)
);
 
# --- !Downs
 
DROP TABLE fights;
