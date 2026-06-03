-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Hoszt: localhost
-- Létrehozás ideje: 2026. Jún 03. 14:14
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
-- Tábla szerkezet ehhez a táblához `field_revision_field_oszt_ly`
--

CREATE TABLE IF NOT EXISTS `field_revision_field_oszt_ly` (
  `entity_type` varchar(128) NOT NULL DEFAULT '' COMMENT 'The entity type this data is attached to',
  `bundle` varchar(128) NOT NULL DEFAULT '' COMMENT 'The field instance bundle to which this row belongs, used when deleting a field instance',
  `deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'A boolean indicating whether this data item has been deleted',
  `entity_id` int(10) unsigned NOT NULL COMMENT 'The entity id this data is attached to',
  `revision_id` int(10) unsigned NOT NULL COMMENT 'The entity revision id this data is attached to',
  `language` varchar(32) NOT NULL DEFAULT '' COMMENT 'The language for this data item.',
  `delta` int(10) unsigned NOT NULL COMMENT 'The sequence number for this data item, used for multi-value fields',
  `field_oszt_ly_nid` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`entity_type`,`entity_id`,`revision_id`,`deleted`,`delta`,`language`),
  KEY `entity_type` (`entity_type`),
  KEY `bundle` (`bundle`),
  KEY `deleted` (`deleted`),
  KEY `entity_id` (`entity_id`),
  KEY `revision_id` (`revision_id`),
  KEY `language` (`language`),
  KEY `field_oszt_ly_nid` (`field_oszt_ly_nid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Revision archive storage for field 10 (field_oszt_ly)';

--
-- A tábla adatainak kiíratása `field_revision_field_oszt_ly`
--

INSERT INTO `field_revision_field_oszt_ly` (`entity_type`, `bundle`, `deleted`, `entity_id`, `revision_id`, `language`, `delta`, `field_oszt_ly_nid`) VALUES
('node', 'orvosok', 0, 6, 6, 'und', 0, 23),
('node', 'orvosok', 0, 7, 7, 'und', 0, 23),
('node', 'orvosok', 0, 8, 8, 'und', 0, 23),
('node', 'orvosok', 0, 9, 9, 'und', 0, 23),
('node', 'orvosok', 0, 10, 10, 'und', 0, 23),
('node', 'orvosok', 0, 11, 11, 'und', 0, 23),
('node', 'orvosok', 0, 12, 12, 'und', 0, 23),
('node', 'orvosok', 0, 13, 13, 'und', 0, 23),
('node', 'orvosok', 0, 14, 14, 'und', 0, 23),
('node', 'orvosok', 0, 15, 15, 'und', 0, 23),
('node', 'orvosok', 0, 16, 16, 'und', 0, 23),
('node', 'orvosok', 0, 17, 17, 'und', 0, 23),
('node', 'orvosok', 0, 18, 18, 'und', 0, 23),
('node', 'orvosok', 0, 19, 19, 'und', 0, 23),
('node', 'orvosok', 0, 20, 20, 'und', 0, 23),
('node', 'orvosok', 0, 21, 21, 'und', 0, 23),
('node', 'orvosok', 0, 27, 27, 'und', 0, 23),
('node', 'orvosok', 0, 29, 29, 'und', 0, 23),
('node', 'orvosok', 0, 30, 30, 'und', 0, 23),
('node', 'orvosok', 0, 34, 34, 'und', 0, 24),
('node', 'orvosok', 0, 35, 35, 'und', 0, 24),
('node', 'orvosok', 0, 41, 41, 'und', 0, 23),
('node', 'orvosok', 0, 42, 42, 'und', 0, 24),
('node', 'orvosok', 0, 43, 43, 'und', 0, 24),
('node', 'orvosok', 0, 44, 44, 'und', 0, 24),
('node', 'orvosok', 0, 45, 45, 'und', 0, 24),
('node', 'orvosok', 0, 46, 46, 'und', 0, 24),
('node', 'orvosok', 0, 47, 47, 'und', 0, 24),
('node', 'orvosok', 0, 48, 48, 'und', 0, 24),
('node', 'orvosok', 0, 49, 49, 'und', 0, 24),
('node', 'orvosok', 0, 50, 50, 'und', 0, 24),
('node', 'orvosok', 0, 51, 51, 'und', 0, 24),
('node', 'orvosok', 0, 52, 52, 'und', 0, 24),
('node', 'orvosok', 0, 53, 53, 'und', 0, 24),
('node', 'orvosok', 0, 54, 54, 'und', 0, 24),
('node', 'orvosok', 0, 55, 55, 'und', 0, 24),
('node', 'orvosok', 0, 56, 56, 'und', 0, 24),
('node', 'orvosok', 0, 57, 57, 'und', 0, 24),
('node', 'orvosok', 0, 58, 58, 'und', 0, 24),
('node', 'orvosok', 0, 59, 59, 'und', 0, 24),
('node', 'orvosok', 0, 61, 61, 'und', 0, 24),
('node', 'orvosok', 0, 62, 62, 'und', 0, 24),
('node', 'orvosok', 0, 63, 63, 'und', 0, 23),
('node', 'orvosok', 0, 64, 64, 'und', 0, 24),
('node', 'orvosok', 0, 65, 65, 'und', 0, 23),
('node', 'orvosok', 0, 67, 67, 'und', 0, 24),
('node', 'orvosok', 0, 68, 68, 'und', 0, 24),
('node', 'orvosok', 0, 69, 69, 'und', 0, 23),
('node', 'orvosok', 0, 70, 70, 'und', 0, 23),
('node', 'orvosok', 0, 72, 72, 'und', 0, 24),
('node', 'orvosok', 0, 73, 73, 'und', 0, 24),
('node', 'orvosok', 0, 74, 74, 'und', 0, 24),
('node', 'orvosok', 0, 75, 75, 'und', 0, 23),
('node', 'orvosok', 0, 79, 79, 'und', 0, 24),
('node', 'orvosok', 0, 80, 80, 'und', 0, 23),
('node', 'orvosok', 0, 81, 81, 'und', 0, 24),
('node', 'orvosok', 0, 82, 82, 'und', 0, 24),
('node', 'orvosok', 0, 83, 83, 'und', 0, 24),
('node', 'orvosok', 0, 84, 84, 'und', 0, 24),
('node', 'orvosok', 0, 86, 86, 'und', 0, 24),
('node', 'orvosok', 0, 87, 87, 'und', 0, 24),
('node', 'orvosok', 0, 90, 90, 'und', 0, 24),
('node', 'orvosok', 0, 91, 91, 'und', 0, 24),
('node', 'orvosok', 0, 92, 92, 'und', 0, 24),
('node', 'orvosok', 0, 93, 93, 'und', 0, 24),
('node', 'orvosok', 0, 94, 94, 'und', 0, 24),
('node', 'orvosok', 0, 95, 95, 'und', 0, 24),
('node', 'orvosok', 0, 97, 97, 'und', 0, 23),
('node', 'orvosok', 0, 98, 98, 'und', 0, 23),
('node', 'orvosok', 0, 99, 99, 'und', 0, 24),
('node', 'orvosok', 0, 100, 100, 'und', 0, 24),
('node', 'orvosok', 0, 101, 101, 'und', 0, 24),
('node', 'orvosok', 0, 102, 102, 'und', 0, 24),
('node', 'orvosok', 0, 103, 103, 'und', 0, 24),
('node', 'orvosok', 0, 106, 106, 'und', 0, 24),
('node', 'orvosok', 0, 107, 107, 'und', 0, 24),
('node', 'orvosok', 0, 109, 109, 'und', 0, 23),
('node', 'orvosok', 0, 110, 110, 'und', 0, 24),
('node', 'orvosok', 0, 111, 111, 'und', 0, 24),
('node', 'orvosok', 0, 113, 113, 'und', 0, 24),
('node', 'orvosok', 0, 114, 114, 'und', 0, 23),
('node', 'orvosok', 0, 115, 115, 'und', 0, 24),
('node', 'orvosok', 0, 116, 116, 'und', 0, 24),
('node', 'orvosok', 0, 117, 117, 'und', 0, 24),
('node', 'orvosok', 0, 118, 118, 'und', 0, 23),
('node', 'orvosok', 0, 119, 119, 'und', 0, 24),
('node', 'orvosok', 0, 121, 121, 'und', 0, 120),
('node', 'orvosok', 0, 122, 122, 'und', 0, 24),
('node', 'orvosok', 0, 123, 123, 'und', 0, 23),
('node', 'orvosok', 0, 169, 169, 'und', 0, 120),
('node', 'orvosok', 0, 170, 170, 'und', 0, 120),
('node', 'orvosok', 0, 171, 171, 'und', 0, 120),
('node', 'orvosok', 0, 172, 172, 'und', 0, 120),
('node', 'orvosok', 0, 173, 173, 'und', 0, 120),
('node', 'orvosok', 0, 174, 174, 'und', 0, 120),
('node', 'orvosok', 0, 175, 175, 'und', 0, 120),
('node', 'orvosok', 0, 176, 176, 'und', 0, 120),
('node', 'orvosok', 0, 177, 177, 'und', 0, 120),
('node', 'orvosok', 0, 178, 178, 'und', 0, 120),
('node', 'orvosok', 0, 179, 179, 'und', 0, 120),
('node', 'orvosok', 0, 180, 180, 'und', 0, 120),
('node', 'orvosok', 0, 181, 181, 'und', 0, 120),
('node', 'orvosok', 0, 182, 182, 'und', 0, 120),
('node', 'orvosok', 0, 183, 183, 'und', 0, 120),
('node', 'orvosok', 0, 214, 214, 'und', 0, 24),
('node', 'orvosok', 0, 217, 217, 'und', 0, 23),
('node', 'orvosok', 0, 218, 218, 'und', 0, 23),
('node', 'orvosok', 0, 219, 219, 'und', 0, 24),
('node', 'orvosok', 0, 220, 220, 'und', 0, 24),
('node', 'orvosok', 0, 225, 225, 'und', 0, 24),
('node', 'orvosok', 0, 226, 226, 'und', 0, 120),
('node', 'orvosok', 0, 231, 231, 'und', 0, 23),
('node', 'orvosok', 0, 232, 232, 'und', 0, 24),
('node', 'orvosok', 0, 233, 233, 'und', 0, 24),
('node', 'orvosok', 0, 237, 237, 'und', 0, 24),
('node', 'orvosok', 0, 238, 238, 'und', 0, 24),
('node', 'orvosok', 0, 239, 239, 'und', 0, 120),
('node', 'orvosok', 0, 240, 240, 'und', 0, 120),
('node', 'orvosok', 0, 241, 241, 'und', 0, 23),
('node', 'orvosok', 0, 245, 245, 'und', 0, 23),
('node', 'orvosok', 0, 246, 246, 'und', 0, 24),
('node', 'orvosok', 0, 248, 248, 'und', 0, 120),
('node', 'orvosok', 0, 249, 249, 'und', 0, 120),
('node', 'orvosok', 0, 250, 250, 'und', 0, 24),
('node', 'orvosok', 0, 251, 251, 'und', 0, 120),
('node', 'orvosok', 0, 252, 252, 'und', 0, 24),
('node', 'orvosok', 0, 254, 254, 'und', 0, 24),
('node', 'orvosok', 0, 255, 255, 'und', 0, 120),
('node', 'orvosok', 0, 256, 256, 'und', 0, 120),
('node', 'orvosok', 0, 257, 257, 'und', 0, 23),
('node', 'orvosok', 0, 259, 259, 'und', 0, 24),
('node', 'orvosok', 0, 260, 260, 'und', 0, 24),
('node', 'orvosok', 0, 261, 261, 'und', 0, 23),
('node', 'orvosok', 0, 263, 263, 'und', 0, 24),
('node', 'orvosok', 0, 264, 264, 'und', 0, 23),
('node', 'orvosok', 0, 274, 274, 'und', 0, 24),
('node', 'orvosok', 0, 275, 275, 'und', 0, 24),
('node', 'orvosok', 0, 276, 276, 'und', 0, 24),
('node', 'orvosok', 0, 277, 277, 'und', 0, 24),
('node', 'orvosok', 0, 278, 278, 'und', 0, 24),
('node', 'orvosok', 0, 279, 279, 'und', 0, 23),
('node', 'orvosok', 0, 280, 280, 'und', 0, 24),
('node', 'orvosok', 0, 284, 284, 'und', 0, 23),
('node', 'orvosok', 0, 285, 285, 'und', 0, 24),
('node', 'orvosok', 0, 286, 286, 'und', 0, 24),
('node', 'orvosok', 0, 287, 287, 'und', 0, 24),
('node', 'orvosok', 0, 288, 288, 'und', 0, 24),
('node', 'orvosok', 0, 289, 289, 'und', 0, 24),
('node', 'orvosok', 0, 290, 290, 'und', 0, 24),
('node', 'orvosok', 0, 291, 291, 'und', 0, 24),
('node', 'orvosok', 0, 292, 292, 'und', 0, 24),
('node', 'orvosok', 0, 293, 293, 'und', 0, 24);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
