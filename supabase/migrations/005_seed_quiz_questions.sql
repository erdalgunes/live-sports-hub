-- Seed quiz questions with 50 classic football trivia
-- Categories: players_legends, teams_clubs, competitions, historical_moments, records_stats

-- Players & Legends (10 questions)
INSERT INTO quiz_questions (category, difficulty, question, options, correct_answer, fun_fact) VALUES
('players_legends', 'easy', 'Who has won the most Ballon d''Or awards?', '["Cristiano Ronaldo", "Lionel Messi", "Michel Platini", "Johan Cruyff"]', 1, 'Lionel Messi has won 8 Ballon d''Or awards, the most in history.'),
('players_legends', 'medium', 'Which player scored the "Hand of God" goal?', '["Pelé", "Diego Maradona", "Ronaldo Nazário", "Zinedine Zidane"]', 1, 'Diego Maradona scored this controversial goal against England in the 1986 World Cup quarter-final.'),
('players_legends', 'hard', 'Who is the all-time top scorer in World Cup history?', '["Ronaldo Nazário", "Miroslav Klose", "Gerd Müller", "Just Fontaine"]', 1, 'Miroslav Klose scored 16 goals across four World Cups (2002-2014).'),
('players_legends', 'easy', 'Which country is Cristiano Ronaldo from?', '["Spain", "Brazil", "Portugal", "Argentina"]', 2, 'Ronaldo was born in Madeira, Portugal, in 1985.'),
('players_legends', 'medium', 'Who won the Golden Boot at the 2018 World Cup?', '["Harry Kane", "Kylian Mbappé", "Antoine Griezmann", "Romelu Lukaku"]', 0, 'Harry Kane scored 6 goals to win the Golden Boot in Russia.'),
('players_legends', 'hard', 'Which player has the most Champions League appearances?', '["Cristiano Ronaldo", "Iker Casillas", "Lionel Messi", "Xavi Hernández"]', 0, 'Cristiano Ronaldo has made over 180 Champions League appearances.'),
('players_legends', 'medium', 'Who was the first player to score 100 international goals?', '["Pelé", "Ferenc Puskás", "Ali Daei", "Cristiano Ronaldo"]', 2, 'Ali Daei reached 100 goals for Iran before Ronaldo surpassed his record.'),
('players_legends', 'easy', 'Which position did Lev Yashin play?', '["Striker", "Midfielder", "Goalkeeper", "Defender"]', 2, 'Yashin is the only goalkeeper to win the Ballon d''Or (1963).'),
('players_legends', 'hard', 'Who scored the fastest hat-trick in Premier League history?', '["Sadio Mané", "Dwight Yorke", "Robbie Fowler", "Jermain Defoe"]', 0, 'Sadio Mané scored a hat-trick in just 2 minutes 56 seconds for Southampton in 2015.'),
('players_legends', 'medium', 'Which Brazilian legend never won a World Cup?', '["Romário", "Ronaldinho", "Zico", "Rivaldo"]', 2, 'Despite his brilliance, Zico never won the World Cup with Brazil.'),

-- Teams & Clubs (10 questions)
('teams_clubs', 'easy', 'Which club has won the most Champions League titles?', '["AC Milan", "Bayern Munich", "Real Madrid", "Barcelona"]', 2, 'Real Madrid has won 14 Champions League/European Cup titles.'),
('teams_clubs', 'medium', 'What year was Manchester United founded?', '["1878", "1892", "1902", "1910"]', 0, 'Manchester United was founded as Newton Heath LYR in 1878.'),
('teams_clubs', 'hard', 'Which team won the Premier League without losing a single game?', '["Arsenal 2003-04", "Chelsea 2004-05", "Manchester City 2017-18", "Liverpool 2019-20"]', 0, 'Arsenal''s "Invincibles" went unbeaten in the 2003-04 Premier League season.'),
('teams_clubs', 'easy', 'What is Barcelona''s home stadium called?', '["Bernabéu", "Camp Nou", "San Siro", "Allianz Arena"]', 1, 'Camp Nou has been Barcelona''s home since 1957 with a capacity of 99,354.'),
('teams_clubs', 'medium', 'Which English club is known as "The Toffees"?', '["Everton", "Tottenham", "West Ham", "Aston Villa"]', 0, 'Everton earned this nickname from a toffee shop near their original stadium.'),
('teams_clubs', 'hard', 'Which club has won the most consecutive league titles?', '["Celtic", "Juventus", "Ajax", "CSKA Sofia"]', 3, 'CSKA Sofia won 7 consecutive Bulgarian titles (1954-1962).'),
('teams_clubs', 'medium', 'What color are Juventus home shirts traditionally?', '["Red and Black", "Black and White", "Blue and White", "Yellow and Black"]', 1, 'Juventus wear black and white stripes, earning them the nickname "The Old Lady".'),
('teams_clubs', 'easy', 'Which German club is nicknamed "Die Roten" (The Reds)?', '["Borussia Dortmund", "Bayern Munich", "RB Leipzig", "Bayer Leverkusen"]', 1, 'Bayern Munich wears red and has dominated German football.'),
('teams_clubs', 'hard', 'Which club won the first ever European Cup in 1956?', '["Real Madrid", "AC Milan", "Benfica", "Stade de Reims"]', 0, 'Real Madrid beat Stade de Reims 4-3 in Paris.'),
('teams_clubs', 'medium', 'Which Italian club plays at the San Siro?', '["AC Milan and Inter Milan", "Juventus", "Roma", "Napoli"]', 0, 'AC Milan and Inter Milan share the iconic San Siro stadium.'),

-- Competitions (10 questions)
('competitions', 'easy', 'How often is the FIFA World Cup held?', '["Every 2 years", "Every 4 years", "Every 3 years", "Every 5 years"]', 1, 'The World Cup has been held every 4 years since 1930 (except during WWII).'),
('competitions', 'medium', 'Which country won the first ever World Cup in 1930?', '["Brazil", "Uruguay", "Argentina", "Italy"]', 1, 'Uruguay hosted and won the inaugural tournament, beating Argentina 4-2 in the final.'),
('competitions', 'hard', 'Which country has hosted the World Cup the most times?', '["Brazil", "Italy", "Mexico", "Germany"]', 2, 'Mexico has hosted the World Cup twice (1970, 1986).'),
('competitions', 'easy', 'What is the UEFA Champions League trophy officially called?', '["European Cup", "Champions Trophy", "Big Ears", "The Cup"]', 0, 'It''s officially the European Champion Clubs'' Cup, nicknamed "Big Ears".'),
('competitions', 'medium', 'When was the first Women''s World Cup held?', '["1988", "1991", "1995", "1999"]', 1, 'The first FIFA Women''s World Cup was held in China in 1991.'),
('competitions', 'hard', 'Which nation won the first European Championship in 1960?', '["Soviet Union", "Spain", "West Germany", "France"]', 0, 'The Soviet Union beat Yugoslavia 2-1 in the final in Paris.'),
('competitions', 'medium', 'How many teams participate in the World Cup finals?', '["24", "32", "36", "48"]', 1, 'Since 1998, 32 teams have participated (expanding to 48 in 2026).'),
('competitions', 'easy', 'Which competition is also known as the Copa América?', '["African Cup of Nations", "South American Championship", "Asian Cup", "CONCACAF Gold Cup"]', 1, 'Copa América is the main international tournament for South American national teams.'),
('competitions', 'hard', 'Which club won the first UEFA Cup Winners'' Cup in 1961?', '["Fiorentina", "Rangers", "Atlético Madrid", "Tottenham Hotspur"]', 0, 'Fiorentina won the inaugural tournament, beating Rangers on aggregate.'),
('competitions', 'medium', 'What is the name of the trophy awarded to the World Cup winner?', '["Jules Rimet Trophy", "FIFA World Cup Trophy", "Golden Globe", "Victory Cup"]', 1, 'The current trophy has been used since 1974, replacing the Jules Rimet Trophy.'),

-- Historical Moments (10 questions)
('historical_moments', 'medium', 'In which year did Leicester City win the Premier League?', '["2014", "2015", "2016", "2017"]', 2, 'Leicester''s 5000-1 odds triumph in 2016 is considered the greatest underdog story in sports.'),
('historical_moments', 'hard', 'Which match is known as the "Miracle of Istanbul"?', '["Liverpool vs AC Milan 2005", "Barcelona vs PSG 2017", "Manchester United vs Bayern 1999", "Chelsea vs Barcelona 2012"]', 0, 'Liverpool came back from 3-0 down at halftime to win the 2005 Champions League final.'),
('historical_moments', 'easy', 'Which country won the 2018 FIFA World Cup?', '["Germany", "Brazil", "France", "Argentina"]', 2, 'France beat Croatia 4-2 in the final in Moscow.'),
('historical_moments', 'medium', 'What year did the Premier League begin?', '["1990", "1992", "1995", "1998"]', 1, 'The Premier League was founded in 1992, replacing the First Division.'),
('historical_moments', 'hard', 'Which team completed the "Sextuple" in 2009?', '["Manchester United", "Barcelona", "Bayern Munich", "Real Madrid"]', 1, 'Barcelona won all six competitions they entered under Pep Guardiola.'),
('historical_moments', 'medium', 'Who scored the winning goal in the 2014 World Cup final?', '["Thomas Müller", "Mario Götze", "André Schürrle", "Miroslav Klose"]', 1, 'Mario Götze scored in extra time to give Germany a 1-0 victory over Argentina.'),
('historical_moments', 'easy', 'Which tournament did Greece surprisingly win in 2004?', '["World Cup", "European Championship", "Olympics", "Confederations Cup"]', 1, 'Greece beat Portugal 1-0 in the Euro 2004 final as massive underdogs.'),
('historical_moments', 'hard', 'What was the score in Brazil vs Germany at the 2014 World Cup semi-final?', '["7-1", "6-0", "5-0", "6-1"]', 0, 'Germany humiliated hosts Brazil 7-1 in one of football''s biggest shocks.'),
('historical_moments', 'medium', 'Which player scored in the 1999 Champions League final in injury time?', '["Ole Gunnar Solskjær", "Teddy Sheringham", "Dwight Yorke", "Andy Cole"]', 0, 'Solskjær scored the winner for Manchester United against Bayern Munich.'),
('historical_moments', 'easy', 'Who won the 2022 FIFA World Cup?', '["France", "Argentina", "Brazil", "Croatia"]', 1, 'Argentina beat France on penalties after a 3-3 draw in Qatar.'),

-- Records & Stats (10 questions)
('records_stats', 'easy', 'What is the maximum number of players on the field for one team?', '["10", "11", "12", "9"]', 1, 'Each team fields 11 players including the goalkeeper.'),
('records_stats', 'hard', 'Who holds the record for most goals in a calendar year?', '["Lionel Messi", "Cristiano Ronaldo", "Gerd Müller", "Ferenc Puskás"]', 0, 'Messi scored 91 goals in 2012, breaking Gerd Müller''s 40-year record.'),
('records_stats', 'medium', 'What is the fastest goal ever scored in World Cup history?', '["10.8 seconds", "11.5 seconds", "15.3 seconds", "8.9 seconds"]', 1, 'Hakan Şükür scored for Turkey after 11.5 seconds vs South Korea in 2002.'),
('records_stats', 'easy', 'How long is a standard football match?', '["80 minutes", "90 minutes", "100 minutes", "85 minutes"]', 1, 'A match consists of two 45-minute halves plus stoppage time.'),
('records_stats', 'hard', 'Which player has the most assists in Premier League history?', '["Ryan Giggs", "Cesc Fàbregas", "Wayne Rooney", "Frank Lampard"]', 0, 'Ryan Giggs recorded 162 assists during his Premier League career.'),
('records_stats', 'medium', 'What is the highest attendance ever recorded at a football match?', '["173,850", "199,854", "210,000", "156,432"]', 1, 'The 1950 World Cup final in Brazil drew 199,854 fans to Maracanã.'),
('records_stats', 'easy', 'How many substitutions are typically allowed in a match?', '["3", "4", "5", "6"]', 2, 'FIFA increased substitutions from 3 to 5 during the COVID-19 pandemic.'),
('records_stats', 'hard', 'Which goalkeeper has the most clean sheets in Premier League history?', '["Petr Čech", "David de Gea", "Edwin van der Sar", "Joe Hart"]', 0, 'Petr Čech kept 202 clean sheets in the Premier League.'),
('records_stats', 'medium', 'What is the record transfer fee for a player?', '["€222 million", "€180 million", "€145 million", "€200 million"]', 0, 'Neymar moved from Barcelona to PSG for €222 million in 2017.'),
('records_stats', 'medium', 'Which player has won the most Champions League titles?', '["Cristiano Ronaldo", "Luka Modrić", "Toni Kroos", "Karim Benzema"]', 0, 'Cristiano Ronaldo has won 5 Champions League titles (1 with Man Utd, 4 with Real Madrid).');
