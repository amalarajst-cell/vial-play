# VIAL PLAY - Test de Tiempo de Reacción (Mobile First) 📱⚡
### Stand de Seguridad Vial | Gobierno de la Ciudad de Buenos Aires

**Dirección General de Seguridad Vial**  
**Gerencia de Educación y Convivencia Vial**

---

## 📋 Descripción del Proyecto
Aplicación web mobile-first optimizada para **celulares y dispositivos móviles**, diseñada para evaluar y concientizar sobre el tiempo psicomotriz de reacción, la toma de decisiones al volante y el peligro crítico del uso del celular mientras se conduce.

Utiliza el **mismo motor y sistema de niveles que el Test de Reacción de Ruleta Vial**.

---

## 🚀 Flujo de la Aplicación

### 1. Sección de Logueo / Registro de Participante (Obligatorio)
- **Acceso requerido:** No es posible ingresar al test sin completar primero el registro de piloto.
- Datos solicitados:
  - **Nombre y Apellido / Apodo** (Requerido)
  - **Email de contacto** (Opcional)
  - **Rol de movilidad urbana:** Auto 🚗, Moto 🏍️, Bici 🚲, Peatón 🚶
  - **Avatar de Piloto:** Selector interactivo con iconos oficiales.
- Botón **"INGRESAR AL TEST DE REACCIÓN ➔"**.
- En el header y barra superior se muestra el perfil activo, con opción de **"Cambiar Piloto / Salir"** para volver a la pantalla de logueo.

---

### 2. Sección del Test de Reacción (Sistema Ruleta Vial)
Cuenta con **3 niveles interactivos**:

1. **Nivel 1: Reflejos Cromáticos (Colores)**
   - 4 botones: **Rojo** (Detención), **Amarillo** (Precaución), **Verde** (Avanzar), **Azul** (Información).
   - Estímulo sorpresa con retardo aleatorio (1.3s a 3.1s).
   - Medición precisa en milisegundos con `performance.now()`.
   - Sistema anti-anticipación: detecta falsas salidas si se pulsa antes de tiempo.

2. **Nivel 2: Toma de Decisiones Viales**
   - 4 acciones viales: **Frenar**, **Soltar el Acelerador**, **Esquivar** u **Omitir**.
   - Situaciones reales: Señal de PARE, semáforos, peatones en senda, lomos de burro, zonas escolares, calzada resbaladiza, conos de obra, baches profundos, ciclistas.

3. **Nivel 3: Distracción Cognitiva al Volante**
   - Simulación de peligros imprevistos en calzada combinados con **notificaciones emergentes y sonidos reales de WhatsApp / celular**.
   - Mezcla aleatoria de los botones al momento del estímulo para emular la pérdida de foco y confusión mental que provoca mirar el teléfono al conducir.

---

### 3. Matriz de Distancia a Ciegas e Informe Pedagógico
- Cálculo en tiempo real de los **metros recorridos sin frenar** según el tiempo de reacción:
  - **40 km/h** (Calles y zonas escolares) = $11.11 \times t$ metros.
  - **60 km/h** (Avenidas urbanas) = $16.67 \times t$ metros.
  - **100 km/h** (Autopistas) = $27.78 \times t$ metros.
- Tarjeta de resultados con promedio, mejor tiempo, aciertos y devolución personalizada.

---

### 4. Panel de Administración y Stand
- Clave de operador: `vial2026`
- Contador de participantes, récord del stand y promedio general.
- Historial completo en vivo.
- Exportación a planilla **Excel / CSV** con codificación UTF-8 BOM.

---

## 📲 Cómo Abrir en el Celular
1. Hacé doble clic en `iniciar_servidor_celular.bat`.
2. En la ventana negra verás la dirección IP local (ejemplo: `http://10.67.145.121:8080/`).
3. Conectá tu celular a la misma red Wi-Fi y abrí esa dirección en Chrome o Safari.
4. También podés abrir directamente `index.html` en el navegador de tu computadora.