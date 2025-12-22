// Configuración
const EXCEL_FILE = 'FinOps-Azure-Alertado.xlsx';
const timestamp = document.getElementById('timestamp');

// Actualizar timestamp
timestamp.textContent = new Date().toLocaleString('es-ES');

// Función para cargar y mostrar datos del Excel
async function loadExcelData() {
    try {
        const response = await fetch(EXCEL_FILE);
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

            const excelSection = document.getElementById('excelSection');
            excelSection.innerHTML = `
                <h2>📈 Datos del Excel - FinOps Azure Alertado</h2>
                <div class="success">Archivo cargado exitosamente: ${EXCEL_FILE}</div>
                <p style="margin: 15px 0; color: #666;">
                    <strong>Hoja:</strong> ${firstSheetName} |
                    <strong>Registros:</strong> ${data.length - 1}
                </p>
                ${tableHTML}
            `;
        } else {
            throw new Error('El archivo no contiene datos');
        }
    } catch (error) {
        const excelSection = document.getElementById('excelSection');
        excelSection.innerHTML = `
            <h2>📈 Datos del Excel - FinOps Azure Alertado</h2>
            <div class="error">
                ❌ No se pudo cargar el archivo Excel.<br>
                Error: ${error.message}
            </div>
        `;
        console.error('Error cargando Excel:', error);
    }
}

// Iniciar la aplicación
loadExcelData();

// Actualizar cada 5 minutos
setInterval(() => {
    timestamp.textContent = new Date().toLocaleString('es-ES');
    loadExcelData();
}, 300000);
