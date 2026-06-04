-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Hoszt: localhost
-- Létrehozás ideje: 2026. Jún 04. 12:47
-- Szerver verzió: 5.6.33-0ubuntu0.14.04.1
-- PHP verzió: 5.5.9-1ubuntu4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Adatbázis: `muteti_main`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'Primary Key: Unique user ID.',
  `name` varchar(60) NOT NULL DEFAULT '' COMMENT 'Unique user name.',
  `pass` varchar(128) NOT NULL DEFAULT '' COMMENT 'User’s password (hashed).',
  `mail` varchar(254) DEFAULT '' COMMENT 'User’s e-mail address.',
  `theme` varchar(255) NOT NULL DEFAULT '' COMMENT 'User’s default theme.',
  `signature` varchar(255) NOT NULL DEFAULT '' COMMENT 'User’s signature.',
  `signature_format` varchar(255) DEFAULT NULL COMMENT 'The filter_format.format of the signature.',
  `created` int(11) NOT NULL DEFAULT '0' COMMENT 'Timestamp for when user was created.',
  `access` int(11) NOT NULL DEFAULT '0' COMMENT 'Timestamp for previous time user accessed the site.',
  `login` int(11) NOT NULL DEFAULT '0' COMMENT 'Timestamp for user’s last login.',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'Whether the user is active(1) or blocked(0).',
  `timezone` varchar(32) DEFAULT NULL COMMENT 'User’s time zone.',
  `language` varchar(12) NOT NULL DEFAULT '' COMMENT 'User’s default language.',
  `picture` int(11) NOT NULL DEFAULT '0' COMMENT 'Foreign key: file_managed.fid of user’s picture.',
  `init` varchar(254) DEFAULT '' COMMENT 'E-mail address used for initial account creation.',
  `data` longblob COMMENT 'A serialized array of name value pairs that are related to the user. Any form values posted during user edit are stored and are loaded into the $user object during user_load(). Use of this field is discouraged and it will likely disappear in a future...',
  `changed` int(11) NOT NULL DEFAULT '0' COMMENT 'Timestamp for when user was changed.',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `name` (`name`),
  KEY `access` (`access`),
  KEY `created` (`created`),
  KEY `mail` (`mail`),
  KEY `picture` (`picture`),
  KEY `changed` (`changed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Stores user data.';

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`uid`, `name`, `pass`, `mail`, `theme`, `signature`, `signature_format`, `created`, `access`, `login`, `status`, `timezone`, `language`, `picture`, `init`, `data`, `changed`) VALUES
(0, '', '', '', '', '', NULL, 0, 0, 0, 0, NULL, '', 0, '', NULL, 0),
(1, 'jz', '$S$D17Uju2C5GaFGjGrQLbRjr/m9Ln8AKflSF3zXkb0jzZuWWKbx2MK', 'zojuhasz@gmail.com', '', '', 'filtered_html', 1361887866, 1780490994, 1780475658, 1, 'Europe/Paris', 'hu', 0, 'zojuhasz@gmail.com', 0x623a303b, 1667550918),
(3, 'tothzee', '$S$Dn6P2I.Oj0ZBWowoN6FH3tHvccRodUDEjFyQ8ojePemaZ0p/UZwJ', 'toothzee@honlapstart.com', '', '', 'filtered_html', 1362138612, 1780567802, 1780557953, 1, 'Europe/Paris', 'hu', 0, 'toothzee@honlapstart.com', 0x613a313a7b733a373a226f7665726c6179223b693a313b7d, 1362138612),
(4, 'apaczelt', '$S$DN5XacFGh0/k/YMvQsl/Va3LDAcE3AQNUHAiyiB9cuKZKKEZmZPW', 'zoli@uzsoki.hu', '', '', 'filtered_html', 1363960788, 1780566911, 1780245318, 1, 'Europe/Paris', 'hu', 0, 'zoli@uzsoki.hu', 0x623a303b, 1728995476),
(5, 'banyaib', '$S$D6bawxDMQqrK5Ld.Q0yrark3qZNeuIKqC/lcw1j/O/CgSerVQJzs', 'barna@honlapstart.com', '', '', 'filtered_html', 1364215914, 1375106082, 1375106082, 0, 'Europe/Paris', 'hu', 0, 'barna@honlapstart.com', 0x623a303b, 1364215914),
(6, 'vargaj', '$S$D1dz7AtTqA8ro1XmHgb/Ercg3rUBsZ8.CPZ..Yap1HnI40wDRSXT', 'vargakibo@gmail.com', '', '', 'plain_text', 1364232443, 1505193519, 1505193519, 0, 'Europe/Paris', 'hu', 0, 'vargakibo@gmail.com', 0x623a303b, 1732715964),
(7, 'sara', '$S$D2NOGzvp.BNqZ/UJvPpDSFKQQ1oykaZ1QUn9EJD4e65gS3XLvvyg', 'sara@honlapstart.com', '', '', 'filtered_html', 1364284139, 1506343499, 1506343499, 0, 'Europe/Paris', 'hu', 0, 'sara@honlapstart.com', 0x623a303b, 1364284139),
(8, 'kocsisj', '$S$DVoQq5s0enmqcdYx0L41riXJrRAhIV1WkhMspbgT/mhhaX6ebOqB', 'kocsisj@honlapstart.com', '', '', 'filtered_html', 1364284216, 1598540203, 1598369686, 0, 'Europe/Paris', 'hu', 0, 'kocsisj@honlapstart.com', 0x623a303b, 1364284216),
(9, 'zolcsak', '$S$D8kuYSgkVW5.DkRRe2A43MGm.znCoRmUYkSo.dJ.lyhtLeyeRanM', 'zolcsak@uzsoki.hu', '', '', 'filtered_html', 1364284255, 1780565777, 1780564822, 1, 'Europe/Paris', 'hu', 0, 'zolcsak@honlapstart.com', 0x623a303b, 1364284255),
(10, 'kardos', '$S$DzyFoiidK/e5Gne214wX6.BHXqE4GgxuXQC/x1XGMBIVC/gdO3vE', 'kardos@honlapstart.com', '', '', 'filtered_html', 1364284299, 1780568077, 1780498689, 1, 'Europe/Paris', 'hu', 0, 'kardos@honlapstart.com', 0x623a303b, 1732716048),
(11, 'nagya', '$S$D3mzvgN2N34W3RGEC6Q7o/KvH6NYeL7aYH8gW3Z1U7cbet45.3Vy', 'nagya@honlapstart.com', '', '', 'filtered_html', 1364284370, 0, 0, 1, 'Europe/Paris', 'hu', 0, 'nagya@honlapstart.com', NULL, 1364284370),
(12, 'lengyel', '$S$DRNATgvhn.PHsKA8RnWcDQWDWCZNC6PFC8a5DPOSQ3dzqd85qpr6', 'lengyel@honlapstart.com', '', '', 'filtered_html', 1364284471, 0, 0, 1, 'Europe/Paris', 'hu', 0, 'lengyel@honlapstart.com', NULL, 1364284471),
(13, 'hatar', '$S$D/Lx7acdpIA3N7tbIJH59PP1kNqOFVXLgNZWbQdSMFQv0PVWyxYF', 'hatar@honlapstart.com', '', '', 'filtered_html', 1364284523, 0, 0, 1, 'Europe/Paris', 'hu', 0, 'hatar@honlapstart.com', 0x623a303b, 1364284523),
(14, 'gyorffy', '$S$DppzL72/F4LL1dVlFQCH94Bp49ufXhmfnXXnGrnV017KKTx66.Kr', 'gyorffy@honlapstart.com', '', '', 'filtered_html', 1364284590, 0, 0, 0, 'Europe/Paris', 'hu', 0, 'gyorffy@honlapstart.com', 0x623a303b, 1364284590),
(15, 'hoque', '$S$DcbRk1lF.zw3piuJYU942yUUmp5m1CHqEZnvtAKu8APuR0QsvgiF', 'hoque@elojegyzes.hu', '', '', 'filtered_html', 1364284639, 1583229684, 1583229684, 1, 'Europe/Paris', 'hu', 0, 'hoque@honlapstart.com', 0x623a303b, 1364284639),
(16, 'almasi', '$S$DRLCO2XmcH.0tIB/uh.pKcQHM5636GV2nUwbfMAiOOjaa7WU8hlY', 'almasi@honlapstart.com', '', '', 'filtered_html', 1364284696, 1490282220, 1490281959, 1, 'Europe/Paris', 'hu', 0, 'almasi@honlapstart.com', 0x623a303b, 1364284696),
(17, 'szabo', '$S$DcTJj//CRiDlKqpiTQMH0JM2PApoj1WBaGg8xJRALOZMGkoZwZfx', 'szabo@honlapstart.com', '', '', 'filtered_html', 1364284723, 1375390744, 1375390744, 0, 'Europe/Paris', 'hu', 0, 'szabo@honlapstart.com', 0x623a303b, 1364284723),
(18, 'communis', '$S$DpKrFUeHL4c77pBcssCW0.dprk2s5CivOE3.38sII6YBpzDFuYc4', 'communis@honlapstart.com', '', '', 'filtered_html', 1364303442, 0, 0, 1, 'Europe/Paris', 'hu', 0, 'communis@honlapstart.com', NULL, 1364303442),
(19, 'tothzo', '$S$DZDlK39prLtK4JmGZjNlGC09x1gFCNHCuQa3xZI4IFw4KJjBxgUi', 'tothzee@gmail.com', '', '', 'filtered_html', 1366629736, 1780550941, 1780469754, 1, 'Europe/Paris', 'hu', 0, 'tothzee@gmail.com', 0x623a303b, 1366629736),
(22, 'zojuhasz', '$S$DDIXpn2EVQTJcTThxIUVTblYrb5k9uFgoEW9b7dc0ir6H9j59OkV', 'hotinform@freemail.hu', '', '', 'plain_text', 1370594202, 1778587575, 1778569782, 1, 'Europe/Paris', 'hu', 0, 'hotinform@freemail.hu', 0x623a303b, 1370594202),
(23, 'zoli', '$S$DZjdugrmDWIHxZU0sIoBlLOXoDFPpQAYWeEDNlpFygR4CTLfuP0T', 'juhaszzoltan@freemail.hu', '', '', 'plain_text', 1370594368, 1523003689, 1522848150, 0, 'Europe/Paris', 'hu', 0, 'juhaszzoltan@freemail.hu', 0x623a303b, 1370594368),
(24, 'TVK', '$S$DBpyJ.JELsZ8J3LjzsUB9lnwrmuikoTJywLXTyLxbbQJkCqKWqXR', 'pezsmap@gmail.com', '', '', 'filtered_html', 1379760603, 0, 0, 1, 'Europe/Paris', 'hu', 0, 'pezsmap@gmail.com', NULL, 1379760603),
(30, 'kun.ulla', '$S$DnNu5tvYVdrUahz07HnyOA6Tpl1PYU.sC9C4D7ymR/nRYMsGp0LZ', 'kun.ulla@honlapstart.com', '', '', 'filtered_html', 1382614713, 0, 0, 0, 'Europe/Paris', 'hu', 0, 'kun.ulla@honlapstart.com', 0x623a303b, 1382614713),
(31, 'matus.peter', '$S$Dtf85KNQZ7hylkfB7Oc63mldaLl.BZw0l5KZ0ql.nW8tF0y4CWTG', 'matus.peter@honlapstart.com', '', '', 'filtered_html', 1382614912, 0, 0, 1, 'Europe/Paris', 'hu', 0, 'matus.peter@honlapstart.com', NULL, 1382614912),
(32, 'GGabi', '$S$D2kLdEvriMJAcmhm6ZTHrxvzoqGs8dMQfW78nZInVTnligvuqqAM', 'ggabi@muteti.hu', '', '', 'filtered_html', 1392738155, 1780567104, 1780566637, 1, 'Europe/Paris', 'hu', 0, 'galamb.gabi1@uzsoki.hu', 0x623a303b, 1672928332),
(33, 'MersichT', '$S$Dt41q5O9XxueRnu9EvRwYuIoBy.Up/hisvamfrfciHYfW/nGAs3/', 'mersich1@uzsoki.hu', '', '', 'filtered_html', 1393192283, 1412063721, 1411977214, 0, 'Europe/Paris', 'hu', 0, 'mersich1@uzsoki.hu', 0x623a303b, 1393192283),
(34, 'DedeK', '$S$DC6AcXpuMmNCOg4bSuDjzyG5diiD.D7CuDwjoC5Ir6KzQyVxzfCi', 'dede.kristof@uzsoki.hu', '', '', 'filtered_html', 1393192541, 1780569922, 1780480433, 1, 'Europe/Budapest', 'hu', 0, 'dede1@uzsoki.hu', 0x623a303b, 1736509639),
(36, 'sziroma', '$S$Dcds69mR6aV9B/yKOfEdmSjSiqJAk8r.PfzcSVcHbND3EquaJqxE', 'sziroma1@uzsoki.hu', '', '', 'filtered_html', 1393615094, 0, 0, 0, 'Europe/Paris', 'hu', 0, 'sziroma1@uzsoki.hu', 0x623a303b, 1732715868),
(37, 'orvos', '$S$DpdZswWo1AnhxwCxTZ2TbUTugHpu0a/Hg9qsczUIVN2MMF0tIbiS', 'orvos@honlapstart.com', '', '', 'filtered_html', 1395401256, 1780548840, 1780470813, 1, 'Europe/Paris', 'hu', 0, 'orvos@honlapstart.com', 0x623a303b, 1673715016),
(38, 'bursics', '$S$DBcCBeHnKkRDDaXJWzYLQk3fmu15oIzFxkriUmXH90XBz71MfPwZ', 'abursics@gmail.com', '', '', 'filtered_html', 1395668040, 1780548602, 1780548602, 1, 'Europe/Paris', 'hu', 0, 'abursics@gmail.com', 0x623a303b, 1673715374),
(39, 'muto', '$S$DMx7dhOF5hUPPqPjJMn76.OKLmfRwO0AjJtgjYXt.RIANwKuAPMP', 'muto@honlapstart.com', '', '', 'filtered_html', 1396868328, 1780562305, 1780562117, 1, 'Europe/Paris', 'hu', 0, 'muto@honlapstart.com', 0x623a303b, 1673715039),
(40, 'FukaszA', '$S$D/cG1P4gtFI1CvviB/VTD7VAVU8D9puCiL4pnCVl95L4tea36mCZ', 'fukasza@honlapstart.com', '', '', 'filtered_html', 1397639802, 0, 0, 0, 'Europe/Paris', 'hu', 0, 'fukasza@honlapstart.com', 0x623a303b, 1397639802),
(42, 'PappG', '$S$DB5YCi8aplc66.Tza9whyzDWrcZksZHwbxCAZQtNaZs.sc0BrbPB', 'papp.geza@uzsoki.hu', '', '', 'filtered_html', 1412064569, 1780561520, 1780494987, 1, 'Europe/Paris', 'hu', 0, 'papp.geza@uzsoki.hu', 0x623a303b, 1774597699),
(43, 'BesznyakI', '$S$D/6Z1JqwZorpg82wAxqqk3bTrLAax558wymLUaX6WzBZvg.QCIG5', 'besznyak.istvan@uzsoki.hu', '', '', 'filtered_html', 1412064707, 1771244020, 1771244020, 0, 'Europe/Paris', 'hu', 0, 'besznyak.istvan@uzsoki.hu', 0x623a303b, 1772617377),
(44, 'urolmuto', '$S$DVONvw6kyBto0U2Jmf7FnQtYf1zM8sfE4mP6Ocoq15foB55fqp3t', 'urolmuto@tippmix.com', '', '', 'filtered_html', 1413621764, 1416820556, 1416820701, 1, 'Europe/Paris', 'hu', 0, 'urolmuto@tippmix.com', 0x623a303b, 1413621764),
(45, 'hatardr', '$S$DlU99Mqb0JS7ifJvsit0A4.tZ7ucHy8xM2vPnzrqOnwpNLKQuWPJ', 'hatar@muteti.hu', '', '', 'filtered_html', 1445414928, 1490101062, 1490101062, 0, 'Europe/Paris', 'hu', 0, 'hatar@muteti.hu', 0x623a303b, 1725622537),
(46, 'koszegi', '$S$DOcty1VLdHVAEvQGqDcLaNJTbx0sW7iD2O9XlvszxIIgtwsPnRHP', 'jz@uzsoki.hu', '', '', 'filtered_html', 1445884866, 1534577805, 1534577805, 0, 'Europe/Paris', 'hu', 0, 'koszegi@muteti.hu', 0x623a303b, 1725622296),
(61, 'iblang', '$S$DpjHXCPebasnrR7iYfbOkF6KZqSXRbFxU.E.g4Ij.k77mrwImh1T', 'iblang@uzsoki.hu', '', '', 'filtered_html', 1447142033, 1461507716, 1461507716, 0, 'Europe/Paris', 'hu', 0, 'iblang@uzsoki.hu', 0x623a303b, 1725622278),
(62, 'svastics', '$S$DF3eMUZM/jX6A3BcJcV/onyGbYdruPznG23ESCLoLpYg5SA1YwPu', 'svasticsimre@gmail.com', '', '', 'filtered_html', 1447147908, 1780569432, 1780543627, 1, 'Europe/Paris', 'hu', 0, 'svasticsimre@gmail.com', 0x623a303b, 1673609014),
(63, 'szabo.balazs', '$S$D5KHRYTaX9Q4cVY96AhNOLQDCVDghHlhUsIH/09bkHo4Dy80oneo', 'szabo.balazs@uzsoki.hu', '', '', 'filtered_html', 1447932596, 1780569405, 1780565078, 1, 'Europe/Paris', 'hu', 0, 'szabo.balazs@uzsoki.hu', 0x623a303b, 1673609095),
(64, 'saftics', '$S$DUy//d1vQ4KZNCL7uo5ndZWHhbV8ElgRs.lP8W43hnBCN1JshldI', 'saftics@gmail.com', '', '', 'filtered_html', 1448359144, 1780560481, 1780228305, 1, 'Europe/Paris', 'hu', 0, 'saftics@gmail.com', 0x623a303b, 1673607801),
(65, 'drnagyp', '$S$D7Arb9DrviW2I7s05lRdqNqKa6sAPTNDpI7Ehjbuo3m4gQ73MSn8', 'drnagyp@uzsoki.hu', '', '', 'filtered_html', 1448882948, 1458464462, 1458389033, 0, 'Europe/Paris', 'hu', 0, 'drnagyp@uzsoki.hu', 0x623a303b, 1725622245),
(66, 'zojuhasz1', '$S$DpJs7VJeAFOiuLQdqFCmtcLrE24uprqP83Eq8E3Jq6BOz6.G/Ca7', 'zojuhasz@freemail.hu', '', '', 'filtered_html', 1452674370, 1530086646, 1530085862, 1, 'Europe/Paris', 'hu', 0, 'zojuhasz@freemail.hu', 0x623a303b, 1452674370),
(67, 'porneczi', '$S$DOYaAy.wsHKeXrxTyYWuTtbPw2NASH0mVcjeV6j/8JtGBpGHIB0q', 'porneczi@uzsoki.hu', '', '', 'filtered_html', 1453795030, 1780567941, 1780303861, 1, 'Europe/Paris', 'hu', 0, 'porneczi@uzsoki.hu', 0x623a303b, 1673608454),
(68, 'farkas.tamas', '$S$D1Cy.HcrIrGNZq2QlXkryWnXfp/woJ2XfkIQxmqGMWtqSfFN0KrN', 'farkas.tamas@uzsoki.hu', '', '', 'filtered_html', 1453813902, 1780554207, 1780295908, 1, 'Europe/Paris', 'hu', 0, 'farkas.tamas@uzsoki.hu', 0x623a303b, 1453813902),
(69, 'csutakmagdi', '$S$DrGzSPKHG2WfAHSwpmgouZJSlE1UeklZvbZ45F5kkYecY0d1WIIo', 'csutakm@yahoo.co.uk', '', '', 'filtered_html', 1454403262, 1484036061, 1484036061, 0, 'Europe/Paris', 'hu', 0, 'csutakm@yahoo.co.uk', 0x623a303b, 1454403262),
(70, 'tothli', '$S$DdVoLEpIMhPA8dnJi52089Kp2RaG.bObV70khlXCEZHgIY9i1CSG', 'tothli79@gmail.com', '', '', 'filtered_html', 1454403318, 1572865056, 1572861330, 0, 'Europe/Paris', 'hu', 0, 'tothli79@gmail.com', 0x623a303b, 1454403318),
(71, 'fekete.andras', '$S$DLcJHTA7mpGQ474J4WJiFcVzPiG9c/.XoRC0Z31oZ5aA7UleP9IF', 'fekete.andras@uzsoki.hu', '', '', 'filtered_html', 1454504493, 1780567088, 1780511324, 1, 'Europe/Paris', 'hu', 0, 'fekete.andras@uzsoki.hu', 0x623a303b, 1673609406),
(72, 'egyed', '$S$Detfy6OXtcJ.RTA9WTwuNfpuTcx3FumfL7Fny8oJGZZPVSt5.NoU', 'egyed.tamas@uzsoki.hu', '', '', 'filtered_html', 1459848750, 1780423836, 1780423836, 1, 'Europe/Paris', 'hu', 0, 'egyed.tamas@uzsoki.hu', 0x623a303b, 1673620464),
(73, 'tolgyes', '$S$Dx9hcQMBfUdhyU/UTvcwRrI1MozCmJpSgj7j0l.BiAV8aAFeujsT', 'tolgyes.tamas@uzsoki.hu', '', '', 'filtered_html', 1459848870, 1780553032, 1780478664, 1, 'Europe/Paris', 'hu', 0, 'tolgyes.tamas@uzsoki.hu', 0x623a303b, 1672928859),
(74, 'kecskedibence', '$S$DYoouK/xDbVqywOR4gLmB.h7Mn6NzFugfEnZLox8SH1u2T.3s7ed', 'kecskedi@yahoo.com', '', '', 'filtered_html', 1464948830, 1780553385, 1779808715, 1, 'Europe/Paris', 'hu', 0, 'kecskedi@yahoo.com', 0x623a303b, 1672928589),
(75, 'csako.bence', '$S$DzMzsgetabE6g5FRCpntpmIp8m7s.Ga4ReDz5mL35gDHwhL3ajBm', 'csako.bence@uzsoki.hu', '', '', 'filtered_html', 1475824085, 1505452732, 1505452732, 0, 'Europe/Paris', 'hu', 0, 'csako.bence@uzsoki.hu', 0x623a303b, 1732715883),
(78, 'stella', '$S$DkATgmxJM9Rov/mF66gapBzwK84YPwgvmvG70XopzSGAWcmu97nr', 'stella@uzsoki.hu', '', '', 'filtered_html', 1504267496, 1556528647, 1556528647, 0, 'Europe/Paris', 'hu', 0, 'stella@uzsoki.hu', 0x623a303b, 1504267496),
(79, 'TordeAkos', '$S$DDsxU1FmwYfT2r60nxTym9PjiyNJb0ZDVjIUJxjqFBwoSK/HC4by', 'torde.akos@uzsoki.hu', '', '', 'filtered_html', 1507108048, 1780557646, 1780465223, 1, 'Europe/Budapest', 'hu', 0, 'torde.akos@uzsoki.hu', 0x623a303b, 1732716063),
(80, 'SzaboDenes', '$S$DP.1HHlJjJk04CrsX14lIn8qlf67BQHq0NBkzn8A/86u/pqxoj8r', 'noreply@uzsoki.hu', '', '', 'filtered_html', 1516269915, 1780559884, 1780472013, 1, 'Europe/Paris', 'hu', 0, 'noreply@uzsoki.hu', 0x623a303b, 1516269915),
(81, 'SzilagyiIstvan', '$S$DxiibA0q/sF1wDQgDpx2arSGy1xCzMJGNU7CTcsnlrpQBDvxQq7M', 'szilistvan@gmail.com', '', '', 'filtered_html', 1516783466, 1780553074, 1780238315, 1, 'Europe/Paris', 'hu', 3, 'szilistvan@gmail.com', 0x623a303b, 1677489023),
(82, 'urolteszt', '$S$D1rzrZZNpBXOHZaDM1UbXotuCtU6iwSFfVV.l4z4pV3n0idE.IeN', 'sddfsfd@sdfsf.hu', '', '', 'filtered_html', 1517998409, 1518534942, 1518534991, 1, 'Europe/Paris', 'hu', 0, 'sddfsfd@sdfsf.hu', 0x623a303b, 1517998409),
(83, 'puskas.gabi', '$S$DgKqvY7i/BFYAYoy4kUE/63IS1O34xNwUKeadeB1xklpHggRjpXr', 'puskas.gabi@uzsoki.hu', '', '', 'filtered_html', 1520856730, 1694964503, 1694964621, 1, 'Europe/Paris', 'hu', 0, 'puskas.gabi@uzsoki.hu', 0x623a303b, 1694964575),
(84, 'ZoliSeb', '$S$D6KRFHh1TwLyD0OLXQwz/LMjwN9G.MXqiVsnwSZKHtx4lPS.eIDq', 'sdfsdfvs@dfsdf.hu', '', '', 'filtered_html', 1522767674, 1522767683, 1522767683, 1, 'Europe/Paris', 'hu', 0, 'sdfsdfvs@dfsdf.hu', NULL, 1522767674),
(85, 'patyanik', '$S$DckIQSWJA.nIurPyguJWkoXWDStbpcLo3Rwj4DcwVKH9qi6U4CkZ', 'patyanik@uzsoki.hu', '', '', 'filtered_html', 1523255401, 1780556558, 1780293972, 1, 'Europe/Paris', 'hu', 0, 'patyanik@uzsoki.hu', 0x623a303b, 1730717852),
(86, 'patonay', '$S$D4YjQJirJecccyxSdibeKYdZQxY.oVYxMKgz793f9MmhV0DD7CwU', 'patonay@uzsoki.hu', '', '', 'filtered_html', 1523255752, 1583917294, 1583745967, 1, 'Europe/Paris', 'hu', 0, 'patonay@uzsoki.hu', 0x623a303b, 1523255752),
(88, 'landherr', '$S$Dtz4of0R5UEuczQNGKlvipvaIjRb5QIzCnqzXlAB4igSsMujhCHf', 'landherr@uzsoki.hu', '', '', 'filtered_html', 1526286154, 1685428511, 1685428236, 1, 'Europe/Paris', 'hu', 0, 'landherr@uzsoki.hu', 0x623a303b, 1526286154),
(89, 'nemeskeri.csaba', '$S$DoeJnyZksm4RBztRq5Bc5EUekekQrDQPh9ZUNP3r7IOJq5LMCX6G', 'nemeskeri.csaba@uzsoki.hu', '', '', 'filtered_html', 1526286233, 1780479227, 1780475404, 1, 'Europe/Paris', 'hu', 0, 'nemeskeri.csaba@uzsoki.hu', 0x623a303b, 1526286233),
(90, 'naszaly', '$S$DtNimbBSFDn6Dv6e0edAUOKbrOfqeXlDGEH/a3IOUKdzLanalKDF', 'naszaly@uzsoki.hu', '', '', 'filtered_html', 1526286325, 0, 0, 1, 'Europe/Paris', 'hu', 0, 'naszaly@uzsoki.hu', NULL, 1526286325),
(91, 'beganyi', '$S$D1G8tq8AlvIa1SyJTnbdCeB/1ux/QRmqAUatt34MS20ifXCgIE.V', 'beganyi@uzsoki.hu', '', '', 'filtered_html', 1526286428, 1780565026, 1780565026, 1, 'Europe/Paris', 'hu', 0, 'begany@uzsoki.hu', 0x623a303b, 1666332043),
(92, 'drpoti.zs', '$S$D2ssFxaoUfwYd3AhbZ7e9dDJVyQD9wMSp7PJjs5aUSeRwf4ROEiK', 'drpoti.zs@uzsoki.hu', '', '', 'filtered_html', 1526286512, 1780556780, 1780549868, 1, 'Europe/Paris', 'hu', 0, 'drpoti.zs@uzsoki.hu', 0x623a303b, 1721884692),
(93, 'meszaros.edina', '$S$DiTWj9l.hiLihaRnDjHulpw2iGzYEWuwX092aw.EHoeVLS0/WMi7', 'meszaros.edina@uzsoki.hu', '', '', 'filtered_html', 1526286593, 1780567300, 1780297626, 1, 'Europe/Paris', 'hu', 0, 'meszaros.edina@uzsoki.hu', 0x623a303b, 1526286593),
(94, 'farkas.robert', '$S$Dr7WBlBHSMW38QdgWfcRN/7bIpTluXt6mvFjJDC0Lld1FvbTKdsn', 'farkas.robert@uzsoki.hu', '', '', 'filtered_html', 1526286653, 1780485919, 1780293104, 1, 'Europe/Paris', 'hu', 0, 'farkas.robert@uzsoki.hu', 0x623a303b, 1526286653),
(95, 'katona.csilla', '$S$DIFfLkmY6R8T9NRs0uyE2oBTytip93fo7TTtuY0YLKIsXqtx2N0l', 'katona.csilla@uzsoki.hu', '', '', 'filtered_html', 1526286715, 1780569851, 1780297099, 1, 'Europe/Paris', 'hu', 0, 'katona.csilla@uzsoki.hu', 0x623a303b, 1753252002),
(96, 'klinko', '$S$Df3ed2O/kRn3oFbHGh5.U9mxeosmBif.CqWklhQyN4YbLkIIl35M', 'klinko@uzsoki.hu', '', '', 'filtered_html', 1526286773, 1780560400, 1780296652, 1, 'Europe/Paris', 'hu', 0, 'klinko@uzsoki.hu', 0x623a303b, 1724747289),
(97, 'bucsics', '$S$D0fF2vbZ4fizkTMUafSburRoGmWHMZwfzqfe22uQIMpFsKyOiftC', 'bucsics@uzsoki.hu', '', '', 'filtered_html', 1526286826, 1738657605, 1738657605, 0, 'Europe/Paris', 'hu', 0, 'bucsics@uzsoki.hu', 0x623a303b, 1738657792),
(98, 'sinko.daniel', '$S$Df2TX6MvtoSeojlyiwdTDtdCnZsVOj0qRaLePHvZZyvlRDeZNGOd', 'sinko.danil@uzsoki.hu', '', '', 'filtered_html', 1526286895, 1779773182, 1779773182, 1, 'Europe/Paris', 'hu', 0, 'sinko.danil@uzsoki.hu', 0x623a303b, 1526286895),
(99, 'plavecz.eva', '$S$DonkNNFQCkfT0OxCYG6cioVA6mxJ4f1oce6vMEqDTAA5iAm7rfrP', 'plavecz.eva@uzsoki.hu', '', '', 'filtered_html', 1526286992, 1780561032, 1780392130, 1, 'Europe/Paris', 'hu', 0, 'plavecz.eva@uzsoki.hu', 0x623a303b, 1672832278),
(100, 'vass.nandor', '$S$DxLMn9fn9XQel2G3x0FCkAYJARSFqbF4/H0nGgYWLMhDhbZdqC4h', 'vass.nandor@uzsoki.hu', '', '', 'filtered_html', 1526287054, 1528190136, 1528189950, 0, 'Europe/Paris', 'hu', 0, 'vass.nandor@uzsoki.hu', 0x623a303b, 1526287054),
(101, 'cato', '$S$DiSNE2kLKB4PUutBJk0uVvT0yWpU.w2uOXqL5e2ok71jQKFdaHiK', 'cato@uzsoki.hu', '', '', 'filtered_html', 1527148717, 1527150959, 1527149540, 1, 'Europe/Paris', 'hu', 0, 'cato@uzsoki.hu', NULL, 1527148717),
(102, 'kraszits.istvan', '$S$D4696lUqALwQYJYV6H/54Rtd2h2xa4D72QFIY/DkH4BcG1.2DHa9', 'kraszits.istvan@uzsoki.hu', '', '', 'filtered_html', 1527149313, 1570627378, 1570627378, 1, 'Europe/Paris', 'hu', 0, 'kraszits.istvan@uzsoki.hu', NULL, 1527149313),
(103, 'erdei.eniko', '$S$D3qktpN5e2HsKk3eXZkFyhz4HyGVxoBur4isgZB0h8RoNqERUMyg', 'erdei.eniko@uzsoki.hu', '', '', 'filtered_html', 1527151180, 1780401336, 1780308894, 1, 'Europe/Paris', 'hu', 2, 'erdei.eniko@uzsoki.hu', 0x623a303b, 1677579386),
(104, 'szabo.vivien', '$S$DUb/1Z8Rd6y3bKC/inOOLq2Vki/AJ2UnKuLijcjptyDbhqKv400.', 'szabo.vivien@uzsoki.hu', '', '', 'filtered_html', 1527248863, 1780559747, 1780559747, 1, 'Europe/Paris', 'hu', 0, 'szabo.vivien@uzsoki.hu', NULL, 1527248863),
(105, 'kun.viktor', '$S$DILmwzuCgWtHeXfWv7XGsA4.heY5PSn8oqT6WktKDRfNjqrL7VD/', 'kun.viktor@uzsoki.hu', '', '', 'filtered_html', 1527249006, 1527249027, 1527249027, 1, 'Europe/Paris', 'hu', 0, 'kun.viktor@uzsoki.hu', NULL, 1527249006),
(106, 'zoju', '$S$De4laJ56LslSt0Rx3M.tfA1I0ZQHIYt/QnQzBmqnhC54u3ZrQH7w', 'zojuh@gmail.com', '', '', 'filtered_html', 1530086808, 1530097346, 1530097346, 1, 'Europe/Paris', 'hu', 0, 'zojuh@gmail.com', 0x623a303b, 1530086808),
(107, 'zavori', '$S$DCf5aB1C7chn1DrV5z.Xt5vomvw8VbNRJRRVkdGzzHiPw4wlEmJc', 'zavori@uzsoki.hu', '', '', 'filtered_html', 1533540758, 1780391693, 1779728496, 1, 'Europe/Paris', 'hu', 0, 'zavori@uzsoki.hu', 0x623a303b, 1673607874),
(108, 'horvath.laszlo', '$S$DnZa0WcizK0IcOnPnI/6yKHnnmjyJbYGyE0TsvKlZto8jfwVk80u', 'holac004@gmail.com', '', '', 'filtered_html', 1534832868, 1780484853, 1780378584, 1, 'Europe/Paris', 'hu', 0, 'holac004@gmail.com', 0x623a303b, 1663656257),
(109, 'veto.zsofia', '$S$DN4RWNzSpyYeedgyMktnmKfFIPyaKOBqbnS0fAQ3nP65ji9WAIYx', 'vetozsofia@gmail.com', '', '', 'filtered_html', 1534833006, 1580378297, 1580371047, 0, 'Europe/Paris', 'hu', 0, 'vetozsofia@gmail.com', 0x623a303b, 1534833006),
(110, 'varga.marton', '$S$DDgvxgRR8BMLcZTmXJqWkymcJU099jx2OzBzNm.NahutFCWIfNVP', 'vmkukac@gmail.com', '', '', 'filtered_html', 1536147624, 1780569670, 1780395167, 1, 'Europe/Paris', 'hu', 0, 'vmkukac@gmail.com', 0x623a303b, 1677488378),
(114, 'drajko.veronika', '$S$DCiX1uXAEQIhSMlZMH1fjtmXiotzgVVilv1BZUhEasNFQlmgaaOm', 'drajko.veronika@uzsoki.hu', '', '', 'filtered_html', 1563539371, 1779963156, 1779866118, 1, 'Europe/Paris', 'hu', 0, 'drajko.veronika@uzsoki.hu', NULL, 1563539371),
(115, 'orosz.daniel', '$S$Da/OS4ESQf/6A3pACG1G4aVyLOi.9tmEQ.nRx2NAnYnij.zEnNs5', 'orosz.daniel@uzsoki.hu', '', '', 'filtered_html', 1567430985, 1780556929, 1780379264, 1, 'Europe/Paris', 'hu', 0, 'orosz.daniel@uzsoki.hu', 0x623a303b, 1741086470),
(116, 'tesztuser', '$S$DbXcyLaI/s2e4xpocvP/oSu5b5HYNBmRAJduNkAMsOfu37yt.w9C', 'tesztuser@uzsoki.hu', '', '', 'filtered_html', 1569479877, 1569484389, 1569484389, 1, 'Europe/Paris', 'hu', 0, 'tesztuser@uzsoki.hu', NULL, 1569479877),
(117, 'para.marton', '$S$D3Y1zS8JxuD4ouAbINYvSd1GBLeCPsMCPHUTZINp1KZldZLV8cOg', 'para.parton@uzsoki.hu', '', '', 'filtered_html', 1582287879, 1780553312, 1779426181, 1, 'Europe/Paris', 'hu', 0, 'para.parton@uzsoki.hu', 0x623a303b, 1673609222),
(119, 'horvath.dorottya', '$S$D5RjRkpOBT8tyG5QjZGNGwlkpVnuIrVmnWVmafaSUXJYK5WMyI4j', 'horvath.dorottya@uzsoki.hu', '', '', 'filtered_html', 1593001005, 1775110379, 1775110379, 1, 'Europe/Paris', 'hu', 0, 'horvath.dorottya@uzsoki.hu', 0x623a303b, 1768915754),
(120, 'futo.ildiko', '$S$DL3meDbTtDkeqaeOennoJYupcMHPEU3VMuXHvsAmluuCsRq/zcHz', 'futo.ildiko@uzsoki.hu', '', '', 'filtered_html', 1593001362, 1777454137, 1777452310, 1, 'Europe/Paris', 'hu', 0, 'futo.ildiko@uzsoki.hu', 0x623a303b, 1745393954),
(121, 'szabobalazs', '$S$DywDo8ERdl7H2iiel7YA/IGz8z3dJjiqsDpK7AM5.Up54iofHvJ9', 'szabobalazs@uzsoki.hu', '', '', 'filtered_html', 1598774253, 1598774384, 1598774384, 0, 'Europe/Paris', 'hu', 0, 'szabobalazs@uzsoki.hu', 0x623a303b, 1598774253),
(123, 'szabob', '$S$Ds1dRhoSX7EeK1diXh//tCaVIk6eeKcRpuXEwnmi/6gp.OmRV3zA', 'szabobalazs2@uzsoki.hu', '', '', 'filtered_html', 1598864973, 1727762868, 1727762868, 0, 'Europe/Paris', 'hu', 0, 'szabobalazs2@uzsoki.hu', 0x623a303b, 1732715922),
(124, 'blastik.marta', '$S$Dn3WFInMJ08j7OgfvFIJ1KQXGjfBkueg7YUECv50TpfSougT7GA8', 'blastik@uzsoki.hu', '', '', 'filtered_html', 1602754964, 1780477718, 1780407721, 1, 'Europe/Paris', 'hu', 0, 'blastik@uzsoki.hu', NULL, 1602754964),
(125, 'deri.szabina', '$S$DslvqbqiMCu0BdFD1VeVPi/WHqBSydIEc3S83CORqsm9L4SI/4kp', 'deri.szabina@uzsoki.hu', '', '', 'filtered_html', 1627290728, 1780387128, 1780301600, 1, 'Europe/Paris', 'hu', 0, 'deri.szabina@uzsoki.hu', NULL, 1627290728),
(126, 'blastik', '$S$DiciFeXvF0y9TGQ97InC1T2H6iX/w55lqS51FbhAjfh.UY9SDk9G', 'blastik.marta@uzsoki.hu', '', '', 'filtered_html', 1629116921, 1629117742, 1629116965, 0, 'Europe/Paris', 'hu', 0, 'blastik.marta@uzsoki.hu', 0x623a303b, 1629116921),
(128, 'zolcsak.zita', '$S$D7fKyQBcAhr13ACAxOezG.AUDLwX0wGMopn/NVosM.CK8M3xfjxu', 'zolcsak.zita@uzsoki.hu', '', '', 'filtered_html', 1637916652, 1757920183, 1757920183, 1, 'Europe/Paris', 'hu', 0, 'zolcsak.zita@uzsoki.hu', 0x623a303b, 1677579129),
(129, 'Urol', '$S$DA0FJtGvH8lvIqd/YMN5LADBIML/38pvVgY5xmImIMocOmWmESg/', 'urol@uzsoki.hu', '', '', 'filtered_html', 1642423826, 1780301436, 1780290055, 1, 'Europe/Paris', 'hu', 0, 'urol@uzsoki.hu', NULL, 1642423826),
(130, 'Magyarmacs', '$S$DIi0eWhf6ZVc5xSwjs0M64x03mEVdIieXMLosJkHYtRvAgoaenaG', 'juhasz.zoltan@uzsoki.hu', '', '', 'filtered_html', 1651666423, 1780567297, 1780306812, 1, 'Europe/Paris', 'hu', 0, 'juhasz.zoltan@uzsoki.hu', 0x623a303b, 1710746525),
(131, 'csajszik', '$S$DaQ5KCm/OA4aq46TpEzOXkygNqTnEd15e9uYFRNuaKcv79rTGET7', 'csajszik@uzsoki.hu', '', '', 'filtered_html', 1657609767, 1780567774, 1780338242, 1, 'Europe/Paris', 'hu', 0, 'csajszik@uzsoki.hu', NULL, 1657609767),
(132, 'jzonko', '$S$DiAFVUYZJpULoEGadSwKIWyt3HqO3.xqF4h9t20ktaTAfNv9RQVd', 'zjonko@uzsoki.hu', '', '', 'filtered_html', 1659959929, 1779436314, 1779181935, 1, 'Europe/Paris', 'hu', 0, 'zjonko@uzsoki.hu', 0x623a303b, 1736849095),
(134, 'bittner', '$S$DWgcVmFmfmTvKg6feNOlLcc2pN4bbb/gexkovihbAnBfqedqaF6Z', 'bittner.nora@uzsoki.hu', '', '', 'filtered_html', 1667550165, 1691996081, 1691996081, 1, 'Europe/Paris', 'hu', 0, 'bittner.nora@uzsoki.hu', NULL, 1667550165),
(135, 'potizs', '$S$DxNEJTdLh.1zA06iyc95XqYBXO4638hcH.h/viJZw4Md.fk4IyzB', 'potizs@uzsoki.hu', '', '', 'filtered_html', 1669276391, 1669363304, 1669276857, 1, 'Europe/Paris', 'hu', 0, 'potizs@uzsoki.hu', NULL, 1669276391),
(136, 'faludi', '$S$Dq821dCKhFpCFt2zVN4ZOzba07zUeQmKyP5mFBU4m.RFBhPmGzde', 'djflasjkf@jfkjflsajf.hu', '', '', 'filtered_html', 1672927713, 0, 0, 0, 'Europe/Paris', 'hu', 0, 'djflasjkf@jfkjflsajf.hu', 0x623a303b, 1725622259),
(137, 'halmy', '$S$DFB05ivzQcIK55aCxUPql17GTIp6nLrsTU1LWFxAx5Xglg1/iAKj', 'jskdjfskdf@sjdfksjfkj.hu', '', '', 'filtered_html', 1672928473, 1780053573, 1779782554, 1, 'Europe/Paris', 'hu', 0, 'jskdjfskdf@sjdfksjfkj.hu', 0x623a303b, 1673609162),
(138, 'horvath.aniko', '$S$DcYC40yilbaKdydA/IHV/Q/C2SlOzdwo.kW0IZ7PGw3M0zzZakWr', 'jkjskjfksajf@hjsfhjashfsjkaf.hu', '', '', 'filtered_html', 1672928541, 1780561405, 1780381079, 1, 'Europe/Paris', 'hu', 0, 'jkjskjfksajf@hjsfhjashfsjkaf.hu', 0x623a303b, 1673615547),
(139, 'mester', '$S$DeMDgt9KDfzNuHdOwnU2SAMzyQZyExsxxxi6wvyI.t.MAZx8XKk3', 'jkasjdfksajf@jjshdfjkhfjkhsk.hu', '', '', 'filtered_html', 1672928626, 1780563470, 1780563201, 1, 'Europe/Paris', 'hu', 0, 'jkasjdfksajf@jjshdfjkhfjkhsk.hu', 0x623a303b, 1673714893),
(140, 'sajtos', '$S$DJU9Y/Oto9sMceOnU0EAFf4epvzplq250UTHzCqY.k2f8Hae.X9S', 'kjsdakfjsafk@jsdkfjskadfjasdkf.hu', '', '', 'filtered_html', 1672928759, 1780569044, 1780566453, 1, 'Europe/Paris', 'hu', 0, 'kjsdakfjsafk@jsdkfjskadfjasdkf.hu', 0x623a303b, 1725614716),
(141, 'feketean', '$S$D3HmEbWylBKc25MetTx/Dosh0qfmU51be7REcA3E5g7OOu6rdJv6', 'lsjdfklsja@lakdjflksjf.hu', '', '', 'filtered_html', 1673446929, 0, 0, 0, 'Europe/Paris', 'hu', 0, 'lsjdfklsja@lakdjflksjf.hu', 0x623a303b, 1673527522),
(143, 'jzseborvos2', '$S$DWOWJXLyVSdm8UYfAkcFAsidt7gjzCeufg4WrI3xdKyF5lHz3hLs', 'lsdflksd@ksjdkfsjkdsf.hu', '', '', 'filtered_html', 1673643633, 1756810778, 1756810778, 1, 'Europe/Paris', 'hu', 0, 'lsdflksd@ksjdkfsjkdsf.hu', 0x623a303b, 1673643880),
(144, 'jzseborvos1', '$S$DEl2HRm9bZ89bdeNAG7g9YY.zD3DTC1LNNw0mioWGTmYKnBs/yp9', 'kjdskfjdsfkdsjkfds@kjkdsfjkdsjfdsf.hu', '', '', 'filtered_html', 1673644433, 1780554517, 1780493578, 1, 'Europe/Paris', 'hu', 0, 'kjdskfjdsfkdsjkfds@kjkdsfjkdsjfdsf.hu', NULL, 1673644433),
(145, 'jzseborvos', '$S$DJbik4B0L.ujhLm68EeD97pDPJvmvgm2nXdxobAv4NFNTrS9.4cJ', 'jhaskahkjhas@askdhakjdha.hu', '', '', 'filtered_html', 1673644475, 1756810765, 1756810765, 1, 'Europe/Paris', 'hu', 0, 'jhaskahkjhas@askdhakjdha.hu', 0x623a303b, 1726484895),
(146, 'jzadmin', '$S$DTOZNrU6PKkah.nq2YloLP/6y2HXQwZiCSVd45o0Q3eGeQcC8XGu', 'jkasdjkajsd@kjaskdjaksdj.kk', '', '', 'filtered_html', 1675158837, 1675159041, 1675159033, 1, 'Europe/Paris', 'hu', 0, 'jkasdjkajsd@kjaskdjaksdj.kk', 0x623a303b, 1675159076),
(147, 'Ruppert', '$S$DIRn4VlX.PjskaM3OLmBp19j/IHaLw8eUm1pHjpdA1UJNB7mFplh', 'ruppert.mate@uzsoki.hu', '', '', 'filtered_html', 1693394444, 1780551897, 1780291001, 1, 'Europe/Paris', 'hu', 0, 'ruppert.mate@uzsoki.hu', NULL, 1693394444),
(148, 'silvas', '$S$DkKuEQPRME1pjETXlD4cCee6cGJlkOip.5iMG7RS4SBrp1ndqXy8', 'silvas.janos@uzsoki.hu', '', '', 'filtered_html', 1694435934, 1780482537, 1779975293, 1, 'Europe/Paris', 'hu', 0, 'silvas.janos@uzsoki.hu', 0x623a303b, 1694436088),
(149, 'szekely.balint', '$S$DaW2GMEaTRL8aAJgys58CDU7zz1U7ch5oj0kSmAwmP9APYNNF7yw', 'szekely.balint@uzsoki.hu', '', '', 'filtered_html', 1704883036, 1780498366, 1780393443, 1, 'Europe/Paris', 'hu', 0, 'szekely.balint@uzsoki.hu', 0x623a303b, 1732631481),
(150, 'gajarszki', '$S$DOGE1MMc3v48cvJF7pdQfhi6c.pg4Dl6Rd53r7RtXIU17pR6vqL3', 'gajarszki@uzsoki.hu', '', '', 'filtered_html', 1706787541, 1780569858, 1780291940, 1, 'Europe/Paris', 'hu', 0, 'gajarszki@uzsoki.hu', 0x623a303b, 1706787770),
(151, 'dorko', '$S$DFSC4.xeZrIMQXZuPEe.WBtEI9154FDNTIdSz4kU63x0YAp8fp3a', 'krisztiandorko@gmail.com', '', '', 'filtered_html', 1707491029, 1780554350, 1780287852, 1, 'Europe/Paris', 'hu', 0, 'krisztiandorko@gmail.com', 0x623a303b, 1707491058),
(152, 'tatai.gabor', '$S$D02ye9dPcV6utvMC1tStwfd19d.4O9vuO/NLaeLT1qaRUQGJS4LD', 'tatai.gabor@uzsoki.hu', '', '', 'filtered_html', 1713422830, 1780568199, 1780383634, 1, 'Europe/Paris', 'hu', 0, 'tatai.gabor@uzsoki.hu', NULL, 1713422830),
(153, 'DedeK2', '$S$DN7SpO93vKwh/fwUhyG/NjD7MzDSyqZPVdfBKMmkyFTIBYoeuPsF', 'ksjdfkjsk@skjskjf.hu', '', '', 'filtered_html', 1725263994, 1725264225, 1725264196, 1, 'Europe/Paris', 'hu', 0, 'ksjdfkjsk@skjskjf.hu', NULL, 1725263994),
(154, 'huszarb', '$S$DLBocHcemJkSoTy278erEMSKdgunyI42cl9ijt7Q8FhNENYkTILY', 'huszar.borbala@uzsoki.hu', '', '', 'filtered_html', 1725610733, 1780568507, 1780520999, 1, 'Europe/Paris', 'hu', 0, 'huszar.borbala@uzsoki.hu', 0x623a303b, 1738143625),
(155, 'jzUrolOrvos', '$S$DVj8synqQbFG81ECWh43JZHgO3oveIZVh9kdyS.4Zszl.PawkCiZ', 'haskfhkjhfclsdfjklj@lkjaskldfjdasf.hu', '', '', 'filtered_html', 1725710920, 1732546913, 1732546913, 1, 'Europe/Paris', 'hu', 0, 'haskfhkjhfclsdfjklj@lkjaskldfjdasf.hu', NULL, 1725710920),
(156, 'jzUrolOrvosBoss', '$S$Dt2qg40ftya8jaNiN6MSZ2lTF7CvkKEFnEqj0THAd2JDxytt5HU2', 'jklajsfljkljfasklf@lkajslfkjsf.hu', '', '', 'filtered_html', 1725722590, 1762424842, 1762424842, 1, 'Europe/Paris', 'hu', 0, 'jklajsfljkljfasklf@lkajslfkjsf.hu', NULL, 1725722590),
(157, 'FozoK', '$S$DDRqZVJXTFZhV4XNdU10iEvPu0aK4FswVFBJpFnagEXd6fSGtsKa', 'fozo.krisztina@uzsoki.hu', '', '', 'filtered_html', 1726485062, 1780568312, 1780486293, 1, 'Europe/Paris', 'hu', 0, 'fozo.krisztina@uzsoki.hu', 0x623a303b, 1737361950),
(158, 'KSzabo', '$S$DSe56Egg5FoXIYnibEnbmt9d9umuPp7oUa21SV6PrU5tvBpPxBCC', 'drkaszabolevente@gmail.com', '', '', 'filtered_html', 1750007475, 1780562996, 1780404037, 1, 'Europe/Paris', 'hu', 0, 'drkaszabolevente@gmail.com', 0x623a303b, 1753074881),
(159, 'Kolostyak', '$S$DCS4kkVzNVH1y0h49Cs0uKLYIyrOPfCEpwU489VPgVmeD3Hfpxc1', 'kolostyak.zsuzsanna@uzsoki.hu', '', '', 'filtered_html', 1757581603, 1772307003, 1771941789, 0, 'Europe/Paris', 'hu', 0, 'kolostyak.zsuzsanna@uzsoki.hu', 0x623a303b, 1772617396),
(160, 'szemlaky', '$S$D.jbtwUeuRkPx.2oUKDVbuF7x02wve2WtCvT9t7.nJWYZVq4GW8w', 'szemlaky.zsofia@uzsoki.hu', '', '', 'filtered_html', 1758092234, 1780563866, 1780396964, 1, 'Europe/Paris', 'hu', 0, 'szemlaky.zsofia@uzsoki.hu', 0x623a303b, 1759215233),
(161, 'BakoBenedek', '$S$DHIoALHdcjjnuLK1srC.VL7m4yo/ZIgEKMGHAa39I0M78vo.0ibF', 'bako.benedek@uzsoki.hu', '', '', 'filtered_html', 1773827261, 1780558208, 1780556018, 1, 'Europe/Paris', 'hu', 0, 'bako.benedek@uzsoki.hu', 0x623a303b, 1773841862);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
