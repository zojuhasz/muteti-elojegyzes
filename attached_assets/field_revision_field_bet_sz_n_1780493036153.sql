-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Hoszt: localhost
-- Létrehozás ideje: 2026. Jún 03. 15:20
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
-- Tábla szerkezet ehhez a táblához `field_revision_field_bet_sz_n`
--

CREATE TABLE IF NOT EXISTS `field_revision_field_bet_sz_n` (
  `entity_type` varchar(128) NOT NULL DEFAULT '' COMMENT 'The entity type this data is attached to',
  `bundle` varchar(128) NOT NULL DEFAULT '' COMMENT 'The field instance bundle to which this row belongs, used when deleting a field instance',
  `deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'A boolean indicating whether this data item has been deleted',
  `entity_id` int(10) unsigned NOT NULL COMMENT 'The entity id this data is attached to',
  `revision_id` int(10) unsigned NOT NULL COMMENT 'The entity revision id this data is attached to',
  `language` varchar(32) NOT NULL DEFAULT '' COMMENT 'The language for this data item.',
  `delta` int(10) unsigned NOT NULL COMMENT 'The sequence number for this data item, used for multi-value fields',
  `field_bet_sz_n_value` varchar(10) DEFAULT NULL,
  `field_bet_sz_n_format` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`entity_type`,`entity_id`,`revision_id`,`deleted`,`delta`,`language`),
  KEY `entity_type` (`entity_type`),
  KEY `bundle` (`bundle`),
  KEY `deleted` (`deleted`),
  KEY `entity_id` (`entity_id`),
  KEY `revision_id` (`revision_id`),
  KEY `language` (`language`),
  KEY `field_bet_sz_n_format` (`field_bet_sz_n_format`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Revision archive storage for field 8 (field_bet_sz_n)';

--
-- A tábla adatainak kiíratása `field_revision_field_bet_sz_n`
--

INSERT INTO `field_revision_field_bet_sz_n` (`entity_type`, `bundle`, `deleted`, `entity_id`, `revision_id`, `language`, `delta`, `field_bet_sz_n_value`, `field_bet_sz_n_format`) VALUES
('node', 'orvosok', 0, 6, 6, 'und', 0, '#990000', NULL),
('node', 'orvosok', 0, 8, 8, 'und', 0, '#0000cc', NULL),
('node', 'orvosok', 0, 21, 21, 'und', 0, '#cccccc', NULL),
('node', 'orvosok', 0, 27, 27, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 29, 29, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 30, 30, 'und', 0, '#333333', NULL),
('node', 'orvosok', 0, 41, 41, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 49, 49, 'und', 0, '#fff', NULL),
('node', 'orvosok', 0, 50, 50, 'und', 0, '#ffffcc', NULL),
('node', 'orvosok', 0, 62, 62, 'und', 0, '#fff', NULL),
('node', 'orvosok', 0, 67, 67, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 68, 68, 'und', 0, '#333', NULL),
('node', 'orvosok', 0, 69, 69, 'und', 0, '#333333', NULL),
('node', 'orvosok', 0, 74, 74, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 97, 97, 'und', 0, '#993399', NULL),
('node', 'orvosok', 0, 110, 110, 'und', 0, '#fff', NULL),
('node', 'orvosok', 0, 116, 116, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 118, 118, 'und', 0, '#ff6600', NULL),
('node', 'orvosok', 0, 121, 121, 'und', 0, '#990000', NULL),
('node', 'orvosok', 0, 169, 169, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 170, 170, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 171, 171, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 172, 172, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 173, 173, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 174, 174, 'und', 0, '#ff9999', NULL),
('node', 'orvosok', 0, 175, 175, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 176, 176, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 177, 177, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 178, 178, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 179, 179, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 180, 180, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 181, 181, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 182, 182, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 183, 183, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 217, 217, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 226, 226, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 231, 231, 'und', 0, '#fff', NULL),
('node', 'orvosok', 0, 238, 238, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 239, 239, 'und', 0, '#fff', NULL),
('node', 'orvosok', 0, 240, 240, 'und', 0, '#906', NULL),
('node', 'orvosok', 0, 245, 245, 'und', 0, '#00c', NULL),
('node', 'orvosok', 0, 246, 246, 'und', 0, '#f0f0f0', NULL),
('node', 'orvosok', 0, 252, 252, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 257, 257, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 259, 259, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 261, 261, 'und', 0, '#FFFFFF', NULL),
('node', 'orvosok', 0, 264, 264, 'und', 0, '#000000', NULL),
('node', 'orvosok', 0, 274, 274, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 279, 279, 'und', 0, '#ffffff', NULL),
('node', 'orvosok', 0, 284, 284, 'und', 0, '#000100', NULL);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
