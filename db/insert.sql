INSERT INTO organization (name, description)
VALUES (
  'Nike', 'sports & fitness apparal '
),(
  'Intel', 'Tech'
),(
  'McDonalds', 'Fastfood'
);

INSERT INTO person (name, organization_id )
VALUES (
  'Pete', 
  (SELECT id FROM organization WHERE name='Nike')
),(
  'Donna', 
  (SELECT id FROM organization WHERE name='Nike')
),(
  'Ted', 
  (SELECT id FROM organization WHERE name='Intel')
),(
  'Stanley', 
  (SELECT id FROM organization WHERE name='McDonalds')
),(
  'Steven', 
  (SELECT id FROM organization WHERE name='McDonalds')
),(
  'Amanda', 
  (SELECT id FROM organization WHERE name='McDonalds')
),(
  'Terra', 
  (SELECT id FROM organization WHERE name='Intel')
);
