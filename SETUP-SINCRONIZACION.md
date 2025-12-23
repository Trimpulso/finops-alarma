# 📋 Guía de Configuración: Sincronización Automática SharePoint → GitHub

## ✅ Ya Implementado

Hemos creado dos soluciones para sincronizar automáticamente el archivo Excel desde SharePoint:

### 1. GitHub Actions (Automático - Opción A)
**Archivo**: `.github/workflows/sync-sharepoint.yml`

Ventajas:
- ✅ Se ejecuta automáticamente cada día a las 08:00 UTC
- ✅ Puedes ejecutarlo manualmente desde Actions
- ✅ Las credenciales están seguras en GitHub Secrets
- ✅ Actualiza automáticamente el repositorio

### 2. Script PowerShell Local (Manual - Opción B)
**Archivo**: `tools/sync-local.ps1`

Ventajas:
- ✅ Control total desde tu máquina
- ✅ Puedes sincronizar cuando lo necesites
- ✅ Usa variables de entorno (seguro)

---

## 🔧 Configuración Paso a Paso

### PASO 1: Obtener la URL de Descarga Directa del Archivo

1. Ve a https://prosegur365.sharepoint.com (accede con clx0001848@prosegur.com)
2. Navega a: **Sitios > OPERACION > Documentos compartidos > General > FinOps > Alertado**
3. Haz clic derecho en `FinOps-Azure-Alertado.xlsx` → **Copiar enlace**
4. La URL debe ser algo como:
   ```
   https://prosegur365.sharepoint.com/sites/OPERACION/Documentos%20compartidos/General/FinOps/Alertado/FinOps-Azure-Alertado.xlsx
   ```

### PASO 2: Configurar GitHub Secrets (Para GitHub Actions)

1. Abre tu repositorio en GitHub: https://github.com/Trimpulso/finops-alarma
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret** y añade estos 3:

| Nombre | Valor |
|--------|-------|
| `SHAREPOINT_USERNAME` | `clx0001848@prosegur.com` |
| `SHAREPOINT_PASSWORD` | `jH7$iEDF&7it` |
| `SHAREPOINT_URL` | La URL del PASO 1 |

> ⚠️ **IMPORTANTE**: Después de hacer esto, **cambia la contraseña en Prosegur 365** ya que fue compartida en texto.

### PASO 3: Verificar GitHub Actions

1. Ve a **Actions** en tu repositorio
2. Busca el workflow **"Sincronizar Excel desde SharePoint"**
3. Haz clic en **Run workflow** para probarlo

### PASO 4: Configurar Script Local (Opcional pero Recomendado)

1. Abre PowerShell como Administrador
2. Establece las variables de entorno:
   ```powershell
   $env:SHAREPOINT_USER = "clx0001848@prosegur.com"
   $env:SHAREPOINT_PASS = "jH7$iEDF&7it"
   $env:SHAREPOINT_EXCEL_URL = "https://prosegur365.sharepoint.com/sites/OPERACION/..."
   ```

3. Ejecuta el script desde `c:\github\alerta`:
   ```powershell
   cd C:\github\alerta
   .\tools\sync-local.ps1
   ```

---

## 📊 Resultado Esperado

Después de ejecutar cualquiera de los dos métodos:

✅ Se descarga `data/FinOps-Azure-Alertado.xlsx`
✅ Se crea `data/status.json` con estado
✅ El dashboard en https://trimpulso.github.io/finops-alarma muestra los datos

---

## 🚀 Próximos Pasos

### Opción Avanzada: Integración Directa con Azure Cost Management

En futuras versiones, podríamos:
1. Integrar directamente con **Azure Cost Management API**
2. Generar alertas automáticas basadas en thresholds
3. Enviar notificaciones a Teams/Slack

---

## 🆘 Troubleshooting

### El workflow falla con error 401/403
- Verifica que las credenciales en GitHub Secrets sean correctas
- Asegúrate de que el usuario tiene acceso a la carpeta de SharePoint

### El archivo dice "No es XLSX válido"
- Puede que recibas la página de login de SharePoint
- Solución: Usa la URL de descarga directa (varias opciones):
  1. Haz clic derecho → Descargar
  2. Copia el enlace directo sin parámetros de sesión

### El script local no funciona
- Verifica que las variables de entorno estén correctamente asignadas
- Ejecuta PowerShell como Administrador
- Revisa permisos de ejecución: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## 📞 Más Información

- Documentación de GitHub Actions: https://docs.github.com/actions
- SharePoint API: https://learn.microsoft.com/sharepoint/dev/general-development/get-to-know-the-sharepoint-rest-service
