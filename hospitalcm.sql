-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 19-12-2025 a las 19:38:31
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

--
-- Volcado de datos para la tabla `area`
--

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

--
-- Volcado de datos para la tabla `tipo_estado`
--

INSERT INTO `tipo_estado` (`estado_id`, `estado`) VALUES
(1, 'abierto'),
(2, 'en proceso'),
(3, 'en pausa'),
(4, 'cancelado'),
(5, 'cerrado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_evento`
--

CREATE TABLE `tipo_evento` (
  `evento_id` int(11) NOT NULL,
  `evento` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipo_evento`
--

INSERT INTO `tipo_evento` (`evento_id`, `evento`) VALUES
(1, 'requerimiento'),
(2, 'incidencia'),
(3, 'centinela');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_movimiento`
--

CREATE TABLE `tipo_movimiento` (
  `movimiento_id` int(11) NOT NULL,
  `movimiento` varchar(150) NOT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipo_movimiento`
--

INSERT INTO `tipo_movimiento` (`movimiento_id`, `movimiento`, `estado`) VALUES
(1, 'TICKET CREADO', 1),
(2, 'ACTUALIZADO', 1),
(3, 'SOPORTE ASIGNADO', 1),
(4, 'RESPONDIDO', 1),
(5, 'TICKET CERRADO', 1),
(6, 'REABIERTO', 1),
(7, 'COMENTARIO_AGREGADO', 1),
(8, 'TICKET EN PROCESO', 1),
(9, 'TICKET REVISADO', 1),
(10, 'TICKET EN PAUSA', 1),
(11, 'TICKET CANCELADO', 1),
(12, 'PRIORIDAD_CAMBIADA', 1),
(13, 'UNIDAD_CAMBIADA', 1),
(14, 'REASIGNADO', 1),
(15, 'INTEGRANTE_AGREGADO', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_origen`
--

CREATE TABLE `tipo_origen` (
  `origen_id` int(11) NOT NULL,
  `origen` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipo_origen`
--

INSERT INTO `tipo_origen` (`origen_id`, `origen`) VALUES
(1, 'solicitante'),
(2, 'soporte'),
(3, 'administrador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_prioridad`
--

CREATE TABLE `tipo_prioridad` (
  `prioridad_id` int(11) NOT NULL,
  `prioridad` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipo_prioridad`
--

INSERT INTO `tipo_prioridad` (`prioridad_id`, `prioridad`) VALUES
(1, 'baja'),
(2, 'media'),
(3, 'alta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_rol`
--

CREATE TABLE `tipo_rol` (
  `rol_id` int(11) NOT NULL,
  `nombre_rol` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipo_rol`
--

INSERT INTO `tipo_rol` (`rol_id`, `nombre_rol`) VALUES
(3, 'administrador'),
(1, 'solicitante'),
(2, 'soporte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_unidad`
--

CREATE TABLE `tipo_unidad` (
  `unidad_id` int(11) NOT NULL,
  `unidad` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipo_unidad`
--

INSERT INTO `tipo_unidad` (`unidad_id`, `unidad`) VALUES
(3, 'desarrollo'),
(2, 'infraestructura'),
(1, 'soporte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicacion`
--

CREATE TABLE `ubicacion` (
  `ubicacion_id` int(11) NOT NULL,
  `ubicacion` varchar(150) NOT NULL,
  `area_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO `area` (`area_id`, `nombre_area`) VALUES
(1, 'Urgencias'),
(2, 'Hospitalización Adultos'),
(3, 'Hospitalización Pediátrica'),
(4, 'UCI'),
(5, 'UTI'),
(6, 'Imagenología'),
(7, 'Laboratorio Clínico'),
(8, 'Pabellones Quirúrgicos'),
(9, 'Esterilización'),
(10, 'Farmacia'),
(11, 'Oncología'),
(12, 'Cardiología'),
(13, 'Neurología'),
(14, 'Maternidad'),
(15, 'Neonatología'),
(16, 'Psiquiatría'),
(17, 'Kinesiología'),
(18, 'Odontología'),
(19, 'Anatomía Patológica'),
(20, 'Alimentación'),
(21, 'Administración'),
(22, 'Recursos Humanos'),
(23, 'Finanzas'),
(24, 'Informática'),
(25, 'Mantención'),
(26, 'Seguridad'),
(27, 'Lavandería'),
(28, 'Servicios Generales'),
(29, 'Logística'),
(30, 'Ambulancias');
--
-- Volcado de datos para la tabla `ubicacion`
--

INSERT INTO `ubicacion` (`ubicacion_id`, `ubicacion`, `area_id`) VALUES
(1, 'Box 1', 1),
(2, 'Box 2', 1),
(3, 'Reanimación', 1),
(4, 'Observación', 1),
(5, 'Triage', 1),
(6, 'Admisión Urgencias', 1),
(7, 'Sala 201', 2),
(8, 'Sala 202', 2),
(9, 'Sala 301', 2),
(10, 'Estación de Enfermería Adultos', 2),
(11, 'Sala 401', 3),
(12, 'Sala de Juegos', 3),
(13, 'Estación Pediátrica', 3),
(14, 'UCI Box 1', 4),
(15, 'UCI Box 2', 4),
(16, 'Sala Monitoreo', 4),
(17, 'Radiología', 6),
(18, 'TAC', 6),
(19, 'Resonancia Magnética', 6),
(20, 'Mamografía', 6),
(21, 'Ecografía', 6),
(22, 'Hematología', 7),
(23, 'Bioquímica', 7),
(24, 'Microbiología', 7),
(25, 'Toma de Muestras', 7),
(26, 'Pabellón 1', 8),
(27, 'Pabellón 2', 8),
(28, 'Recuperación', 8),
(29, 'Esterilización CEA', 9),
(30, 'Farmacia Central', 10),
(31, 'Bodega de Medicamentos', 10),
(32, 'Preparto', 14),
(33, 'Sala de Partos', 14),
(34, 'Postparto', 14),
(35, 'Neo Box 1', 15),
(36, 'Neo Box 2', 15),
(37, 'Data Center', 24),
(38, 'Oficina TI', 24),
(39, 'Soporte Nivel 1', 24),
(40, 'Soporte Nivel 2', 24),
(41, 'Bodega Central', 29),
(42, 'Recepción de Insumos', 29),
(43, 'Oficina Seguridad', 26),
(44, 'Sala CCTV', 26);

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
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`usuario_id`, `nombre_completo`, `correo`, `contrasena`, `rol_id`, `unidad_id`, `activo`) VALUES
(1, 'Ana Silva', 'ana@hospital.cl', '$2b$10$8Awfk6u6mxdqHuV0J.Ovb.OXrP/esr67ZyZZ.ZyYw95D7kMtxGTO2', 1, NULL, 1),
(2, 'Carlos Mendez', 'carlos@hospital.cl', '$2b$10$vN1YXOjCt8CzVJuGMXCw4emnfgQrvg1mbC9WMd9xOJsFmMoWn/3Pm', 1, NULL, 1),
(3, 'Beatriz Soto', 'beatriz@hospital.cl', '$2b$10$pY8YOvngNSxrlfHo1hNfUOHHdzVWi6DnttJCTk3CemlQNIMYBaRlK', 1, NULL, 1),
(4, 'David Vargas', 'david@hospital.cl', '$2b$10$keOg6y.K0fLBw7TNn.YF5.f8plshl4t8Sr8GoT0Xz/MvT3h7AJwc6', 1, NULL, 1),
(5, 'Elena Rojas', 'elena@hospital.cl', '$2b$10$J7kiy3M9LJkIjFHow8J8g.//EWDp8QUaGyYNDpYmAc3NWdr91xKP.', 1, NULL, 1),
(6, 'Fernando Torres', 'fernando@hospital.cl', '$2b$10$XL4DzuL3LtLfwR17RU2chuGGpTDNju8yc.vkBFpaPu76oweDEppMS', 1, NULL, 1),
(7, 'Gabriela Castro', 'gabriela@hospital.cl', '$2b$10$0cUxQBNwlzasS8gAo5nXpe1mlXpkvAVACx1mzReTpDEbPVZ3uoJIa', 1, NULL, 1),
(8, 'Hugo Paredes', 'hugo@hospital.cl', '$2b$10$SFLFXPDSrObuZsGlD2pBde.j7A2UY2koNvnXUQvIvbHf.nhHpYSQO', 1, NULL, 1),
(9, 'Isabel Fuentes', 'isabel@hospital.cl', '$2b$10$3Pusc1TQzQ3QzpaY40GEm.MQLxY6TgQATeN0sOUlHYf9ohURBK5ye', 1, NULL, 1),
(10, 'Javier Espinoza', 'javier@hospital.cl', '$2b$10$G2F/cu58SgE4x/bGn/BgkO4YfJZZOmJa0mRZfeaSxx5MMr1erfgXq', 1, NULL, 1),
(11, 'Karen Morales', 'karen@hospital.cl', '$2b$10$LQRegZkBg8SYCW/hOXf67.RKlUbdfaUYULcL6K9HsyWURcdCLWtpW', 1, NULL, 1),
(12, 'Luis Navarro', 'luis@hospital.cl', '$2b$10$91ntr8o9D4G.Gh6VUa2Yue16Kk6LRriXhETR1EprkNc2FR386z3Hi', 1, NULL, 1),
(13, 'Monica Araya', 'monica@hospital.cl', '$2b$10$HYMhjfLEs.qjswtMtTYwPOoufuRUnW5gGbKOTLTuiQvjwKak9pNZC', 1, NULL, 1),
(14, 'Nicolas Bravo', 'nicolas@hospital.cl', '$2b$10$On29tVPufHvMgMKijRJKGOrUkG8N6E8ol9DMTUcbBmvdBpMcyTDVC', 1, NULL, 1),
(15, 'Olga Herrera', 'olga@hospital.cl', '$2b$10$8U.Mb8wjaLAsendxUcF43u8x2mIEEIkFstBybpD2TpgSeoj0vwZpm', 1, NULL, 1),
(16, 'Pablo Valenzuela', 'pablo@hospital.cl', '$2b$10$oXk7YgakacZNJ5tneCsTKeeN.m307ToV2FiSktQ6EjBIVBXRJXp5.', 1, NULL, 1),
(17, 'Rocio Pizarro', 'rocio@hospital.cl', '$2b$10$WY.0MrIuZrYhYuyjohUuPO3OEVDICOBOOFegShe2Lwxi5oBplF.CW', 1, NULL, 1),
(18, 'Sergio Castillo', 'sergio@hospital.cl', '$2b$10$0NJgUMy/ot.d5KhIh1Y9VuL6ELxbXWfgJUkKUg4x6pxqD32UbuBwi', 1, NULL, 1),
(19, 'Tatiana Flores', 'tatiana@hospital.cl', '$2b$10$FtPslMH5hg26mRPt284lMeWP06FMk36x2K8hPB7Hx11veiFHVBv/6', 1, NULL, 1),
(20, 'Victor Reyes', 'victor@hospital.cl', '$2b$10$eRxKviLWJxgVYQRW36R42ebi18sB.ftfDW4.Jv6dWDXmgYv6GgwLK', 1, NULL, 1),
(21, 'Ximena Lagos', 'ximena@hospital.cl', '$2b$10$I87FlRs705RTv3d6ztMXaugdH3SmLwtLUFY6Z2k.7KoePVH5WbINK', 1, NULL, 1),
(22, 'Yamil Guzman', 'yamil@hospital.cl', '$2b$10$J5Lmed0h0q6L8incP.BZ7.v3Hd6OQO5MNiqT/ZZodU0XHrA2eUjO6', 1, NULL, 1),
(23, 'Zoe Miranda', 'zoe@hospital.cl', '$2b$10$p7supPMBAxGlVDQ81kEq6evzotcxAaPBC3vPC0SoGVypwSQqkWMVC', 1, NULL, 1),
(24, 'Andres Vidal', 'andres@hospital.cl', '$2b$10$n.R2Dw5TDUN90Y3QUziiqu7aVRDvQu1o3V3G.8D7ndM59HHhY.zly', 1, NULL, 1),
(25, 'Camila Guerrero', 'camila@hospital.cl', '$2b$10$QPgai275OjH/SHxfak4RK.ms/8xUKM9BtcaVgXYXPLgHUpw8Yo.ky', 1, NULL, 1),
(26, 'Diego Salazar', 'diego@hospital.cl', '$2b$10$zYCFBaSSDKaGHxFKWVGWxu/.v0HgoH5J3XkfsbLL5zLfv/Da8euBS', 1, NULL, 1),
(27, 'Fernanda Peñailillo', 'fernanda@hospital.cl', '$2b$10$UZNj8blWquGFcyFk4uz/EeJeA3scL6KHR/drXEOMaZ.wM/gF3LDzW', 1, NULL, 1),
(28, 'Gonzalo Riquelme', 'gonzalo@hospital.cl', '$2b$10$avybPbJ/4.w9JIdvZqRJpe5mLwGu1ZEE/80swPGzkJDkg8lhUwGqC', 1, NULL, 1),
(29, 'Javiera Sepulveda', 'javiera@hospital.cl', '$2b$10$EJLl0nDd9s1mUPrVPT2Mk.rrp7o4cxyGPixWT9IJoO6F1ZkTm4uki', 1, NULL, 1),
(30, 'Matias Vergara', 'matias@hospital.cl', '$2b$10$zbz.r5W.icfHrswRpRdwV.OdICQY.IeHTJ.jQ4m6S/X.f4XIgr//q', 1, NULL, 1),
(31, 'Patricio Admin', 'patricio@hospital.cl', '$2b$10$lYunxBHzzu8kAu.N58PnT.As06RzHWhWGXjg8DFHSC92/HJK9yzQS', 3, 1, 1),
(32, 'Claudia Admin', 'claudia@hospital.cl', '$2b$10$0l7fTuvA7I5l6RTbTC7gZem7YkuJLvrTRV1rwCOrgSuGTbL2CFP/e', 3, 2, 1),
(33, 'Felipe Admin', 'felipe@hospital.cl', '$2b$10$YFdqlE8cczJE4n5J9j5Yl.JBVLZegwalCTVgPxYiGcUdwXfJLp/K.', 3, 3, 1),
(34, 'Esteban Soporte', 'esteban@hospital.cl', '$2b$10$LbQWsHCIWlNmI1zIb51neuDMkDTKjuplxqmWSkCsmokMnZ7Ma17FC', 2, 1, 1),
(35, 'Laura Soporte', 'laura@hospital.cl', '$2b$10$ERdnK2nn2PEndh9Q4LYzbeopgkIDBhdCp29fUMF28KvGf8Tkxq.Ey', 2, 1, 1),
(36, 'Jorge Infra', 'jorge@hospital.cl', '$2b$10$/DpeHQYwFunoen0U1woRhOFywJtiGfSwfX1SQP6XAKIIX0MHBaHSW', 2, 2, 1),
(37, 'Sofia Infra', 'sofia@hospital.cl', '$2b$10$R6b9Ukt5QhWEe.v/2J/D2uf5VRx/TMEpRdubOHJIHVR1wkZLYTkVK', 2, 2, 1),
(38, 'Ricardo Dev', 'ricardo@hospital.cl', '$2b$10$l99Yw4MKpOCBM1Bar6nVEO4hw6.7chsWf4.LZIzWnwZmTmu7PPaWm', 2, 3, 1),
(39, 'Valentina Dev', 'valentina@hospital.cl', '$2b$10$R5ct1dN2Je4zoPCMgQKCS.tGhCgS03XUEZ8aoYxaXL1eXbtBSiyq6', 2, 3, 1),
(40, 'agustin pa', 'agustinpa@hospital.cl', '$2b$10$1/amnLfCjkF1xFnYCJsfMuhZpv7j6TSFxx5PGxpuLf1hOLY/f6eVC', 3, 2, 1);

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
  MODIFY `area_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

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
  MODIFY `estado_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tipo_evento`
--
ALTER TABLE `tipo_evento`
  MODIFY `evento_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipo_movimiento`
--
ALTER TABLE `tipo_movimiento`
  MODIFY `movimiento_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `tipo_origen`
--
ALTER TABLE `tipo_origen`
  MODIFY `origen_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipo_prioridad`
--
ALTER TABLE `tipo_prioridad`
  MODIFY `prioridad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipo_rol`
--
ALTER TABLE `tipo_rol`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipo_unidad`
--
ALTER TABLE `tipo_unidad`
  MODIFY `unidad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  MODIFY `ubicacion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

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
