import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export interface MockConfig {
  enabled: boolean;
  data: string;
  server: string;
  autoSetup: {
    plugin: string;
    configPath: string;
  };
}

export const setupMocks = async (config: MockConfig): Promise<void> => {
  if (!config.enabled) {
    throw new Error('Mocks are not enabled in configuration');
  }

  // 1. Crear directorio de datos de mocks si no existe
  await createMockDirectories(config);

  // 2. Crear archivos de configuracion basicos
  await createMockFiles(config);

  // 3. Instalar dependencias si se necesita
  await installMockDependencies(config);

  // 4. Configurar el plugin en el archivo de configuracion
  await configureMockPlugin(config);
};

const createMockDirectories = async (config: MockConfig): Promise<void> => {
  const dataDir = path.resolve(config.data);
  const serverDir = path.dirname(path.resolve(config.server));

  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(serverDir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create mock directories: ${error}`);
  }
};

const createMockFiles = async (config: MockConfig): Promise<void> => {
  // Crear archivo de servidor de mocks basico
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
  } catch (error) {
    throw new Error(`Failed to create mock files: ${error}`);
  }
};

const installMockDependencies = async (config: MockConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install', config.autoSetup.plugin, '--save-dev'], {
      stdio: 'inherit',
      shell: true
    });

    npm.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Failed to install ${config.autoSetup.plugin}`));
      }
    });

    npm.on('error', (error) => {
      reject(new Error(`Failed to spawn npm: ${error.message}`));
    });
  });
};

const configureMockPlugin = async (config: MockConfig): Promise<void> => {
  const configPath = path.resolve(config.autoSetup.configPath);

  try {
    // Verificar si el archivo de configuracion esta
    await fs.access(configPath);

    // Leer el contenido actual
    const content = await fs.readFile(configPath, 'utf8');

    // Verificar si ya esta configurado
    if (content.includes(config.autoSetup.plugin)) {
      return; // Ya esta configurado
    }

    // Agregar configuración básica (dependera de cada proyecto)
    // Mostrar solo mensaje
    console.log(`Please manually add ${config.autoSetup.plugin} to your ${config.autoSetup.configPath}`);
  } catch (_error) {
    // El archivo no existe o no se puede leer
    console.log(
      `Configuration file ${config.autoSetup.configPath} not found. Please create it and add ${config.autoSetup.plugin} configuration.`
    );
  }
};
