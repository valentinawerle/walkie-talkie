# 🎤 Manual de Usuario - Aplicación Walkie-Talkie

## 📖 Índice
1. [Introducción](#-introducción)
2. [Requisitos del Sistema](#-requisitos-del-sistema)
3. [Primeros Pasos](#-primeros-pasos)
4. [Registro e Inicio de Sesión](#-registro-e-inicio-de-sesión)
5. [Gestión de Salas](#-gestión-de-salas)
6. [Comunicación de Voz](#-comunicación-de-voz)
7. [Interfaz de Usuario](#-interfaz-de-usuario)
8. [Solución de Problemas](#-solución-de-problemas)
9. [Preguntas Frecuentes](#-preguntas-frecuentes)

---

## 🎯 Introducción

La **Aplicación Walkie-Talkie** es una plataforma de comunicación de voz en tiempo real que te permite crear salas de chat y comunicarte con otros usuarios mediante audio. Es perfecta para:

- ✅ **Reuniones virtuales** en tiempo real
- ✅ **Comunicación grupal** instantánea
- ✅ **Colaboración** en proyectos
- ✅ **Socialización** con amigos y familia

### Características Principales
- 🎤 **Comunicación de voz en tiempo real**
- 👥 **Salas con múltiples usuarios**
- 🔒 **Sistema de autenticación seguro**
- 📱 **Interfaz responsive** (móvil y desktop)
- 🌐 **Compatible con Chrome y Safari**

---

## 💻 Requisitos del Sistema

### Navegadores Soportados
- ✅ **Google Chrome** (versión 80 o superior)
- ✅ **Safari** (versión 13 o superior)
- ✅ **Firefox** (versión 75 o superior)
- ✅ **Microsoft Edge** (versión 80 o superior)

### Hardware Requerido
- 🎤 **Micrófono** (integrado o externo)
- 🔊 **Altavoces o auriculares**
- 📶 **Conexión a internet** estable

### Configuración Recomendada
- **Velocidad de internet**: Mínimo 1 Mbps
- **Memoria RAM**: 4 GB o más
- **Procesador**: Cualquier procesador moderno

---

## 🚀 Primeros Pasos

### 1. Acceder a la Aplicación
1. Abre tu navegador web
2. Ve a la URL de la aplicación: `http://localhost:4200`
3. Verás la pantalla de bienvenida

### 2. Verificar Permisos
La primera vez que uses la aplicación, el navegador te pedirá permisos:

#### Permisos de Micrófono
- Haz clic en **"Permitir"** cuando el navegador pregunte por acceso al micrófono
- Este permiso es **necesario** para poder hablar en las salas

#### Permisos de Audio (Chrome)
- En Chrome, es posible que necesites **activar el audio** manualmente
- Busca el botón **"Activar Audio"** en la interfaz
- Haz clic en él para habilitar la reproducción de audio

---

## 📝 Registro e Inicio de Sesión

### Crear una Nueva Cuenta

1. **En la pantalla de inicio**, haz clic en **"Registrarse"**
2. **Completa el formulario**:
   - **Nombre de usuario**: Elige un nombre único
   - **Email**: Ingresa tu correo electrónico
   - **Contraseña**: Crea una contraseña segura
3. **Haz clic en "Registrarse"**
4. **Confirma tu cuenta** si es necesario

### Iniciar Sesión

1. **En la pantalla de inicio**, haz clic en **"Iniciar Sesión"**
2. **Ingresa tus credenciales**:
   - **Email o nombre de usuario**
   - **Contraseña**
3. **Haz clic en "Iniciar Sesión"**

### Recuperar Contraseña

Si olvidaste tu contraseña:
1. Haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu **email**
3. Sigue las instrucciones enviadas a tu correo

---

## 🏠 Gestión de Salas

### Ver Salas Disponibles

1. **Después de iniciar sesión**, verás la lista de salas
2. **Las salas se muestran** con:
   - 📛 **Nombre de la sala**
   - 📝 **Descripción**
   - 👥 **Número de usuarios** (ej: 3/10)
   - 🔒 **Estado** (Pública o Privada)

### Unirse a una Sala

1. **Busca la sala** a la que quieres unirte
2. **Haz clic en "Unirse"**
3. **Espera a que cargue** la interfaz de la sala
4. **Verás la lista de miembros** y los controles de voz

### Crear una Nueva Sala

1. **Haz clic en "Crear Sala"**
2. **Completa la información**:
   - **Nombre**: Nombre descriptivo para la sala
   - **Descripción**: Explica el propósito de la sala
   - **Máximo de miembros**: Número máximo de usuarios (1-20)
   - **Sala privada**: Marca si quieres que sea privada
3. **Haz clic en "Crear"**

### Salir de una Sala

1. **En la sala**, busca el botón **"Salir"** (icono de salida)
2. **Haz clic en él**
3. **Confirma** que quieres salir
4. **Volverás** a la lista de salas

---

## 🎤 Comunicación de Voz

### Configurar Audio (Primera Vez)

#### En Chrome:
1. **Busca el botón "Activar Audio"** (naranja con animación)
2. **Haz clic en él**
3. **Confirma** que quieres activar el audio
4. **Verás un mensaje** de confirmación

#### En Safari:
- El audio se activa **automáticamente**
- No necesitas hacer nada adicional

### Hablar en la Sala

1. **Busca el botón de micrófono** (círculo verde con icono de mic)
2. **Presiona y mantén** el botón mientras hablas
3. **Los demás usuarios verán** que estás hablando
4. **Suelta el botón** cuando termines de hablar

### Escuchar a Otros

- **El audio se reproduce automáticamente** cuando otros hablan
- **Verás indicadores visuales** cuando alguien está hablando
- **Los nombres de usuario** se resaltan cuando hablan

### Test de Audio

1. **Haz clic en "Test Audio"**
2. **Se generará un tono de prueba**
3. **Los demás usuarios lo escucharán**
4. **Úsalo para verificar** que tu micrófono funciona

---

## 🖥️ Interfaz de Usuario

### Barra Superior (Header)

```
[←] Nombre de la Sala    [📶 Conectado] [❌]
```

- **← (Flecha)**: Volver a la lista de salas
- **Nombre de la Sala**: Título de la sala actual
- **📶 Conectado**: Estado de la conexión
- **❌**: Salir completamente de la sala

### Panel de Miembros

```
👥 Miembros (3/10)
├── 👤 Usuario1 [🎤 Hablando] [🔊 Audio]
├── 👤 Usuario2 [👑 Admin]
└── 👤 Usuario3
```

- **👤**: Nombre del usuario
- **🎤 Hablando**: Usuario está transmitiendo audio
- **🔊 Audio**: Usuario envió audio recientemente
- **👑 Admin**: Usuario es administrador de la sala

### Controles de Voz

```
🎤 [Botón de Hablar] [Botón de Parar]
[Test Audio] [Activar Audio]
```

- **Botón Verde**: Para comenzar a hablar
- **Botón Rojo**: Para detener de hablar
- **Test Audio**: Generar audio de prueba
- **Activar Audio**: Habilitar audio (solo en Chrome)

### Indicadores de Estado

- **🟢 Conectado**: Conexión estable
- **🔴 Desconectado**: Problema de conexión
- **🎤 Hablando**: Estás transmitiendo audio
- **🔊 Audio**: Alguien envió audio

---

## 🔧 Solución de Problemas

### No Puedo Escuchar Audio

#### En Chrome:
1. **Busca el botón "Activar Audio"**
2. **Haz clic en él**
3. **Confirma la activación**
4. **Prueba de nuevo**

#### En Safari:
1. **Verifica que el volumen** esté subido
2. **Revisa que no esté silenciado** el navegador
3. **Recarga la página** si es necesario

### No Puedo Hablar

1. **Verifica que el micrófono** esté conectado
2. **Comprueba los permisos** del navegador
3. **Haz clic en "Permitir"** si el navegador pregunta
4. **Prueba el "Test Audio"** para verificar

### Problemas de Conexión

1. **Verifica tu conexión a internet**
2. **Revisa el indicador** de conexión en la barra superior
3. **Recarga la página** si es necesario
4. **Intenta unirse** a la sala nuevamente

### La Sala No Carga

1. **Verifica que la sala** aún existe
2. **Comprueba que tienes permisos** para unirte
3. **Recarga la página**
4. **Contacta al administrador** de la sala

### Error de Autenticación

1. **Cierra sesión** y vuelve a iniciar
2. **Verifica tus credenciales**
3. **Limpia el caché** del navegador
4. **Intenta desde otro navegador**

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar la aplicación en mi móvil?
**R**: Sí, la aplicación es responsive y funciona en móviles, pero es **recomendable** usar una computadora para mejor experiencia.

### ¿Cuántos usuarios pueden estar en una sala?
**R**: El máximo es **20 usuarios** por sala, configurable al crear la sala.

### ¿Se graban las conversaciones?
**R**: **No**, las conversaciones son en tiempo real y no se almacenan.

### ¿Puedo crear salas privadas?
**R**: Sí, al crear una sala puedes marcarla como **privada**.

### ¿Qué pasa si pierdo la conexión?
**R**: La aplicación intentará **reconectarse automáticamente**. Si no puede, verás un indicador de "Desconectado".

### ¿Puedo usar auriculares?
**R**: Sí, puedes usar **auriculares con micrófono** para mejor calidad de audio.

### ¿Es seguro usar la aplicación?
**R**: Sí, usa **autenticación JWT** y **conexiones seguras**. Sin embargo, evita compartir información sensible.

### ¿Puedo cambiar mi nombre de usuario?
**R**: Actualmente no, pero es una funcionalidad planificada para futuras versiones.

### ¿Qué navegador recomiendas?
**R**: **Chrome** es el más compatible y estable para esta aplicación.

### ¿Puedo usar la aplicación sin registro?
**R**: No, es necesario **registrarse** para usar la aplicación.

---

## 📞 Soporte Técnico

### Antes de Contactar Soporte

1. **Revisa esta guía** completamente
2. **Prueba las soluciones** de la sección de problemas
3. **Verifica tu conexión** a internet
4. **Prueba en otro navegador**

### Información Útil para Reportar Problemas

- **Navegador y versión**
- **Sistema operativo**
- **Descripción detallada** del problema
- **Pasos para reproducir** el error
- **Capturas de pantalla** si es posible

### Contacto

Para soporte técnico, contacta al administrador del sistema o al equipo de desarrollo.

---

## 🎉 ¡Disfruta tu Comunicación!

La aplicación Walkie-Talkie está diseñada para hacer la comunicación de voz **sencilla, rápida y efectiva**. 

### Consejos para Mejor Experiencia

- 🎤 **Usa un micrófono de buena calidad** para mejor audio
- 🎧 **Considera usar auriculares** para evitar eco
- 📶 **Asegúrate de tener buena conexión** a internet
- 🤝 **Respeta a otros usuarios** en las salas
- 🔇 **Silencia tu micrófono** cuando no hables

### Funcionalidades Futuras

Estamos trabajando en nuevas características:
- 💬 **Chat de texto** en las salas
- 📱 **Notificaciones push**
- 🎥 **Video chat**
- 📹 **Grabación de conversaciones**

---

*Manual de Usuario v1.0*  
*Última actualización: $(date)*  
*Compatible con la aplicación Walkie-Talkie v1.0.0* 