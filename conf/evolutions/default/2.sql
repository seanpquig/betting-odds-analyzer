# events schema
 
# --- !Ups
 
CREATE TABLE events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY ,
  name VARCHAR(256) NOT NULL,
  event_date VARCHAR(256) NOT NULL,
  location VARCHAR(256) NOT NULL,
  org_id INT UNSIGNED NOT NULL,
  CONSTRAINT uc_key UNIQUE (name(200), org_id),

  FOREIGN KEY (org_id) REFERENCES organizations(id)
);
 
# --- !Downs
 
DROP TABLE events;
