import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
export const setupMocks = async (config) => {
    if (!config.enabled) {
        throw new Error('Mocks are not enabled in configuration');
    }
    // 1. Crear directorio de datos de mocks si no existe
    await createMockDirectories(config);
    // 2. Crear archivos de configuración básicos
    await createMockFiles(config);
    // 3. Instalar dependencias si es necesario
    await installMockDependencies(config);
    // 4. Configurar el plugin en el archivo de configuración
    await configureMockPlugin(config);
};
const createMockDirectories = async (config) => {
    const dataDir = path.resolve(config.data);
    const serverDir = path.dirname(path.resolve(config.server));
    try {
        await fs.mkdir(dataDir, { recursive: true });
        await fs.mkdir(serverDir, { recursive: true });
    }
    catch (error) {
        throw new Error(`Failed to create mock directories: ${error}`);
    }
};
const createMockFiles = async (config) => {
    // Crear archivo de servidor de mocks básico
    const serverContent = `// Mock server setup
export default {
  // Add your mock configurations here
  '/api/example': {
    method: 'GET',
    response: {
      message: 'Hello from mock server!'
    }
  }
};
`;
    // Crear datos de ejemplo
    const exampleDataContent = `export const exampleData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]
};
`;
    try {
        await fs.writeFile(path.resolve(config.server), serverContent, 'utf8');
        await fs.writeFile(path.join(config.data, 'example.js'), exampleDataContent, 'utf8');
    }
    catch (error) {
        throw new Error(`Failed to create mock files: ${error}`);
    }
};
const installMockDependencies = async (config) => {
    return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['install', config.autoSetup.plugin, '--save-dev'], {
            stdio: 'inherit',
            shell: true
        });
        npm.on('close', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`Failed to install ${config.autoSetup.plugin}`));
            }
        });
        npm.on('error', (error) => {
            reject(new Error(`Failed to spawn npm: ${error.message}`));
        });
    });
};
const configureMockPlugin = async (config) => {
    const configPath = path.resolve(config.autoSetup.configPath);
    try {
        // Verificar si el archivo de configuración existe
        await fs.access(configPath);
        // Leer el contenido actual
        const content = await fs.readFile(configPath, 'utf8');
        // Verificar si ya está configurado
        if (content.includes(config.autoSetup.plugin)) {
            return; // Ya está configurado
        }
        // Agregar configuración básica (esto dependerá del tipo de proyecto)
        // Por ahora solo mostramos un mensaje
        console.log(`Please manually add ${config.autoSetup.plugin} to your ${config.autoSetup.configPath}`);
    }
    catch (error) {
        // El archivo no existe o no se puede leer
        console.log(`Configuration file ${config.autoSetup.configPath} not found. Please create it and add ${config.autoSetup.plugin} configuration.`);
    }
};
