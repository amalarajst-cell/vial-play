# VIAL PLAY - Test de Reacción Vial 🚦🚗
### Stand de Seguridad Vial | Gobierno de la Ciudad de Buenos Aires

**Dirección General de Seguridad Vial**  
**Gerencia de Educación y Convivencia Vial**

---

## 📌 Descripción del Proyecto
**VIAL PLAY** es una aplicación web interactiva desarrollada para stands y eventos de concientización y educación vial en la Ciudad de Buenos Aires. 

Permite evaluar de forma precisa los tiempos de respuesta ante situaciones de frenado imprevisto y concientizar a conductores, motociclistas, ciclistas y peatones sobre cómo cada milisegundo se traduce en metros de distancia de detención recorrida a ciegas.

---

## 🚀 Funcionalidades Principales
1. **Registro Rápido de Participantes:** Formulario ágil con Nombre, Apellido, Correo Electrónico y Rol de Movilidad urbana.
2. **Módulo Educativo de Concientización (Briefing):** Explicación clara sobre el tiempo de reacción humano y la distancia física de frenado antes de presionar el pedal.
3. **Simulador de Semáforo y Frenado de Emergencia:**
   - 3 intentos por usuario para determinar un promedio certero.
   - Detección precisa en milisegundos con `performance.now()`.
   - Sistema de prevención de anticipación ("¡Muy pronto!"), anulando falsas salidas.
   - Efectos sonoros sintetizados nativos con Web Audio API (sin dependencias ni enlaces externos).
4. **Informe de Resultados e Infografía Comparativa:**
   - Clasificación por categorías de reflejos.
   - Cálculo automático de distancia recorrida a 40 km/h y 60 km/h.
   - Equivalencia visual en cantidad de autos estacionados.
5. **Panel de Administración con Contraseña:**
   - Contraseña de acceso por defecto: `vial2026` (modificable desde el panel).
   - Métricas en vivo del stand (total evaluados, récord y promedio general).
   - Tabla interactiva con búsqueda en tiempo real.
   - Exportación de datos de participantes a **CSV / Excel** con formato UTF-8 BOM.
   - Modo pantalla completa para tablets y pantallas táctiles de stand.

---

## 💻 Tecnologías Utilizadas
- **HTML5** semántico y accesible.
- **CSS3 Vanilla** moderno con diseño responsive, paleta oficial GCBA y animaciones fluidas.
- **JavaScript (ES6+)** nativo, autónomo y sin dependencias externas.
- **Web Audio API** para síntesis de audio procedural.
- **LocalStorage API** para almacenamiento seguro offline en stands sin conexión a internet.

---

## 🛠️ Ejecución Local
Simplemente abrir el archivo `index.html` en cualquier navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari). No requiere instalación de servidores ni dependencias.
