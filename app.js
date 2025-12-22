// Configuración
const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = 'prosegurfinop';
const REPO_NAME = 'test';

// Elementos del DOM
const repoInfo = document.getElementById('repoInfo');
const commitsSection = document.getElementById('commitsSection');
const filesSection = document.getElementById('filesSection');
const timestamp = document.getElementById('timestamp');

// Actualizar timestamp
timestamp.textContent = new Date().toLocaleString('es-ES');

// Función para hacer peticiones a GitHub API
async function fetchGitHub(endpoint) {
    try {
        const response = await fetch(`${GITHUB_API}${endpoint}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching from GitHub:', error);
        throw error;
    }
}

// Obtener información del repositorio
async function loadRepoInfo() {
    try {
        const repo = await fetchGitHub(`/repos/${REPO_OWNER}/${REPO_NAME}`);
        
        const infoHTML = `
            <div class="repo-card">
                <h3>${repo.name}</h3>
                <p>${repo.description || 'Sin descripción disponible'}</p>
                
                <div class="repo-stats">
                    <div class="stat">
                        <span>⭐</span>
                        <strong>${repo.stargazers_count}</strong> Stars
                    </div>
                    <div class="stat">
                        <span>🍴</span>
                        <strong>${repo.forks_count}</strong> Forks
                    </div>
                    <div class="stat">
                        <span>👁️</span>
                        <strong>${repo.watchers_count}</strong> Watchers
                    </div>
                    <div class="stat">
                        <span>📂</span>
                        <strong>${repo.open_issues_count}</strong> Issues
                    </div>
                    <div class="stat">
                        <span>📝</span>
                        <strong>${repo.language || 'N/A'}</strong>
                    </div>
                </div>
                
                <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                    Creado: ${new Date(repo.created_at).toLocaleDateString('es-ES')} | 
                    Última actualización: ${new Date(repo.updated_at).toLocaleDateString('es-ES')}
                </p>
                
                <p style="margin-top: 10px;">
                    <a href="${repo.html_url}" target="_blank" 
                       style="color: #0969da; text-decoration: none; font-weight: bold;">
                        🔗 Ver en GitHub →
                    </a>
                </p>
            </div>
        `;
        
        repoInfo.innerHTML = `<h2>Información del Repositorio</h2>${infoHTML}`;
    } catch (error) {
        repoInfo.innerHTML = `
            <h2>Información del Repositorio</h2>
            <div class="error">
                ❌ No se pudo cargar la información del repositorio.<br>
                Error: ${error.message}<br>
                <small>El repositorio puede ser privado o no existir.</small>
            </div>
        `;
    }
}

// Obtener últimos commits
async function loadCommits() {
    try {
        const commits = await fetchGitHub(`/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=5`);
        
        const commitsHTML = commits.map(commit => `
            <li class="commit-item">
                <div class="commit-message">${commit.commit.message}</div>
                <div class="commit-meta">
                    <span class="commit-author">
                        👤 ${commit.commit.author.name}
                    </span>
                    <span>
                        📅 ${new Date(commit.commit.author.date).toLocaleDateString('es-ES')}
                    </span>
                    <span>
                        🔑 ${commit.sha.substring(0, 7)}
                    </span>
                </div>
            </li>
        `).join('');
        
        commitsSection.innerHTML = `
            <h2>Últimos Commits</h2>
            <ul class="commits-list">${commitsHTML}</ul>
        `;
    } catch (error) {
        commitsSection.innerHTML = `
            <h2>Últimos Commits</h2>
            <div class="error">
                ❌ No se pudieron cargar los commits.<br>
                Error: ${error.message}
            </div>
        `;
    }
}

// Obtener archivos del repositorio
async function loadFiles() {
    try {
        const contents = await fetchGitHub(`/repos/${REPO_OWNER}/${REPO_NAME}/contents`);
        
        const filesHTML = contents.map(item => {
            const icon = item.type === 'dir' ? '📁' : '📄';
            return `
                <li class="file-item" onclick="window.open('${item.html_url}', '_blank')">
                    <span class="file-icon">${icon}</span>
                    <span class="file-name">${item.name}</span>
                    <span style="margin-left: auto; color: #666; font-size: 0.85em;">
                        ${item.type === 'dir' ? 'Directorio' : (item.size ? `${(item.size / 1024).toFixed(1)} KB` : '')}
                    </span>
                </li>
            `;
        }).join('');
        
        filesSection.innerHTML = `
            <h2>Archivos del Repositorio</h2>
            <ul class="files-list">${filesHTML}</ul>
        `;
    } catch (error) {
        filesSection.innerHTML = `
            <h2>Archivos del Repositorio</h2>
            <div class="error">
                ❌ No se pudieron cargar los archivos.<br>
                Error: ${error.message}
            </div>
        `;
    }
}

// Cargar todos los datos al iniciar
async function init() {
    console.log(`Conectando a GitHub: ${REPO_OWNER}/${REPO_NAME}`);
    
    // Cargar datos en paralelo
    await Promise.all([
        loadRepoInfo(),
        loadCommits(),
        loadFiles()
    ]);
    
    console.log('Datos cargados exitosamente');
}

// Iniciar la aplicación
init();

// Actualizar cada 5 minutos
setInterval(() => {
    timestamp.textContent = new Date().toLocaleString('es-ES');
    init();
}, 300000);
