CREATE TABLE organization (
  id                  SERIAL UNIQUE,
  name                TEXT,
  description         TEXT
);

CREATE TABLE person (
  id                  SERIAL UNIQUE,
  name                TEXT,
  organization_id     INTEGER,
  FOREIGN KEY (organization_id) REFERENCES organization(id)
);