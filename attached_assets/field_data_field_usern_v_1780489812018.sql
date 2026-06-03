-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Hoszt: localhost
-- Létrehozás ideje: 2026. Jún 03. 14:30
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
-- Tábla szerkezet ehhez a táblához `field_data_field_usern_v`
--

CREATE TABLE IF NOT EXISTS `field_data_field_usern_v` (
  `entity_type` varchar(128) NOT NULL DEFAULT '' COMMENT 'The entity type this data is attached to',
  `bundle` varchar(128) NOT NULL DEFAULT '' COMMENT 'The field instance bundle to which this row belongs, used when deleting a field instance',
  `deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'A boolean indicating whether this data item has been deleted',
  `entity_id` int(10) unsigned NOT NULL COMMENT 'The entity id this data is attached to',
  `revision_id` int(10) unsigned DEFAULT NULL COMMENT 'The entity revision id this data is attached to, or NULL if the entity type is not versioned',
  `language` varchar(32) NOT NULL DEFAULT '' COMMENT 'The language for this data item.',
  `delta` int(10) unsigned NOT NULL COMMENT 'The sequence number for this data item, used for multi-value fields',
  `field_usern_v_uid` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`entity_type`,`entity_id`,`deleted`,`delta`,`language`),
  KEY `entity_type` (`entity_type`),
  KEY `bundle` (`bundle`),
  KEY `deleted` (`deleted`),
  KEY `entity_id` (`entity_id`),
  KEY `revision_id` (`revision_id`),
  KEY `language` (`language`),
  KEY `field_usern_v_uid` (`field_usern_v_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Data storage for field 7 (field_usern_v)';

--
-- A tábla adatainak kiíratása `field_data_field_usern_v`
--

INSERT INTO `field_data_field_usern_v` (`entity_type`, `bundle`, `deleted`, `entity_id`, `revision_id`, `language`, `delta`, `field_usern_v_uid`) VALUES
('node', 'orvosok', 0, 6, 6, 'und', 0, 19),
('node', 'orvosok', 0, 7, 7, 'und', 0, 5),
('node', 'orvosok', 0, 8, 8, 'und', 0, 4),
('node', 'orvosok', 0, 9, 9, 'und', 0, 7),
('node', 'orvosok', 0, 10, 10, 'und', 0, 8),
('node', 'orvosok', 0, 11, 11, 'und', 0, 9),
('node', 'orvosok', 0, 12, 12, 'und', 0, 10),
('node', 'orvosok', 0, 13, 13, 'und', 0, 11),
('node', 'orvosok', 0, 14, 14, 'und', 0, 12),
('node', 'orvosok', 0, 15, 15, 'und', 0, 13),
('node', 'orvosok', 0, 16, 16, 'und', 0, 14),
('node', 'orvosok', 0, 17, 17, 'und', 0, 15),
('node', 'orvosok', 0, 18, 18, 'und', 0, 16),
('node', 'orvosok', 0, 19, 19, 'und', 0, 17),
('node', 'orvosok', 0, 20, 20, 'und', 0, 18),
('node', 'orvosok', 0, 21, 21, 'und', 0, 6),
('node', 'orvosok', 0, 27, 27, 'und', 0, 24),
('node', 'orvosok', 0, 29, 29, 'und', 0, 30),
('node', 'orvosok', 0, 30, 30, 'und', 0, 31),
('node', 'orvosok', 0, 34, 34, 'und', 0, 33),
('node', 'orvosok', 0, 35, 35, 'und', 0, 34),
('node', 'orvosok', 0, 41, 41, 'und', 0, 36),
('node', 'orvosok', 0, 42, 42, 'und', 0, 38),
('node', 'orvosok', 0, 44, 44, 'und', 0, 71),
('node', 'orvosok', 0, 49, 49, 'und', 0, 42),
('node', 'orvosok', 0, 50, 50, 'und', 0, 43),
('node', 'orvosok', 0, 51, 51, 'und', 0, 62),
('node', 'orvosok', 0, 53, 53, 'und', 0, 72),
('node', 'orvosok', 0, 54, 54, 'und', 0, 139),
('node', 'orvosok', 0, 59, 59, 'und', 0, 1),
('node', 'orvosok', 0, 65, 65, 'und', 0, 40),
('node', 'orvosok', 0, 69, 69, 'und', 0, 68),
('node', 'orvosok', 0, 75, 75, 'und', 0, 69),
('node', 'orvosok', 0, 79, 79, 'und', 0, 73),
('node', 'orvosok', 0, 80, 80, 'und', 0, 70),
('node', 'orvosok', 0, 95, 95, 'und', 0, 74),
('node', 'orvosok', 0, 97, 97, 'und', 0, 75),
('node', 'orvosok', 0, 109, 109, 'und', 0, 78),
('node', 'orvosok', 0, 110, 110, 'und', 0, 110),
('node', 'orvosok', 0, 114, 114, 'und', 0, 79),
('node', 'orvosok', 0, 116, 116, 'und', 0, 107),
('node', 'orvosok', 0, 117, 117, 'und', 0, 81),
('node', 'orvosok', 0, 118, 118, 'und', 0, 80),
('node', 'orvosok', 0, 121, 121, 'und', 0, 83),
('node', 'orvosok', 0, 122, 122, 'und', 0, 67),
('node', 'orvosok', 0, 123, 123, 'und', 0, 23),
('node', 'orvosok', 0, 169, 169, 'und', 0, 85),
('node', 'orvosok', 0, 170, 170, 'und', 0, 86),
('node', 'orvosok', 0, 171, 171, 'und', 0, 88),
('node', 'orvosok', 0, 172, 172, 'und', 0, 89),
('node', 'orvosok', 0, 173, 173, 'und', 0, 90),
('node', 'orvosok', 0, 174, 174, 'und', 0, 91),
('node', 'orvosok', 0, 175, 175, 'und', 0, 92),
('node', 'orvosok', 0, 176, 176, 'und', 0, 93),
('node', 'orvosok', 0, 177, 177, 'und', 0, 94),
('node', 'orvosok', 0, 178, 178, 'und', 0, 95),
('node', 'orvosok', 0, 179, 179, 'und', 0, 96),
('node', 'orvosok', 0, 180, 180, 'und', 0, 97),
('node', 'orvosok', 0, 181, 181, 'und', 0, 98),
('node', 'orvosok', 0, 182, 182, 'und', 0, 99),
('node', 'orvosok', 0, 183, 183, 'und', 0, 100),
('node', 'orvosok', 0, 217, 217, 'und', 0, 109),
('node', 'orvosok', 0, 218, 218, 'und', 0, 108),
('node', 'orvosok', 0, 226, 226, 'und', 0, 114),
('node', 'orvosok', 0, 231, 231, 'und', 0, 115),
('node', 'orvosok', 0, 238, 238, 'und', 0, 117),
('node', 'orvosok', 0, 239, 239, 'und', 0, 119),
('node', 'orvosok', 0, 240, 240, 'und', 0, 120),
('node', 'orvosok', 0, 245, 245, 'und', 0, 123),
('node', 'orvosok', 0, 248, 248, 'und', 0, 125),
('node', 'orvosok', 0, 249, 249, 'und', 0, 124),
('node', 'orvosok', 0, 250, 250, 'und', 0, 140),
('node', 'orvosok', 0, 251, 251, 'und', 0, 128),
('node', 'orvosok', 0, 252, 252, 'und', 0, 138),
('node', 'orvosok', 0, 254, 254, 'und', 0, 63),
('node', 'orvosok', 0, 255, 255, 'und', 0, 134),
('node', 'orvosok', 0, 256, 256, 'und', 0, 83),
('node', 'orvosok', 0, 257, 257, 'und', 0, 147),
('node', 'orvosok', 0, 259, 259, 'und', 0, 148),
('node', 'orvosok', 0, 260, 260, 'und', 0, 148),
('node', 'orvosok', 0, 261, 261, 'und', 0, 149),
('node', 'orvosok', 0, 264, 264, 'und', 0, 151),
('node', 'orvosok', 0, 274, 274, 'und', 0, 152),
('node', 'orvosok', 0, 275, 275, 'und', 0, 157),
('node', 'orvosok', 0, 276, 276, 'und', 0, 154),
('node', 'orvosok', 0, 277, 277, 'und', 0, 153),
('node', 'orvosok', 0, 279, 279, 'und', 0, 22),
('node', 'orvosok', 0, 284, 284, 'und', 0, 158),
('node', 'orvosok', 0, 286, 286, 'und', 0, 159),
('node', 'orvosok', 0, 292, 292, 'und', 0, 161);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
