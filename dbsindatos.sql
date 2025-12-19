-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 16-12-2025 a las 20:25:34
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `hospitalcm`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area`
--

CREATE TABLE `area` (
  `area_id` int(11) NOT NULL,
  `nombre_area` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket`
--

CREATE TABLE `ticket` (
  `ticket_id` int(11) NOT NULL,
  `usuario_id_solicita` int(11) NOT NULL,
  `asunto` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `autor_problema` varchar(150) DEFAULT NULL,
  `ip_manual` varchar(100) DEFAULT NULL,
  `direccion_ip` varchar(45) DEFAULT NULL,
  `estado_de_revision` tinyint(1) DEFAULT 0,
  `prioridad_id` int(11) DEFAULT NULL,
  `unidad_id` int(11) DEFAULT NULL,
  `estado_id` int(11) DEFAULT NULL,
  `origen_id` int(11) DEFAULT NULL,
  `evento_id` int(11) DEFAULT NULL,
  `ubicacion_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_detalle`
--

CREATE TABLE `ticket_detalle` (
  `ticket_detalle_id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `respuesta` text DEFAULT NULL,
  `soporte_asignado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_detalle_integrante`
--

CREATE TABLE `ticket_detalle_integrante` (
  `ticket_detalle_integrante_id` int(11) NOT NULL,
  `ticket_detalle_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_detalle_observacion`
--

CREATE TABLE `ticket_detalle_observacion` (
  `ticket_detalle_observacion_id` int(11) NOT NULL,
  `ticket_detalle_id` int(11) NOT NULL,
  `observacion` text DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_movimiento`
--

CREATE TABLE `ticket_movimiento` (
  `ticket_movimiento_id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `movimiento_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_estado`
--

CREATE TABLE `tipo_estado` (
  `estado_id` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_evento`
--

CREATE TABLE `tipo_evento` (
  `evento_id` int(11) NOT NULL,
  `evento` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_movimiento`
--

CREATE TABLE `tipo_movimiento` (
  `movimiento_id` int(11) NOT NULL,
  `movimiento` varchar(150) NOT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_origen`
--

CREATE TABLE `tipo_origen` (
  `origen_id` int(11) NOT NULL,
  `origen` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_prioridad`
--

CREATE TABLE `tipo_prioridad` (
  `prioridad_id` int(11) NOT NULL,
  `prioridad` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_rol`
--

CREATE TABLE `tipo_rol` (
  `rol_id` int(11) NOT NULL,
  `nombre_rol` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_unidad`
--

CREATE TABLE `tipo_unidad` (
  `unidad_id` int(11) NOT NULL,
  `unidad` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicacion`
--

CREATE TABLE `ubicacion` (
  `ubicacion_id` int(11) NOT NULL,
  `ubicacion` varchar(150) NOT NULL,
  `area_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `usuario_id` int(11) NOT NULL,
  `nombre_completo` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `unidad_id` int(11) DEFAULT NULL,
  `activo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`area_id`);

--
-- Indices de la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`ticket_id`),
  ADD KEY `usuario_id_solicita_idx` (`usuario_id_solicita`),
  ADD KEY `prioridad_idx` (`prioridad_id`),
  ADD KEY `unidad_idx` (`unidad_id`),
  ADD KEY `estado_idx` (`estado_id`),
  ADD KEY `origen_idx` (`origen_id`),
  ADD KEY `evento_idx` (`evento_id`),
  ADD KEY `ubicacion_idx` (`ubicacion_id`);

--
-- Indices de la tabla `ticket_detalle`
--
ALTER TABLE `ticket_detalle`
  ADD PRIMARY KEY (`ticket_detalle_id`),
  ADD KEY `ticket_id_idx` (`ticket_id`),
  ADD KEY `soporte_asignado_idx` (`soporte_asignado`);

--
-- Indices de la tabla `ticket_detalle_integrante`
--
ALTER TABLE `ticket_detalle_integrante`
  ADD PRIMARY KEY (`ticket_detalle_integrante_id`),
  ADD KEY `ticket_detalle_id_idx` (`ticket_detalle_id`),
  ADD KEY `usuario_id_idx` (`usuario_id`);

--
-- Indices de la tabla `ticket_detalle_observacion`
--
ALTER TABLE `ticket_detalle_observacion`
  ADD PRIMARY KEY (`ticket_detalle_observacion_id`),
  ADD KEY `ticket_detalle_id_idx` (`ticket_detalle_id`),
  ADD KEY `usuario_id_idx2` (`usuario_id`);

--
-- Indices de la tabla `ticket_movimiento`
--
ALTER TABLE `ticket_movimiento`
  ADD PRIMARY KEY (`ticket_movimiento_id`),
  ADD KEY `ticket_id_idx2` (`ticket_id`),
  ADD KEY `movimiento_id_idx` (`movimiento_id`),
  ADD KEY `usuario_id_idx3` (`usuario_id`);

--
-- Indices de la tabla `tipo_estado`
--
ALTER TABLE `tipo_estado`
  ADD PRIMARY KEY (`estado_id`);

--
-- Indices de la tabla `tipo_evento`
--
ALTER TABLE `tipo_evento`
  ADD PRIMARY KEY (`evento_id`);

--
-- Indices de la tabla `tipo_movimiento`
--
ALTER TABLE `tipo_movimiento`
  ADD PRIMARY KEY (`movimiento_id`);

--
-- Indices de la tabla `tipo_origen`
--
ALTER TABLE `tipo_origen`
  ADD PRIMARY KEY (`origen_id`);

--
-- Indices de la tabla `tipo_prioridad`
--
ALTER TABLE `tipo_prioridad`
  ADD PRIMARY KEY (`prioridad_id`);

--
-- Indices de la tabla `tipo_rol`
--
ALTER TABLE `tipo_rol`
  ADD PRIMARY KEY (`rol_id`),
  ADD UNIQUE KEY `nombre_rol_unique` (`nombre_rol`);

--
-- Indices de la tabla `tipo_unidad`
--
ALTER TABLE `tipo_unidad`
  ADD PRIMARY KEY (`unidad_id`),
  ADD KEY `unidad_idx` (`unidad`);

--
-- Indices de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  ADD PRIMARY KEY (`ubicacion_id`),
  ADD KEY `area_id_idx` (`area_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `correo_unique` (`correo`),
  ADD KEY `rol_id_idx` (`rol_id`),
  ADD KEY `unidad_id_idx` (`unidad_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `area`
--
ALTER TABLE `area`
  MODIFY `area_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ticket`
--
ALTER TABLE `ticket`
  MODIFY `ticket_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ticket_detalle`
--
ALTER TABLE `ticket_detalle`
  MODIFY `ticket_detalle_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ticket_detalle_integrante`
--
ALTER TABLE `ticket_detalle_integrante`
  MODIFY `ticket_detalle_integrante_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ticket_detalle_observacion`
--
ALTER TABLE `ticket_detalle_observacion`
  MODIFY `ticket_detalle_observacion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ticket_movimiento`
--
ALTER TABLE `ticket_movimiento`
  MODIFY `ticket_movimiento_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_estado`
--
ALTER TABLE `tipo_estado`
  MODIFY `estado_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_evento`
--
ALTER TABLE `tipo_evento`
  MODIFY `evento_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_movimiento`
--
ALTER TABLE `tipo_movimiento`
  MODIFY `movimiento_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_origen`
--
ALTER TABLE `tipo_origen`
  MODIFY `origen_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_prioridad`
--
ALTER TABLE `tipo_prioridad`
  MODIFY `prioridad_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_rol`
--
ALTER TABLE `tipo_rol`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_unidad`
--
ALTER TABLE `tipo_unidad`
  MODIFY `unidad_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  MODIFY `ubicacion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`usuario_id_solicita`) REFERENCES `usuario` (`usuario_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`prioridad_id`) REFERENCES `tipo_prioridad` (`prioridad_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_3` FOREIGN KEY (`unidad_id`) REFERENCES `tipo_unidad` (`unidad_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_4` FOREIGN KEY (`estado_id`) REFERENCES `tipo_estado` (`estado_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_5` FOREIGN KEY (`origen_id`) REFERENCES `tipo_origen` (`origen_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_6` FOREIGN KEY (`evento_id`) REFERENCES `tipo_evento` (`evento_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_7` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicacion` (`ubicacion_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `ticket_detalle`
--
ALTER TABLE `ticket_detalle`
  ADD CONSTRAINT `ticket_detalle_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`ticket_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_detalle_ibfk_2` FOREIGN KEY (`soporte_asignado`) REFERENCES `usuario` (`usuario_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `ticket_detalle_integrante`
--
ALTER TABLE `ticket_detalle_integrante`
  ADD CONSTRAINT `ticket_detalle_integrante_ibfk_1` FOREIGN KEY (`ticket_detalle_id`) REFERENCES `ticket_detalle` (`ticket_detalle_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_detalle_integrante_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`usuario_id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ticket_detalle_observacion`
--
ALTER TABLE `ticket_detalle_observacion`
  ADD CONSTRAINT `ticket_detalle_observacion_ibfk_1` FOREIGN KEY (`ticket_detalle_id`) REFERENCES `ticket_detalle` (`ticket_detalle_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_detalle_observacion_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`usuario_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `ticket_movimiento`
--
ALTER TABLE `ticket_movimiento`
  ADD CONSTRAINT `ticket_movimiento_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`ticket_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_movimiento_ibfk_2` FOREIGN KEY (`movimiento_id`) REFERENCES `tipo_movimiento` (`movimiento_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_movimiento_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`usuario_id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  ADD CONSTRAINT `ubicacion_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `area` (`area_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `tipo_rol` (`rol_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`unidad_id`) REFERENCES `tipo_unidad` (`unidad_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
