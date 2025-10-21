-- Script SQL para crear tablas de tracking de geolocalización
-- Base de datos: SQL Server

-- Tabla para almacenar el historial de ubicaciones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ubicaciones_historial')
BEGIN
    CREATE TABLE ubicaciones_historial (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        velocidad DECIMAL(6, 2) NULL,
        precision_metros DECIMAL(8, 2) NULL,
        timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_ubicaciones_usuario FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    -- Índices para mejorar el rendimiento
    CREATE INDEX IX_ubicaciones_user_timestamp ON ubicaciones_historial(user_id, timestamp DESC);
    CREATE INDEX IX_ubicaciones_timestamp ON ubicaciones_historial(timestamp DESC);
    
    PRINT 'Tabla ubicaciones_historial creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla ubicaciones_historial ya existe';
END
GO

-- Tabla para almacenar el estado de tracking de cada usuario
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuarios_tracking_estado')
BEGIN
    CREATE TABLE usuarios_tracking_estado (
        user_id INT PRIMARY KEY,
        activo BIT NOT NULL DEFAULT 0,
        ultima_actualizacion DATETIME2 NULL,
        ultima_latitude DECIMAL(10, 8) NULL,
        ultima_longitude DECIMAL(11, 8) NULL,
        ultima_velocidad DECIMAL(6, 2) NULL,
        CONSTRAINT FK_tracking_estado_usuario FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    -- Índice para consultas de usuarios activos
    CREATE INDEX IX_tracking_activo ON usuarios_tracking_estado(activo, ultima_actualizacion DESC);
    
    PRINT 'Tabla usuarios_tracking_estado creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla usuarios_tracking_estado ya existe';
END
GO

-- Stored Procedure: Guardar nueva ubicación
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_guardar_ubicacion')
    DROP PROCEDURE sp_guardar_ubicacion;
GO

CREATE PROCEDURE sp_guardar_ubicacion
    @user_id INT,
    @latitude DECIMAL(10, 8),
    @longitude DECIMAL(11, 8),
    @velocidad DECIMAL(6, 2) = NULL,
    @precision_metros DECIMAL(8, 2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insertar en historial
        INSERT INTO ubicaciones_historial (user_id, latitude, longitude, velocidad, precision_metros, timestamp)
        VALUES (@user_id, @latitude, @longitude, @velocidad, @precision_metros, GETDATE());
        
        DECLARE @ubicacion_id INT = SCOPE_IDENTITY();
        
        -- Actualizar o insertar estado de tracking
        IF EXISTS (SELECT 1 FROM usuarios_tracking_estado WHERE user_id = @user_id)
        BEGIN
            UPDATE usuarios_tracking_estado
            SET ultima_actualizacion = GETDATE(),
                ultima_latitude = @latitude,
                ultima_longitude = @longitude,
                ultima_velocidad = @velocidad,
                activo = 1
            WHERE user_id = @user_id;
        END
        ELSE
        BEGIN
            INSERT INTO usuarios_tracking_estado (user_id, activo, ultima_actualizacion, ultima_latitude, ultima_longitude, ultima_velocidad)
            VALUES (@user_id, 1, GETDATE(), @latitude, @longitude, @velocidad);
        END
        
        COMMIT TRANSACTION;
        
        -- Retornar la ubicación guardada
        SELECT 
            @ubicacion_id AS id,
            @user_id AS userId,
            @latitude AS latitude,
            @longitude AS longitude,
            @velocidad AS velocidad,
            GETDATE() AS timestamp;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Obtener usuarios con tracking activo
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_obtener_usuarios_activos')
    DROP PROCEDURE sp_obtener_usuarios_activos;
GO

CREATE PROCEDURE sp_obtener_usuarios_activos
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.id AS userId,
        u.username,
        ute.ultima_latitude AS latitude,
        ute.ultima_longitude AS longitude,
        ute.ultima_velocidad AS velocidad,
        ute.ultima_actualizacion AS timestamp,
        ute.activo
    FROM usuarios_tracking_estado ute
    INNER JOIN usuarios u ON ute.user_id = u.id
    WHERE ute.activo = 1
        AND ute.ultima_actualizacion IS NOT NULL
        -- Considerar activo solo si se actualizó en los últimos 5 minutos
        AND ute.ultima_actualizacion >= DATEADD(MINUTE, -5, GETDATE())
    ORDER BY ute.ultima_actualizacion DESC;
END
GO

-- Stored Procedure: Obtener historial de ubicaciones de un usuario
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_obtener_historial_usuario')
    DROP PROCEDURE sp_obtener_historial_usuario;
GO

CREATE PROCEDURE sp_obtener_historial_usuario
    @user_id INT,
    @fecha_inicio DATETIME2 = NULL,
    @fecha_fin DATETIME2 = NULL,
    @limite INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Si no se especifica fecha_inicio, usar las últimas 24 horas
    IF @fecha_inicio IS NULL
        SET @fecha_inicio = DATEADD(HOUR, -24, GETDATE());
    
    -- Si no se especifica fecha_fin, usar la fecha actual
    IF @fecha_fin IS NULL
        SET @fecha_fin = GETDATE();
    
    SELECT TOP (@limite)
        id,
        user_id AS userId,
        latitude,
        longitude,
        velocidad,
        precision_metros AS precision,
        timestamp
    FROM ubicaciones_historial
    WHERE user_id = @user_id
        AND timestamp BETWEEN @fecha_inicio AND @fecha_fin
    ORDER BY timestamp DESC;
END
GO

-- Stored Procedure: Actualizar estado de tracking
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_actualizar_estado_tracking')
    DROP PROCEDURE sp_actualizar_estado_tracking;
GO

CREATE PROCEDURE sp_actualizar_estado_tracking
    @user_id INT,
    @activo BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Si existe, actualizar; si no, insertar
    IF EXISTS (SELECT 1 FROM usuarios_tracking_estado WHERE user_id = @user_id)
    BEGIN
        UPDATE usuarios_tracking_estado
        SET activo = @activo,
            ultima_actualizacion = CASE WHEN @activo = 1 THEN GETDATE() ELSE ultima_actualizacion END
        WHERE user_id = @user_id;
    END
    ELSE
    BEGIN
        INSERT INTO usuarios_tracking_estado (user_id, activo, ultima_actualizacion)
        VALUES (@user_id, @activo, CASE WHEN @activo = 1 THEN GETDATE() ELSE NULL END);
    END
    
    SELECT 
        user_id AS userId,
        activo,
        ultima_actualizacion AS ultimaActualizacion
    FROM usuarios_tracking_estado
    WHERE user_id = @user_id;
END
GO

PRINT 'Scripts de tracking creados exitosamente';
