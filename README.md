# Página Web de Prueba - GitHub Repository Viewer

Esta es una página web de prueba que se conecta al repositorio de GitHub `prosegurfinop/test` y muestra información en tiempo real usando la GitHub API.

## 🚀 Características

- **Información del Repositorio**: Muestra estadísticas como stars, forks, watchers, issues y lenguaje
- **Últimos Commits**: Lista los 5 commits más recientes con autor y fecha
- **Archivos**: Muestra la estructura de archivos del repositorio
- **Diseño Responsivo**: Funciona en desktop, tablets y móviles
- **Actualización Automática**: Se actualiza cada 5 minutos

## 📁 Estructura del Proyecto

```
test-project/
│
├── index.html      # Página principal
├── styles.css      # Estilos y diseño
├── app.js          # Lógica y conexión con GitHub API
└── README.md       # Este archivo
```

## 🛠️ Cómo Usar

### Opción 1: Abrir directamente
1. Navega a la carpeta `test-project`
2. Doble clic en `index.html`
3. Se abrirá en tu navegador predeterminado

### Opción 2: Servidor HTTP con Python
```bash
cd C:\Users\CLX0001848\test-project
python -m http.server 8000
```
Luego abre http://localhost:8000 en tu navegador

### Opción 3: Servidor HTTP con Node.js
```bash
cd C:\Users\CLX0001848\test-project
npx http-server -p 8000
```
Luego abre http://localhost:8000 en tu navegador

### Opción 4: Live Server en VS Code
1. Abre la carpeta en VS Code
2. Instala la extensión "Live Server"
3. Click derecho en `index.html` → "Open with Live Server"

## 🔧 Configuración

Para conectarte a otro repositorio, edita `app.js`:

```javascript
const REPO_OWNER = 'tu-usuario';
const REPO_NAME = 'tu-repositorio';
```

## ⚠️ Notas Importantes

- **Repositorios Privados**: La API pública de GitHub solo puede acceder a repositorios públicos
- **Rate Limit**: GitHub API permite 60 peticiones por hora sin autenticación
- **Autenticación**: Para más peticiones, necesitas un token de acceso personal

## 🔗 GitHub API

Esta aplicación usa:
- `GET /repos/:owner/:repo` - Información del repositorio
- `GET /repos/:owner/:repo/commits` - Lista de commits
- `GET /repos/:owner/:repo/contents` - Contenido del repositorio

Documentación: https://docs.github.com/en/rest

## 🎨 Personalización

Puedes personalizar:
- **Colores**: Edita el gradiente en `styles.css` (línea 9-10)
- **Cantidad de commits**: Cambia `per_page=5` en `app.js`
- **Intervalo de actualización**: Modifica `300000` (5 min) en `app.js`

## 📝 Licencia

Proyecto de prueba - Uso libre
