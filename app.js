// Configuración
const EXCEL_FILE = 'data/FinOps-Azure-Alertado.xlsx';
const STATUS_FILE = 'data/status.json';
const timestamp = document.getElementById('timestamp');

// Actualizar timestamp
timestamp.textContent = new Date().toLocaleString('es-ES');

// Mostrar estado de SharePoint / sincronización
async function loadStatusAndMaybeExcel() {
    const statusSection = document.getElementById('statusSection');
    const excelSection = document.getElementById('excelSection');

    try {
        const res = await fetch(`${STATUS_FILE}?v=${Date.now()}`);
        if (!res.ok) throw new Error(`No se pudo leer status.json (HTTP ${res.status})`);
        const status = await res.json();

        // Render status
        statusSection.innerHTML = `
            <h2>Estado de sincronización</h2>
            <div class="status-row">
                <div class="badge ${status.exists ? 'ok' : 'fail'}">
                    ${status.exists ? 'Existe en SharePoint' : 'No encontrado o sin sincronizar'}
                </div>
                <div class="meta">
                    <div><strong>Última comprobación:</strong> ${status.checked || 'N/D'}</div>
                    <div><strong>Fuente:</strong> ${status.source || 'SharePoint'}</div>
                    <div><strong>Mensaje:</strong> ${status.message || 'Sin mensaje'}</div>
                </div>
            </div>
        `;

        if (status.exists) {
            loadExcelData();
        } else {
            excelSection.innerHTML = `
                <h2>Datos del Excel - FinOps Azure Alertado</h2>
                <div class="error">No se pudo sincronizar el archivo desde SharePoint.<br>${status.message || ''}</div>
            `;
        }
    } catch (error) {
        statusSection.innerHTML = `
            <h2>Estado de sincronización</h2>
            <div class="error">No se pudo leer el estado.<br>Error: ${error.message}</div>
        `;
        excelSection.innerHTML = `
            <h2>Datos del Excel - FinOps Azure Alertado</h2>
            <div class="error">No hay datos porque falló la lectura de estado.</div>
        `;
    }
}

// Función para cargar y mostrar datos del Excel (si está presente en data/)
async function loadExcelData() {
    const excelSection = document.getElementById('excelSection');
    try {
        const response = await fetch(`${EXCEL_FILE}?v=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`No se pudo descargar el Excel (HTTP ${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Obtener la primera hoja
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir a JSON (matriz de filas)
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Generar tabla HTML
        let tableHTML = '<div class="table-container"><table class="excel-table"><thead>';

        if (data.length > 0) {
            // Headers
            tableHTML += '<tr>';
            data[0].forEach((header) => {
                tableHTML += `<th>${header || ''}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';

            // Filas
            for (let i = 1; i < data.length; i++) {
                tableHTML += '<tr>';
                data[i].forEach((cell) => {
                    tableHTML += `<td>${cell !== undefined ? cell : ''}</td>`;
                });
                tableHTML += '</tr>';
            }
            tableHTML += '</tbody></table></div>';

            excelSection.innerHTML = `
                <h2>Datos del Excel - FinOps Azure Alertado</h2>
                <div class="success">Archivo cargado: ${EXCEL_FILE}</div>
                <p class="meta-inline">
                    <strong>Hoja:</strong> ${firstSheetName} |
                    <strong>Registros:</strong> ${data.length - 1}
                </p>
                ${tableHTML}
            `;
        } else {
            throw new Error('El archivo no contiene datos');
        }
    } catch (error) {
        excelSection.innerHTML = `
            <h2>Datos del Excel - FinOps Azure Alertado</h2>
            <div class="error">
                ❌ No se pudo cargar el archivo Excel.<br>
                Error: ${error.message}
            </div>
        `;
        console.error('Error cargando Excel:', error);
    }
}

// Iniciar
loadStatusAndMaybeExcel();

// Actualizar cada 5 minutos
setInterval(() => {
    timestamp.textContent = new Date().toLocaleString('es-ES');
    loadStatusAndMaybeExcel();
}, 300000);
