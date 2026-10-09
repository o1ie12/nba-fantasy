'use client'

import { useEffect, useMemo, useState } from 'react'
import { profileForPlayer, recommendPlayers } from './lib/recommendations'

type Strategy = 'Balanced' | 'DD/TD-heavy' | 'Opportunistic punt'
type Player = { rank: number; name: string; positions?: string; note?: string; risk?: boolean; adp?: number }

const players: Player[] = [
  { rank: 1, name: 'Nikola Jokic', positions: 'C', note: 'Anchor / DD-TD upside' },
  { rank: 2, name: 'Victor Wembanyama', positions: 'C', note: 'BLK / REB ceiling', risk: true },
  { rank: 3, name: 'Shai Gilgeous-Alexander', positions: 'PG, SG', note: 'PTS / STL / FT%' },
  { rank: 4, name: 'Luka Doncic', positions: 'PG, SG', note: 'PTS / AST / TD' },
  { rank: 5, name: 'Cade Cunningham', positions: 'PG, SG', note: 'PTS / AST' },
  { rank: 6, name: 'Giannis Antetokounmpo', positions: 'PF, C', note: 'REB / FG% / DD', risk: true },
  { rank: 7, name: 'Jayson Tatum', positions: 'SF, PF', note: 'Balanced wing' },
  { rank: 8, name: 'Anthony Edwards', positions: 'SG, SF', note: 'PTS / 3PM / STL' },
  { rank: 9, name: 'Tyrese Haliburton', positions: 'PG', note: 'AST / 3PM / FT%', risk: true },
  { rank: 10, name: 'Karl-Anthony Towns', positions: 'PF, C', note: 'PTS / REB / 3PM' },
  { rank: 11, name: 'Cooper Flagg', positions: 'SF, PF', note: 'Multi-category upside', risk: true },
  { rank: 12, name: 'Anthony Davis', positions: 'PF, C', note: 'REB / BLK / FG%', risk: true },
  { rank: 13, name: 'Scottie Barnes', positions: 'SF, PF', note: 'AST / REB / STL' },
  { rank: 14, name: 'Kevin Durant', positions: 'SF, PF', note: 'PTS / FT% / 3PM', risk: true },
  { rank: 15, name: 'Donovan Mitchell', positions: 'PG, SG', note: 'PTS / 3PM / STL' },
  { rank: 16, name: 'Jalen Brunson', positions: 'PG', note: 'PTS / AST / FT%' },
  { rank: 17, name: 'Stephen Curry', positions: 'PG', note: '3PM / FT% / PTS', risk: true },
  { rank: 18, name: 'Amen Thompson', positions: 'SG, SF', note: 'REB / AST / STL' },
  { rank: 19, name: 'Alperen Sengun', positions: 'C', note: 'REB / AST / DD' },
  { rank: 20, name: 'Jalen Johnson', positions: 'SF, PF', note: 'REB / AST / DD', risk: true },
  { rank: 21, name: 'Trae Young', positions: 'PG', note: 'AST / 3PM / FT%' },
  { rank: 22, name: 'Jaylen Brown', positions: 'SG, SF', note: 'PTS / REB / STL' },
  { rank: 23, name: 'Devin Booker', positions: 'SG, PG', note: 'PTS / 3PM / FT%' },
  { rank: 24, name: 'Jamal Murray', positions: 'PG, SG', note: 'PTS / 3PM / AST', risk: true },
  { rank: 25, name: 'Domantas Sabonis', positions: 'PF, C', note: 'REB / AST / DD' },
  { rank: 26, name: 'LaMelo Ball', positions: 'PG', note: 'AST / 3PM / STL', risk: true },
  { rank: 27, name: 'James Harden', positions: 'PG, SG', note: 'AST / 3PM / FT%' },
  { rank: 28, name: 'LeBron James', positions: 'SF, PF', note: 'AST / REB / DD', risk: true },
  { rank: 29, name: 'Chet Holmgren', positions: 'PF, C', note: 'BLK / FG% / 3PM', risk: true },
  { rank: 30, name: 'Josh Giddey', positions: 'PG, SG', note: 'REB / AST / DD' },
  { rank: 31, name: 'Kawhi Leonard', positions: 'SF, PF', note: 'STL / FG% / FT%', risk: true },
  { rank: 32, name: 'Bam Adebayo', positions: 'C', note: 'FG% / REB / AST' },
  { rank: 33, name: 'Evan Mobley', positions: 'PF, C', note: 'REB / BLK / FG%' },
  { rank: 34, name: 'Austin Reaves', positions: 'SG, SF', note: 'FT% / AST / 3PM' },
  { rank: 35, name: 'Pascal Siakam', positions: 'PF, C', note: 'PTS / REB / FG%' },
  { rank: 36, name: 'Paolo Banchero', positions: 'PF', note: 'PTS / REB / AST', risk: true },
  { rank: 37, name: 'Jalen Williams', positions: 'SG, SF', note: 'Balanced wing' },
  { rank: 38, name: 'Aaron Nesmith', positions: 'SF, PF', note: '3PM / FT% / STL' },
  { rank: 39, name: 'Jalen Duren', positions: 'C', note: 'REB / FG% / DD' },
  { rank: 40, name: 'Deni Avdija', positions: 'SF, PF', note: 'REB / AST / STL' },
  { rank: 41, name: 'Tyrese Haliburton', positions: 'PG', note: 'AST / 3PM / FT%', risk: true },
  { rank: 42, name: 'Walker Kessler', positions: 'C', note: 'REB / BLK / FG%', risk: true },
  { rank: 43, name: 'AJ Green', positions: 'SG', note: '3PM specialist' },
  { rank: 44, name: 'Derrick White', positions: 'PG, SG', note: '3PM / STL / BLK' },
  { rank: 45, name: 'Joel Embiid', positions: 'C', note: 'PTS / REB / FT%', risk: true },
  { rank: 46, name: 'Desmond Bane', positions: 'SG, SF', note: 'PTS / 3PM / AST' },
  { rank: 47, name: 'Franz Wagner', positions: 'SF, PF', note: 'PTS / AST / REB' },
  { rank: 48, name: 'Trey Murphy III', positions: 'SF, PF', note: '3PM / PTS / FT%' },
  { rank: 49, name: 'Ivica Zubac', positions: 'C', note: 'REB / FG% / DD' },
  { rank: 50, name: 'Zion Williamson', positions: 'PF', note: 'PTS / FG% / REB', risk: true },
  { rank: 51, name: 'Jaren Jackson Jr.', positions: 'PF, C', note: 'BLK / 3PM / PTS' },
  { rank: 52, name: 'Dyson Daniels', positions: 'PG, SG', note: 'STL / AST / REB' },
  { rank: 53, name: 'Kon Knueppel', positions: 'SG, SF', note: 'Lower-confidence market row', risk: true },
  { rank: 54, name: 'Lauri Markkanen', positions: 'PF, C', note: '3PM / PTS / REB' },
  { rank: 55, name: 'Stephon Castle', positions: 'PG, SG', note: 'STL / AST / REB' },
  { rank: 56, name: 'OG Anunoby', positions: 'SF, PF', note: 'STL / 3PM / FG%' },
  { rank: 57, name: 'Michael Porter Jr.', positions: 'SF, PF', note: '3PM / PTS / REB', risk: true },
  { rank: 58, name: 'Tyler Herro', positions: 'PG, SG', note: 'PTS / 3PM / FT%' },
  { rank: 59, name: "De'Aaron Fox", positions: 'PG', note: 'PTS / AST / STL' },
  { rank: 60, name: 'Darius Garland', positions: 'PG', note: 'AST / 3PM / FT%' },
  { rank: 61, name: 'Kyrie Irving', positions: 'PG, SG', note: 'PTS / AST / FT%', risk: true },
  { rank: 62, name: 'Julius Randle', positions: 'PF, C', note: 'PTS / REB / AST' },
  { rank: 63, name: 'Onyeka Okongwu', positions: 'PF, C', note: 'REB / FG% / BLK' },
  { rank: 64, name: 'Donovan Clingan', positions: 'C', note: 'REB / BLK / FG%' },
  { rank: 65, name: 'Ja Morant', positions: 'PG', note: 'PTS / AST / FT%', risk: true },
  { rank: 66, name: 'Jarrett Allen', positions: 'C', note: 'REB / FG% / DD' },
  { rank: 67, name: 'Mikal Bridges', positions: 'SF, PF', note: '3PM / STL / PTS' },
  { rank: 68, name: 'Damian Lillard', positions: 'PG', note: 'PTS / 3PM / FT%', risk: true },
  { rank: 69, name: 'Alex Sarr', positions: 'PF, C', note: 'BLK / REB / 3PM' },
  { rank: 70, name: 'Brandon Miller', positions: 'SF, PF', note: 'PTS / 3PM / FT%' },
  { rank: 71, name: 'Brandon Ingram', positions: 'SF, PF', note: 'PTS / AST / FT%', risk: true },
  { rank: 72, name: 'Coby White', positions: 'PG, SG', note: '3PM / PTS / FT%' },
  { rank: 73, name: 'Jordan Poole', positions: 'PG, SG', note: 'PTS / 3PM / AST' },
  { rank: 74, name: 'Rudy Gobert', positions: 'C', note: 'REB / FG% / BLK' },
  { rank: 75, name: 'Keyonte George', positions: 'PG, SG', note: 'AST / 3PM / PTS' },
  { rank: 76, name: 'Naz Reid', positions: 'PF, C', note: '3PM / REB / BLK' },
  { rank: 77, name: 'Brook Lopez', positions: 'C', note: 'BLK / 3PM / FG%' },
  { rank: 78, name: 'Josh Hart', positions: 'SG, SF', note: 'REB / AST / STL' },
  { rank: 79, name: 'Nickeil Alexander-Walker', positions: 'SG, SF', note: '3PM / STL / FT%' },
  { rank: 80, name: 'Jaden McDaniels', positions: 'SF, PF', note: 'STL / 3PM / FG%' },
  { rank: 81, name: 'VJ Edgecombe', positions: 'SG, SF', note: 'STL / PTS / REB', risk: true },
  { rank: 82, name: 'Myles Turner', positions: 'C', note: 'BLK / 3PM / FG%' },
  { rank: 83, name: 'Payton Pritchard', positions: 'PG', note: '3PM / AST / FT%' },
  { rank: 84, name: 'Paul George', positions: 'SG, SF', note: '3PM / STL / FT%', risk: true },
  { rank: 85, name: 'Matas Buzelis', positions: 'SF, PF', note: '3PM / BLK / REB', risk: true },
  { rank: 86, name: 'Miles Bridges', positions: 'SF, PF', note: 'PTS / 3PM / REB' },
  { rank: 87, name: 'AJ Dybantsa', positions: 'SF, PF', note: 'PTS / upside', risk: true },
  { rank: 88, name: 'Adem Bona', positions: 'C', note: 'REB / BLK', risk: true },
  { rank: 89, name: 'Dylan Harper', positions: 'PG, SG', note: 'PTS / AST / REB', risk: true },
  { rank: 90, name: 'Cameron Boozer', positions: 'PF', note: 'PTS / REB / AST', risk: true },
  { rank: 91, name: 'Nikola Topic', positions: 'PG', note: 'AST / FT% / upside', risk: true },
  { rank: 92, name: 'Jalen Green', positions: 'SG', note: 'PTS / 3PM / FT%' },
  { rank: 93, name: 'Luke Kennard', positions: 'SG, SF', note: '3PM / FT% specialist' },
  { rank: 94, name: 'Ryan Rollins', positions: 'PG, SG', note: 'AST / STL / 3PM' },
  { rank: 95, name: 'Zach Edey', positions: 'C', note: 'REB / FG% / DD' },
  { rank: 96, name: 'Dejounte Murray', positions: 'PG, SG', note: 'AST / STL / REB', risk: true },
  { rank: 97, name: "De'Andre Hunter", positions: 'SF, PF', note: '3PM / PTS / FT%' },
  { rank: 98, name: 'Norman Powell', positions: 'SG, SF', note: 'PTS / 3PM / FT%' },
  { rank: 99, name: 'Ausar Thompson', positions: 'SG, SF', note: 'REB / STL / AST' },
  { rank: 100, name: 'T.J. McConnell', positions: 'PG', note: 'AST / STL / low TO' },
  { rank: 101, name: 'Andre Drummond', positions: 'C', note: 'REB / FG% / DD' },
  { rank: 102, name: "Kel'el Ware", positions: 'C', note: 'REB / BLK / FG%' },
  { rank: 103, name: 'Allen Gordon', positions: 'SF, PF', note: 'Lower-confidence market row' },
  { rank: 104, name: "Day'Ron Sharpe", positions: 'C', note: 'REB / FG% / DD' },
  { rank: 105, name: 'DeMar DeRozan', positions: 'SF, PF', note: 'PTS / FT% / AST' },
  { rank: 106, name: 'Caleb Martin', positions: 'SF, PF', note: '3PM / STL / REB' },
  { rank: 107, name: 'Moussa Diabate', positions: 'PF, C', note: 'REB / FG% / upside' },
  { rank: 108, name: 'Andrew Wiggins', positions: 'SF, PF', note: 'PTS / STL / 3PM' },
  { rank: 109, name: 'Nic Claxton', positions: 'C', note: 'REB / BLK / FG%', risk: true },
  { rank: 110, name: 'Kristaps Porzingis', positions: 'PF, C', note: 'BLK / 3PM / FT%', risk: true },
  { rank: 111, name: 'CJ McCollum', positions: 'PG, SG', note: 'PTS / 3PM / FT%' },
  { rank: 112, name: 'RJ Barrett', positions: 'SG, SF', note: 'PTS / REB / FT%' },
  { rank: 113, name: 'Mark Williams', positions: 'C', note: 'REB / FG% / DD', risk: true },
  { rank: 114, name: 'Darryn Peterson', positions: 'PG, SG', note: 'PTS / AST / upside', risk: true },
  { rank: 115, name: 'Immanuel Quickley', positions: 'PG, SG', note: 'AST / 3PM / FT%' },
  { rank: 116, name: 'Derik Queen', positions: 'PF, C', note: 'REB / FG% / DD', risk: true },
  { rank: 117, name: 'Isaiah Hartenstein', positions: 'C', note: 'REB / AST / FG%' },
  { rank: 118, name: 'Daniel Gafford', positions: 'C', note: 'FG% / BLK / DD' },
  { rank: 119, name: 'Kevin Porter Jr.', positions: 'PG, SG', note: 'PTS / AST / 3PM' },
  { rank: 120, name: 'Ty Jerome', positions: 'PG, SG', note: 'AST / 3PM / FT%' },
  { rank: 121, name: 'Anfernee Simons', positions: 'PG, SG', note: 'PTS / 3PM / FT%' },
  { rank: 122, name: 'Jimmy Butler', positions: 'SF, PF', note: 'AST / STL / FT%', risk: true },
  { rank: 123, name: 'Jabari Smith Jr.', positions: 'PF, C', note: '3PM / REB / BLK' },
  { rank: 124, name: 'Zach LaVine', positions: 'SG, SF', note: 'PTS / 3PM / FT%', risk: true },
  { rank: 125, name: 'Aaron Nesmith', positions: 'SF, PF', note: '3PM / FT% / STL' },
  { rank: 126, name: 'Draymond Green', positions: 'PF, C', note: 'AST / STL / BLK' },
  { rank: 127, name: 'Reed Sheppard', positions: 'PG, SG', note: '3PM / STL / AST' },
  { rank: 128, name: 'Christian Braun', positions: 'SG, SF', note: 'FG% / REB / STL' },
  { rank: 129, name: 'Jakob Poeltl', positions: 'C', note: 'REB / FG% / DD' },
  { rank: 130, name: 'Klay Thompson', positions: 'SG, SF', note: '3PM / FT% / PTS' },
  { rank: 131, name: 'Shaedon Sharpe', positions: 'SG, SF', note: 'PTS / 3PM / upside' },
  { rank: 132, name: 'Jared McCain', positions: 'PG, SG', note: '3PM / FT% / PTS' },
  { rank: 133, name: 'Alex Caruso', positions: 'PG, SG', note: 'STL / low TO / FG%' },
  { rank: 134, name: 'Jalen Suggs', positions: 'PG, SG', note: 'STL / 3PM / AST', risk: true },
  { rank: 135, name: 'John Collins', positions: 'PF, C', note: 'REB / FG% / 3PM' },
  { rank: 136, name: 'Neemias Queta', positions: 'C', note: 'REB / FG% / BLK' },
  { rank: 137, name: 'Deandre Ayton', positions: 'C', note: 'REB / FG% / DD', risk: true },
  { rank: 138, name: 'Aday Mara', positions: 'C', note: 'BLK / FG% / upside', risk: true },
  { rank: 139, name: 'Andrew Nembhard', positions: 'PG, SG', note: 'AST / STL / low TO' },
  { rank: 140, name: 'Luke Kornet', positions: 'C', note: 'FG% / REB / BLK' },
  { rank: 141, name: 'Ayo Dosunmu', positions: 'PG, SG', note: 'STL / AST / low TO' },
  { rank: 142, name: 'Devin Vassell', positions: 'SG, SF', note: 'PTS / 3PM / STL', risk: true },
  { rank: 143, name: 'Al Horford', positions: 'PF, C', note: '3PM / BLK / low TO' },
  { rank: 144, name: 'Jaime Jaquez Jr.', positions: 'SF, PF', note: 'PTS / REB / AST' },
  { rank: 145, name: 'Bobby Portis', positions: 'PF, C', note: 'REB / 3PM / FG%' },
  { rank: 146, name: 'Darius Bazley', positions: 'PF, C', note: 'REB / BLK / upside' },
  { rank: 147, name: 'Kyshawn George', positions: 'SG, SF', note: '3PM / AST / upside' },
  { rank: 148, name: 'Aaron Bradshaw', positions: 'C', note: 'BLK / REB / upside', risk: true },
  { rank: 149, name: 'Kelly Oubre Jr.', positions: 'SF, PF', note: 'PTS / STL / REB' },
  { rank: 150, name: 'Dillon Brooks', positions: 'SG, SF', note: '3PM / STL / PTS' },
  { rank: 151, name: 'Ace Bailey', positions: 'SF, PF', note: 'PTS / 3PM / upside', risk: true },
  { rank: 152, name: 'Brandin Podziemski', positions: 'PG, SG', note: '3PM / REB / AST' },
  { rank: 153, name: 'Yaxel Lendeborg', positions: 'PF, C', note: 'REB / FG% / upside', risk: true },
  { rank: 154, name: 'Jrue Holiday', positions: 'PG, SG', note: 'AST / STL / low TO' },
  { rank: 155, name: 'Rui Hachimura', positions: 'SF, PF', note: 'FG% / 3PM / REB' },
  { rank: 156, name: 'Tobias Harris', positions: 'SF, PF', note: 'PTS / FG% / REB' },
]

const fullBoardRows: Player[] = [
  { rank: 41, name: 'Tyrese Haliburton', adp: 44.5, positions: 'PG', note: 'AST / 3PM / FT%', risk: true },
  { rank: 42, name: 'Walker Kessler', adp: 45.5, positions: 'C', note: 'REB / BLK / FG%', risk: true },
  { rank: 43, name: 'AJ Green', adp: 46, positions: 'SG', note: '3PM specialist' },
  { rank: 44, name: 'Derrick White', adp: 47, positions: 'PG, SG', note: '3PM / STL / BLK' },
  { rank: 45, name: 'Joel Embiid', adp: 47, positions: 'C', note: 'PTS / REB / FT%', risk: true },
  { rank: 46, name: 'Desmond Bane', adp: 48, positions: 'SG, SF', note: 'PTS / 3PM / AST' },
  { rank: 47, name: 'Franz Wagner', adp: 48, positions: 'SF, PF', note: 'PTS / AST / REB' },
  { rank: 48, name: 'Trey Murphy III', adp: 49, positions: 'SF, PF', note: '3PM / PTS / FT%' },
  { rank: 49, name: 'Ivica Zubac', adp: 52.5, positions: 'C', note: 'REB / FG% / DD' },
  { rank: 50, name: 'Zion Williamson', adp: 55, positions: 'PF', note: 'PTS / FG% / REB', risk: true },
  { rank: 51, name: 'Jaren Jackson Jr.', adp: 56, positions: 'PF, C', note: 'BLK / 3PM / PTS' },
  { rank: 52, name: 'Dyson Daniels', adp: 56.5, positions: 'PG, SG', note: 'STL / AST / REB' },
  { rank: 53, name: 'Kon Knueppel', adp: 56.5, positions: 'SG, SF', note: 'ADP row marked OUT', risk: true },
  { rank: 54, name: 'Lauri Markkanen', adp: 57.5, positions: 'PF, C', note: '3PM / PTS / REB' },
  { rank: 55, name: 'Stephon Castle', adp: 59, positions: 'PG, SG', note: 'STL / AST / REB' },
  { rank: 56, name: 'OG Anunoby', adp: 59.5, positions: 'SF, PF', note: 'STL / 3PM / FG%' },
  { rank: 57, name: 'Michael Porter Jr.', adp: 61, positions: 'SF, PF', note: '3PM / PTS / REB', risk: true },
  { rank: 58, name: 'Tyler Herro', adp: 63.5, positions: 'PG, SG', note: 'PTS / 3PM / FT%' },
  { rank: 59, name: "De'Aaron Fox", adp: 64.5, positions: 'PG', note: 'PTS / AST / STL' },
  { rank: 60, name: 'Darius Garland', adp: 65.5, positions: 'PG', note: 'AST / 3PM / FT%' },
  { rank: 61, name: 'Kyrie Irving', adp: 65.5, positions: 'PG, SG', note: 'PTS / AST / FT%', risk: true },
  { rank: 62, name: 'Julius Randle', adp: 67, positions: 'PF, C', note: 'PTS / REB / AST' },
  { rank: 63, name: 'Onyeka Okongwu', adp: 67.5, positions: 'PF, C', note: 'REB / FG% / BLK' },
  { rank: 64, name: 'Donovan Clingan', adp: 69, positions: 'C', note: 'REB / BLK / FG%' },
  { rank: 65, name: 'Ja Morant', adp: 69, positions: 'PG', note: 'PTS / AST / FT%', risk: true },
  { rank: 66, name: 'Jarrett Allen', adp: 69, positions: 'C', note: 'REB / FG% / DD' },
  { rank: 67, name: 'Mikal Bridges', adp: 69.5, positions: 'SF, PF', note: '3PM / STL / PTS' },
  { rank: 68, name: 'Damian Lillard', adp: 70, positions: 'PG', note: 'PTS / 3PM / FT%', risk: true },
  { rank: 69, name: 'Alex Sarr', adp: 70.5, positions: 'PF, C', note: 'BLK / REB / 3PM' },
  { rank: 70, name: 'Brandon Miller', adp: 72, positions: 'SF, PF', note: 'PTS / 3PM / FT%' },
  { rank: 71, name: 'Brandon Ingram', adp: 72.5, positions: 'SF, PF', note: 'PTS / AST / FT%', risk: true },
  { rank: 72, name: 'Coby White', adp: 73.5, positions: 'PG, SG', note: '3PM / PTS / FT%' },
  { rank: 73, name: 'Jordan Poole', adp: 75, positions: 'PG, SG', note: 'PTS / 3PM / AST' },
  { rank: 74, name: 'Rudy Gobert', adp: 75, positions: 'C', note: 'REB / FG% / BLK' },
  { rank: 75, name: 'Keyonte George', adp: 76, positions: 'PG, SG', note: 'AST / 3PM / PTS' },
  { rank: 76, name: 'Naz Reid', adp: 76.5, positions: 'PF, C', note: '3PM / REB / BLK' },
  { rank: 77, name: 'Brook Lopez', adp: 77, positions: 'C', note: 'BLK / 3PM / FG%' },
  { rank: 78, name: 'Josh Hart', adp: 81, positions: 'SG, SF', note: 'REB / AST / STL' },
  { rank: 79, name: 'Nickeil Alexander-Walker', adp: 81, positions: 'SG, SF', note: '3PM / STL / FT%' },
  { rank: 80, name: 'Jaden McDaniels', adp: 83, positions: 'SF, PF', note: 'STL / 3PM / FG%' },
  { rank: 81, name: 'VJ Edgecombe', adp: 83.5, positions: 'SG, SF', note: 'STL / PTS / REB', risk: true },
  { rank: 82, name: 'Myles Turner', adp: 85, positions: 'C', note: 'BLK / 3PM / FG%' },
  { rank: 83, name: 'Payton Pritchard', adp: 85, positions: 'PG', note: '3PM / AST / FT%' },
  { rank: 84, name: 'Paul George', adp: 86.5, positions: 'SG, SF', note: '3PM / STL / FT%', risk: true },
  { rank: 85, name: 'Matas Buzelis', adp: 87, positions: 'SF, PF', note: '3PM / BLK / REB', risk: true },
  { rank: 86, name: 'Miles Bridges', adp: 87.5, positions: 'SF, PF', note: 'PTS / 3PM / REB' },
  { rank: 87, name: 'AJ Dybantsa', adp: 88, positions: 'SF, PF', note: 'PTS / upside', risk: true },
  { rank: 88, name: 'Adem Bona', adp: 89, positions: 'C', note: 'ADP row marked OUT', risk: true },
  { rank: 89, name: 'Dylan Harper', adp: 89, positions: 'PG, SG', note: 'PTS / AST / REB', risk: true },
  { rank: 90, name: 'Cameron Boozer', adp: 89.5, positions: 'PF', note: 'PTS / REB / AST', risk: true },
  { rank: 91, name: 'Nikola Vucevic', adp: 90.5, positions: 'C', note: 'REB / FG% / DD' },
  { rank: 92, name: 'Jalen Green', adp: 93.5, positions: 'SG', note: 'PTS / 3PM / FT%' },
  { rank: 93, name: 'Luke Kennard', adp: 95, positions: 'SG, SF', note: '3PM / FT% specialist' },
  { rank: 94, name: 'Ryan Rollins', adp: 95.5, positions: 'PG, SG', note: 'AST / STL / 3PM' },
  { rank: 95, name: 'Zach Edey', adp: 97, positions: 'C', note: 'REB / FG% / DD' },
  { rank: 96, name: 'Dejounte Murray', adp: 97.5, positions: 'PG, SG', note: 'AST / STL / REB', risk: true },
  { rank: 97, name: "De'Andre Hunter", adp: 98, positions: 'SF, PF', note: 'ADP row marked OUT', risk: true },
  { rank: 98, name: 'Norman Powell', adp: 98.5, positions: 'SG, SF', note: 'PTS / 3PM / FT%' },
  { rank: 99, name: 'Ausar Thompson', adp: 99, positions: 'SG, SF', note: 'REB / STL / AST' },
  { rank: 100, name: 'T.J. McConnell', adp: 100.5, positions: 'PG', note: 'AST / STL / low TO' },
  { rank: 101, name: 'Andre Drummond', adp: 101, positions: 'C', note: 'REB / FG% / DD' },
  { rank: 102, name: "Kel'el Ware", adp: 101, positions: 'C', note: 'REB / BLK / FG%' },
  { rank: 103, name: 'Allen Graves', adp: 102, positions: 'PF, C', note: 'Lower-confidence market row' },
  { rank: 104, name: "Day'Ron Sharpe", adp: 103, positions: 'C', note: 'REB / FG% / DD', risk: true },
  { rank: 105, name: 'DeMar DeRozan', adp: 103, positions: 'SF, PF', note: 'PTS / FT% / AST' },
  { rank: 106, name: 'Caleb Wilson', adp: 105.5, positions: 'PF, C', note: 'REB / BLK / upside', risk: true },
  { rank: 107, name: 'Moussa Diabate', adp: 106, positions: 'PF, C', note: 'REB / FG% / upside' },
  { rank: 108, name: 'Andrew Wiggins', adp: 106.5, positions: 'SF, PF', note: 'PTS / STL / 3PM' },
  { rank: 109, name: 'Nic Claxton', adp: 107.5, positions: 'C', note: 'ADP row marked OUT', risk: true },
  { rank: 110, name: 'Kristaps Porzingis', adp: 108, positions: 'PF, C', note: 'BLK / 3PM / FT%', risk: true },
  { rank: 111, name: 'CJ McCollum', adp: 112, positions: 'PG, SG', note: 'PTS / 3PM / FT%' },
  { rank: 112, name: 'RJ Barrett', adp: 112, positions: 'SG, SF', note: 'PTS / REB / FT%' },
  { rank: 113, name: 'Mark Williams', adp: 112.5, positions: 'C', note: 'ADP row marked OUT', risk: true },
  { rank: 114, name: 'Darryn Peterson', adp: 113, positions: 'PG, SG', note: 'PTS / AST / upside', risk: true },
  { rank: 115, name: 'Immanuel Quickley', adp: 114, positions: 'PG, SG', note: 'AST / 3PM / FT%' },
  { rank: 116, name: 'Derik Queen', adp: 115.5, positions: 'PF, C', note: 'REB / FG% / DD', risk: true },
  { rank: 117, name: 'Isaiah Hartenstein', adp: 116, positions: 'C', note: 'REB / AST / FG%' },
  { rank: 118, name: 'Daniel Gafford', adp: 119.5, positions: 'C', note: 'FG% / BLK / DD' },
  { rank: 119, name: 'Kevin Porter Jr.', adp: 120, positions: 'PG, SG', note: 'PTS / AST / 3PM' },
  { rank: 120, name: 'Ty Jerome', adp: 120, positions: 'PG, SG', note: 'AST / 3PM / FT%' },
  { rank: 121, name: 'Anfernee Simons', adp: 120.5, positions: 'PG, SG', note: 'PTS / 3PM / FT%' },
  { rank: 122, name: 'Jimmy Butler III', adp: 121.5, positions: 'SF, PF', note: 'ADP row marked OUT', risk: true },
  { rank: 123, name: 'Jabari Smith Jr.', adp: 122, positions: 'PF, C', note: '3PM / REB / BLK' },
  { rank: 124, name: 'Zach LaVine', adp: 123.5, positions: 'SG, SF', note: 'ADP row marked OUT', risk: true },
  { rank: 125, name: 'Aaron Gordon', adp: 125.5, positions: 'SF, PF', note: 'FG% / REB / DD' },
  { rank: 126, name: 'Draymond Green', adp: 125.5, positions: 'PF, C', note: 'AST / STL / BLK' },
  { rank: 127, name: 'Reed Sheppard', adp: 125.5, positions: 'PG, SG', note: '3PM / STL / AST' },
  { rank: 128, name: 'Christian Braun', adp: 126, positions: 'SG, SF', note: 'FG% / REB / STL' },
  { rank: 129, name: 'Jakob Poeltl', adp: 126.5, positions: 'C', note: 'REB / FG% / DD' },
  { rank: 130, name: 'Klay Thompson', adp: 128.5, positions: 'SG, SF', note: '3PM / FT% / PTS' },
  { rank: 131, name: 'Shaedon Sharpe', adp: 128.5, positions: 'SG, SF', note: 'ADP row marked OUT', risk: true },
  { rank: 132, name: 'Jared McCain', adp: 129, positions: 'PG, SG', note: '3PM / FT% / PTS' },
  { rank: 133, name: 'Alex Caruso', adp: 133, positions: 'PG, SG', note: 'STL / low TO / FG%' },
  { rank: 134, name: 'Jalen Suggs', adp: 133, positions: 'PG, SG', note: 'STL / 3PM / AST', risk: true },
  { rank: 135, name: 'John Collins', adp: 134, positions: 'PF, C', note: 'REB / FG% / 3PM' },
  { rank: 136, name: 'Neemias Queta', adp: 135.5, positions: 'C', note: 'REB / FG% / BLK' },
  { rank: 137, name: 'Deandre Ayton', adp: 136, positions: 'C', note: 'REB / FG% / DD', risk: true },
  { rank: 138, name: 'Aday Mara', adp: 139, positions: 'C', note: 'BLK / FG% / upside', risk: true },
  { rank: 139, name: 'Andrew Nembhard', adp: 139.5, positions: 'PG, SG', note: 'AST / STL / low TO' },
  { rank: 140, name: 'Luke Kornet', adp: 139.5, positions: 'C', note: 'FG% / REB / BLK' },
  { rank: 141, name: 'Ayo Dosunmu', adp: 140.5, positions: 'PG, SG', note: 'STL / AST / low TO' },
  { rank: 142, name: 'Devin Vassell', adp: 141, positions: 'SG, SF', note: 'PTS / 3PM / STL', risk: true },
  { rank: 143, name: 'Al Horford', adp: 141.5, positions: 'PF, C', note: '3PM / BLK / low TO' },
  { rank: 144, name: 'Jaime Jaquez Jr.', adp: 142, positions: 'SF, PF', note: 'PTS / REB / AST' },
  { rank: 145, name: 'Bobby Portis Jr.', adp: 142.5, positions: 'PF, C', note: 'REB / 3PM / FG%' },
  { rank: 146, name: 'Darius Acuff Jr.', adp: 143, positions: 'PG', note: 'PTS / AST / upside', risk: true },
  { rank: 147, name: 'Kyshawn George', adp: 144, positions: 'SG, SF', note: '3PM / AST / upside', risk: true },
  { rank: 148, name: 'Aaron Wiggins', adp: 144.5, positions: 'SG, SF', note: '3PM / STL / low TO' },
  { rank: 149, name: 'Kelly Oubre Jr.', adp: 144.5, positions: 'SF, PF', note: 'PTS / STL / REB' },
  { rank: 150, name: 'Dillon Brooks', adp: 145.5, positions: 'SG, SF', note: '3PM / STL / PTS' },
  { rank: 151, name: 'Ace Bailey', adp: 147, positions: 'SF, PF', note: 'PTS / 3PM / upside', risk: true },
  { rank: 152, name: 'Brandin Podziemski', adp: 149, positions: 'PG, SG', note: '3PM / REB / AST' },
  { rank: 153, name: 'Yaxel Lendeborg', adp: 149, positions: 'PF, C', note: 'REB / FG% / upside', risk: true },
  { rank: 154, name: 'Jrue Holiday', adp: 149.5, positions: 'PG, SG', note: 'AST / STL / low TO' },
  { rank: 155, name: 'Rui Hachimura', adp: 149.5, positions: 'SF, PF', note: 'FG% / 3PM / REB' },
  { rank: 156, name: 'Tobias Harris', adp: 150, positions: 'SF, PF', note: 'PTS / FG% / REB' },
]

const cats = ['PTS', 'REB', 'AST', '3PM', 'STL', 'BLK', 'FG%', 'FT%', 'TO', 'DD', 'TD']
const slots = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL', 'UTIL', 'UTIL', 'BENCH', 'BENCH', 'BENCH']

function load(key: string): string[] { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
function nextPickForSnake(overall: number, slot: number) {
  for (let candidate = overall + 1; candidate <= 156; candidate++) {
    const round = Math.floor((candidate - 1) / 12) + 1
    const roundSlot = round % 2 === 1 ? ((candidate - 1) % 12) + 1 : 12 - ((candidate - 1) % 12)
    if (roundSlot === slot) return candidate
  }
  return null
}

export default function Home() {
  const [drafted, setDrafted] = useState<string[]>([])
  const [myPicks, setMyPicks] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [strategy, setStrategy] = useState<Strategy>('Balanced')
  const [draftPosition, setDraftPosition] = useState('6')
  const [leagueId, setLeagueId] = useState('')
  const [espnS2, setEspnS2] = useState('')
  const [espnSwid, setEspnSwid] = useState('')
  const [round, setRound] = useState('1')
  const [pick, setPick] = useState('1')
  const [status, setStatus] = useState('Checking ESPN configuration…')
  const [syncReady, setSyncReady] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [syncSource, setSyncSource] = useState('Manual fallback')

  useEffect(() => { setDrafted(load('nba-drafted')); setMyPicks(load('nba-my-picks')) }, [])
  useEffect(() => {
    fetch('/api/espn?view=status', { cache: 'no-store' }).then(r => r.json()).then(data => {
      setSyncReady(Boolean(data.leagueConfigured && data.privateCookiesConfigured))
      setStatus(data.privateCookiesConfigured ? 'ESPN private sync ready' : data.leagueConfigured ? 'ESPN public sync ready' : 'Manual mode - add league ID')
    }).catch(() => setStatus('Manual mode - ESPN unavailable'))
  }, [])
  useEffect(() => { localStorage.setItem('nba-drafted', JSON.stringify(drafted)); localStorage.setItem('nba-my-picks', JSON.stringify(myPicks)) }, [drafted, myPicks])

  const board = useMemo(() => [...players.filter(p => p.rank <= 40), ...fullBoardRows], [])
  const available = useMemo(() => board.filter(p => !drafted.includes(p.name) && p.name.toLowerCase().includes(search.toLowerCase())), [board, drafted, search])
  const nextPick = nextPickForSnake(Number(pick), Number(draftPosition))
  const rosterNeeds = slots.filter((slot, i) => !myPicks[i] && ['PG', 'SG', 'SF', 'PF', 'C'].includes(slot))
  const categoryNeeds = cats.filter(category => !myPicks.some(name => {
    const player = board.find(item => item.name === name)
    return player && profileForPlayer(player)[category as keyof ReturnType<typeof profileForPlayer>]
  })) as import('./lib/recommendations').Category[]
  const recommendations = recommendPlayers({ available, roster: { names: myPicks, needs: rosterNeeds, categoryNeeds }, strategy }).map(result => ({ ...result.player, reasons: result.reasons }))

  const addPick = (player: Player, mine: boolean) => {
    setDrafted(v => v.includes(player.name) ? v : [...v, player.name])
    if (mine) setMyPicks(v => v.includes(player.name) ? v : [...v, player.name])
    setStatus(`${player.name} logged${mine ? ' to your roster' : ''}`)
  }
  const undo = () => { const last = drafted[drafted.length - 1]; if (!last) return; setDrafted(drafted.slice(0, -1)); setMyPicks(myPicks.filter(x => x !== last)); setStatus(`Undid ${last}`) }
  const syncEspn = async () => {
    setSyncing(true)
    try {
      const response = espnS2 || espnSwid
        ? await fetch('/api/espn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leagueId, espnS2, espnSwid }) })
        : await fetch(`/api/espn?view=draft${leagueId ? `&leagueId=${encodeURIComponent(leagueId)}` : ''}`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ESPN sync failed')
      const names = Array.isArray(data.playerNames) ? data.playerNames.filter(Boolean) : []
      setDrafted(previous => Array.from(new Set([...previous, ...names])))
      setLastSyncAt(data.fetchedAt || new Date().toISOString())
      setSyncSource('ESPN')
      setStatus(`ESPN synced · ${names.length} drafted picks`)
    } catch (error) {
      setStatus(`${error instanceof Error ? error.message : 'ESPN sync failed'} · manual mode`)
    } finally { setSyncing(false) }
  }

  useEffect(() => {
    if (!syncReady) return
    const timer = window.setInterval(() => { void syncEspn() }, 30000)
    return () => window.clearInterval(timer)
  }, [syncReady, leagueId, espnS2, espnSwid])

  return <main>
    <header className="topbar"><div><span className="eyebrow">OCT 11 / 2026-27</span><h1>Draft Companion</h1><nav><a href="/home">Home</a><a href="/">Draft Assistant</a></nav></div><div className="connection"><span className="dot" /> {status}<small>{syncReady ? `ESPN polling · last ${lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : 'not yet'}` : 'Manual fallback available'}</small></div></header>
    <section className="hero"><div><p className="eyebrow">LIVE DRAFT WORKSPACE</p><h2>Make the next pick with a clear board.</h2><p className="muted">Real ADP board loaded from your draft-board PDF. ESPN sync is server-side and optional; manual entry remains available when credentials or league state are unavailable.</p></div><div className="controls"><label>League ID <input value={leagueId} onChange={e=>setLeagueId(e.target.value)} placeholder="e.g. 123456789" inputMode="numeric" /></label><label>Draft slot <select value={draftPosition} onChange={e => setDraftPosition(e.target.value)}>{Array.from({length:12},(_,i)=><option key={i}>{i+1}</option>)}</select></label><label>Round <input value={round} onChange={e=>setRound(e.target.value)} type="number" min="1" max="13" /></label><label>Pick <input value={pick} onChange={e=>setPick(e.target.value)} type="number" min="1" max="156" /></label><button onClick={syncEspn} disabled={syncing}>{syncing ? 'Syncing…' : 'Sync ESPN'}</button></div></section>
    <details className="private"><summary>Private ESPN sync credentials</summary><p>Optional local-only inputs. They are held in memory and sent only to this local server during sync; they are not saved to the browser.</p><label>ESPN S2 <input type="password" value={espnS2} onChange={e=>setEspnS2(e.target.value)} autoComplete="off" /></label><label>ESPN SWID <input type="password" value={espnSwid} onChange={e=>setEspnSwid(e.target.value)} autoComplete="off" /></label></details>
    <div className="stats"><div><span>YOUR PICKS</span><strong>{myPicks.length} / 13</strong></div><div><span>PLAYERS LOGGED</span><strong>{drafted.length}</strong></div><div><span>NEXT PICK / SNAKE</span><strong>{nextPick || '—'}</strong></div><div><span>DATA FRESHNESS</span><strong className="amber">{syncSource}</strong></div></div>
    <div className="layout"><section className="panel board"><div className="panelhead"><div><p className="eyebrow">PLAYER BOARD</p><h3>Available now</h3></div><input className="search" placeholder="Search player" value={search} onChange={e=>setSearch(e.target.value)} /></div><div className="boardhead"><span>RANK</span><span>PLAYER</span><span>PROFILE</span><span>ACTION</span></div>{available.map(p=><div className="player" key={p.name}><b>{String(p.rank).padStart(2,'0')}</b><div><strong>{p.name}</strong><small>{p.positions || 'ESPN eligibility pending'} · ADP {p.adp ?? p.rank}{p.risk ? ' · risk flag' : ''}</small></div><span className="profile">{p.note || 'ADP row · projections pending'}</span><div className="actions"><button onClick={()=>addPick(p,true)}>My pick</button><button className="ghost" onClick={()=>addPick(p,false)}>Log drafted</button></div></div>)}{available.length===0 && <div className="empty">No available player matches this search.</div>}</section>
      <aside className="side"><section className="panel"><div className="panelhead"><div><p className="eyebrow">RECOMMENDATIONS</p><h3>For pick {pick}</h3></div></div><div className="strategy">{(['Balanced','DD/TD-heavy','Opportunistic punt'] as Strategy[]).map(s=><button key={s} className={strategy===s?'selected':''} onClick={()=>setStrategy(s)}>{s}</button>)}</div>{recommendations.map((p,i)=><div className="recommend" key={`${p.rank}-${p.name}`}><div className="rank">{i+1}</div><div><strong>{p.name}</strong><small>ADP {p.adp ?? p.rank} · {p.positions || 'ESPN eligibility pending'}</small><p>{p.note || 'ADP row · projections pending'}. {p.reasons?.join('; ') || 'Uses rank and roster context.'}</p></div></div>)}</section>
      <section className="panel"><p className="eyebrow">YOUR ROSTER</p><h3>Slots & category lens</h3><div className="slots">{slots.map((slot,i)=><div key={i}><span>{slot}</span><b>{myPicks[i] || 'Open'}</b></div>)}</div><div className="categorygrid">{cats.map(c=><span key={c}>{c}<b>—</b></span>)}</div><p className="footnote">Category totals are intentionally blank until projections or player stats are connected. Percentages must be volume-weighted; TO is negative.</p></section></aside></div>
    <footer><span>Source: your 2026-27 draft-board PDF · ADP is a timing reference, not a projection.</span><button onClick={undo}>Undo last log</button><button className="danger" onClick={()=>{setDrafted([]);setMyPicks([]);setStatus('Board cleared')}}>Clear board</button></footer>
  </main>
}
