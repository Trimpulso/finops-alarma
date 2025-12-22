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
        // Intentar leer status.json (opcional)
        let status = { exists: false, checked: 'N/D', source: 'SharePoint', message: 'Aún no sincronizado desde SharePoint' };
        try {
            const res = await fetch(`${STATUS_FILE}?v=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) status = await res.json();
        } catch {}

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

        // Independientemente del estado de SharePoint, comprobar si hay un Excel válido en el repo
        const probe = await probeExcelInRepo();
        if (probe.ok) {
            // Mostrar además que está listo en el repositorio
            excelSection.innerHTML = '<div class="loading">Cargando datos del Excel...</div>';
            await renderExcelFromBuffer(probe.buffer);
        } else {
            excelSection.innerHTML = `
                <h2>Datos del Excel - FinOps Azure Alertado</h2>
                <div class="error">${probe.message}</div>
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

// Comprueba si el Excel existe en el repo y tiene cabecera ZIP (PK)
async function probeExcelInRepo() {
    try {
        const response = await fetch(`${EXCEL_FILE}?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return { ok: false, message: `No se encontró el archivo en el repositorio (HTTP ${response.status})` };
        const buffer = await response.arrayBuffer();
        const header = new Uint8Array(buffer.slice(0, 4));
        const isZip = header[0] === 0x50 && header[1] === 0x4b; // 'PK'
        if (!isZip) return { ok: false, message: 'El archivo descargado no es un XLSX válido (parece HTML de login u otro formato).' };
        return { ok: true, buffer };
    } catch (e) {
        return { ok: false, message: `Fallo al comprobar el archivo: ${e.message}` };
    }
}

// Renderiza la tabla a partir de un ArrayBuffer XLSX ya validado
async function renderExcelFromBuffer(arrayBuffer) {
    const excelSection = document.getElementById('excelSection');
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length === 0) throw new Error('El archivo no contiene datos');

    let tableHTML = '<div class="table-container"><table class="excel-table"><thead><tr>';
    data[0].forEach((header) => { tableHTML += `<th>${header || ''}</th>`; });
    tableHTML += '</tr></thead><tbody>';
    for (let i = 1; i < data.length; i++) {
        tableHTML += '<tr>';
        data[i].forEach((cell) => { tableHTML += `<td>${cell !== undefined ? cell : ''}</td>`; });
        tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table></div>';

    excelSection.innerHTML = `
        <h2>Datos del Excel - FinOps Azure Alertado</h2>
        <div class="success">Archivo cargado: ${EXCEL_FILE}</div>
        <p class="meta-inline"><strong>Hoja:</strong> ${firstSheetName} | <strong>Registros:</strong> ${data.length - 1}</p>
        ${tableHTML}
    `;
}

// Iniciar
loadStatusAndMaybeExcel();

// Actualizar cada 5 minutos
setInterval(() => {
    timestamp.textContent = new Date().toLocaleString('es-ES');
    loadStatusAndMaybeExcel();
}, 300000);
