-- Seed popular leagues for POC
-- These are the major soccer leagues that will be featured

INSERT INTO popular_leagues (league_id, league_name, country, logo_url, priority) VALUES
  (39, 'Premier League', 'England', 'https://media.api-sports.io/football/leagues/39.png', 1),
  (140, 'La Liga', 'Spain', 'https://media.api-sports.io/football/leagues/140.png', 2),
  (78, 'Bundesliga', 'Germany', 'https://media.api-sports.io/football/leagues/78.png', 3),
  (135, 'Serie A', 'Italy', 'https://media.api-sports.io/football/leagues/135.png', 4),
  (61, 'Ligue 1', 'France', 'https://media.api-sports.io/football/leagues/61.png', 5),
  (2, 'UEFA Champions League', 'World', 'https://media.api-sports.io/football/leagues/2.png', 6)
ON CONFLICT (league_id) DO NOTHING;
