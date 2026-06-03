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
-- Tábla szerkezet ehhez a táblához `field_revision_field_sz_n`
--

CREATE TABLE IF NOT EXISTS `field_revision_field_sz_n` (
  `entity_type` varchar(128) NOT NULL DEFAULT '' COMMENT 'The entity type this data is attached to',
  `bundle` varchar(128) NOT NULL DEFAULT '' COMMENT 'The field instance bundle to which this row belongs, used when deleting a field instance',
  `deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'A boolean indicating whether this data item has been deleted',
  `entity_id` int(10) unsigned NOT NULL COMMENT 'The entity id this data is attached to',
  `revision_id` int(10) unsigned NOT NULL COMMENT 'The entity revision id this data is attached to',
  `language` varchar(32) NOT NULL DEFAULT '' COMMENT 'The language for this data item.',
  `delta` int(10) unsigned NOT NULL COMMENT 'The sequence number for this data item, used for multi-value fields',
  `field_sz_n_value` varchar(10) DEFAULT NULL,
  `field_sz_n_format` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`entity_type`,`entity_id`,`revision_id`,`deleted`,`delta`,`language`),
  KEY `entity_type` (`entity_type`),
  KEY `bundle` (`bundle`),
  KEY `deleted` (`deleted`),
  KEY `entity_id` (`entity_id`),
  KEY `revision_id` (`revision_id`),
  KEY `language` (`language`),
  KEY `field_sz_n_format` (`field_sz_n_format`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Revision archive storage for field 6 (field_sz_n)';

--
-- A tábla adatainak kiíratása `field_revision_field_sz_n`
--

INSERT INTO `field_revision_field_sz_n` (`entity_type`, `bundle`, `deleted`, `entity_id`, `revision_id`, `language`, `delta`, `field_sz_n_value`, `field_sz_n_format`) VALUES
('node', 'orvosok', 0, 6, 6, 'und', 0, '#aaffaa', NULL),
('node', 'orvosok', 0, 7, 7, 'und', 0, '#EAD5BF', NULL),
('node', 'orvosok', 0, 8, 8, 'und', 0, '#aaeaff', NULL),
('node', 'orvosok', 0, 9, 9, 'und', 0, '#ff9999', NULL),
('node', 'orvosok', 0, 10, 10, 'und', 0, '#ff9966', NULL),
('node', 'orvosok', 0, 11, 11, 'und', 0, '#BFBFFF', NULL),
('node', 'orvosok', 0, 12, 12, 'und', 0, '#95DBDB', NULL),
('node', 'orvosok', 0, 13, 13, 'und', 0, '%NA', NULL),
('node', 'orvosok', 0, 14, 14, 'und', 0, '%LI', NULL),
('node', 'orvosok', 0, 15, 15, 'und', 0, '%HA', NULL),
('node', 'orvosok', 0, 16, 16, 'und', 0, '%GL', NULL),
('node', 'orvosok', 0, 17, 17, 'und', 0, '%HQ', NULL),
('node', 'orvosok', 0, 18, 18, 'und', 0, '%AM', NULL),
('node', 'orvosok', 0, 19, 19, 'und', 0, '%SF', NULL),
('node', 'orvosok', 0, 20, 20, 'und', 0, '%CA', NULL),
('node', 'orvosok', 0, 21, 21, 'und', 0, '#B70000', NULL),
('node', 'orvosok', 0, 27, 27, 'und', 0, '%TV', NULL),
('node', 'orvosok', 0, 29, 29, 'und', 0, '%KT', NULL),
('node', 'orvosok', 0, 30, 30, 'und', 0, '%MP', NULL),
('node', 'orvosok', 0, 34, 34, 'und', 0, '#66ffff', NULL),
('node', 'orvosok', 0, 35, 35, 'und', 0, '#669900', NULL),
('node', 'orvosok', 0, 41, 41, 'und', 0, '%SA', NULL),
('node', 'orvosok', 0, 42, 42, 'und', 0, '#3399ff', NULL),
('node', 'orvosok', 0, 43, 43, 'und', 0, '#ff9933', NULL),
('node', 'orvosok', 0, 44, 44, 'und', 0, '#cccc99', NULL),
('node', 'orvosok', 0, 45, 45, 'und', 0, '#99cc99', NULL),
('node', 'orvosok', 0, 46, 46, 'und', 0, '#99ffcc', NULL),
('node', 'orvosok', 0, 47, 47, 'und', 0, '#cc9900', NULL),
('node', 'orvosok', 0, 48, 48, 'und', 0, '#ccffff', NULL),
('node', 'orvosok', 0, 49, 49, 'und', 0, '#8F8F47', NULL),
('node', 'orvosok', 0, 50, 50, 'und', 0, '#336600', NULL),
('node', 'orvosok', 0, 51, 51, 'und', 0, '#ffcc33', NULL),
('node', 'orvosok', 0, 52, 52, 'und', 0, '#ff99cc', NULL),
('node', 'orvosok', 0, 53, 53, 'und', 0, '#A8FFA8', NULL),
('node', 'orvosok', 0, 54, 54, 'und', 0, '#E5E5E5', NULL),
('node', 'orvosok', 0, 55, 55, 'und', 0, '#00cc00', NULL),
('node', 'orvosok', 0, 61, 61, 'und', 0, '#ccff99', NULL),
('node', 'orvosok', 0, 62, 62, 'und', 0, '#9c9', NULL),
('node', 'orvosok', 0, 65, 65, 'und', 0, '#33ff66', NULL),
('node', 'orvosok', 0, 68, 68, 'und', 0, '#6cc', NULL),
('node', 'orvosok', 0, 69, 69, 'und', 0, '%MP', NULL),
('node', 'orvosok', 0, 70, 70, 'und', 0, '#cccccc', NULL),
('node', 'orvosok', 0, 74, 74, 'und', 0, '#ffcccc', NULL),
('node', 'orvosok', 0, 75, 75, 'und', 0, '#ff99ff', NULL),
('node', 'orvosok', 0, 79, 79, 'und', 0, '#99ffcc', NULL),
('node', 'orvosok', 0, 80, 80, 'und', 0, '%TL', NULL),
('node', 'orvosok', 0, 90, 90, 'und', 0, '#9999cc', NULL),
('node', 'orvosok', 0, 97, 97, 'und', 0, '#99cc00', NULL),
('node', 'orvosok', 0, 109, 109, 'und', 0, '%DS', NULL),
('node', 'orvosok', 0, 110, 110, 'und', 0, '#990000', NULL),
('node', 'orvosok', 0, 114, 114, 'und', 0, '#CEB5B5', NULL),
('node', 'orvosok', 0, 116, 116, 'und', 0, '#996600', NULL),
('node', 'orvosok', 0, 117, 117, 'und', 0, '#ff9933', NULL),
('node', 'orvosok', 0, 118, 118, 'und', 0, '#ffff99', NULL),
('node', 'orvosok', 0, 121, 121, 'und', 0, '#ffff66', NULL),
('node', 'orvosok', 0, 122, 122, 'und', 0, '#ccffff', NULL),
('node', 'orvosok', 0, 169, 169, 'und', 0, '#66cc66', NULL),
('node', 'orvosok', 0, 170, 170, 'und', 0, '#6699cc', NULL),
('node', 'orvosok', 0, 171, 171, 'und', 0, '#0033cc', NULL),
('node', 'orvosok', 0, 172, 172, 'und', 0, '#990000', NULL),
('node', 'orvosok', 0, 173, 173, 'und', 0, '#66cccc', NULL),
('node', 'orvosok', 0, 174, 174, 'und', 0, '#6633ff', NULL),
('node', 'orvosok', 0, 175, 175, 'und', 0, '#ffff00', NULL),
('node', 'orvosok', 0, 176, 176, 'und', 0, '#ff3300', NULL),
('node', 'orvosok', 0, 177, 177, 'und', 0, '#999900', NULL),
('node', 'orvosok', 0, 178, 178, 'und', 0, '#b0ffff', NULL),
('node', 'orvosok', 0, 179, 179, 'und', 0, '#ff9999', NULL),
('node', 'orvosok', 0, 180, 180, 'und', 0, '#ff9900', NULL),
('node', 'orvosok', 0, 181, 181, 'und', 0, '#cccc33', NULL),
('node', 'orvosok', 0, 182, 182, 'und', 0, '#cc66ff', NULL),
('node', 'orvosok', 0, 183, 183, 'und', 0, '#669900', NULL),
('node', 'orvosok', 0, 217, 217, 'und', 0, '%VZ', NULL),
('node', 'orvosok', 0, 218, 218, 'und', 0, '#EAD5BF', NULL),
('node', 'orvosok', 0, 226, 226, 'und', 0, '#ff00cc', NULL),
('node', 'orvosok', 0, 231, 231, 'und', 0, '#6cf', NULL),
('node', 'orvosok', 0, 238, 238, 'und', 0, '#99ccff', NULL),
('node', 'orvosok', 0, 239, 239, 'und', 0, '#6c0', NULL),
('node', 'orvosok', 0, 240, 240, 'und', 0, '#fff', NULL),
('node', 'orvosok', 0, 245, 245, 'und', 0, '#f90', NULL),
('node', 'orvosok', 0, 246, 246, 'und', 0, '#ff6600', NULL),
('node', 'orvosok', 0, 250, 250, 'und', 0, '#A8FFA8', NULL),
('node', 'orvosok', 0, 252, 252, 'und', 0, '#ff0066', NULL),
('node', 'orvosok', 0, 254, 254, 'und', 0, '#00cc00', NULL),
('node', 'orvosok', 0, 257, 257, 'und', 0, '#cc3333', NULL),
('node', 'orvosok', 0, 259, 259, 'und', 0, '#008080', NULL),
('node', 'orvosok', 0, 261, 261, 'und', 0, '#6633cc', NULL),
('node', 'orvosok', 0, 264, 264, 'und', 0, ' #cccccc', NULL),
('node', 'orvosok', 0, 274, 274, 'und', 0, '#9900cc', NULL),
('node', 'orvosok', 0, 275, 275, 'und', 0, '#e2c6ff', NULL),
('node', 'orvosok', 0, 276, 276, 'und', 0, '#ff99cc', NULL),
('node', 'orvosok', 0, 279, 279, 'und', 0, '#66cc33', NULL),
('node', 'orvosok', 0, 284, 284, 'und', 0, '#FF9514', NULL);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
