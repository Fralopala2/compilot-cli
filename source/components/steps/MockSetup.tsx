import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import React, { type FC, useState } from 'react';
import { setupMocks } from '../../utils/mock-setup.js';

type MockSetupProps = {
  setStep: (step: string) => void;
  config: any;
};

const MockSetup: FC<MockSetupProps> = ({ setStep, config }) => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockOptions = [
    { label: '✅ Setup Mocks', value: 'setup' },
    { label: '🔙 Back', value: 'back' }
  ];

  const handleMockSetup = async () => {
    try {
      setIsSettingUp(true);
      setError(null);

      // Verificar si los mocks están habilitados en la configuración
      if (!config?.services?.mocks?.enabled) {
        setError('Mocks are not enabled in compilot.config.json');
        setIsSettingUp(false);
        return;
      }

      // Ejecutar la configuración de mocks
      await setupMocks(config.services.mocks);

      setSetupComplete(true);
      setIsSettingUp(false);

      // Después de 2 segundos, volver al menú principal
      setTimeout(() => {
        setStep('new');
      }, 2000);
    } catch (err) {
      setError(`Error setting up mocks: ${err instanceof Error ? err.message : String(err)}`);
      setIsSettingUp(false);
    }
  };

  if (isSettingUp) {
    return (
      <Box flexDirection='column'>
        <Box>
          <Spinner type='dots' />
          <Text> Setting up mocks...</Text>
        </Box>
      </Box>
    );
  }

  if (setupComplete) {
    return (
      <Box flexDirection='column'>
        <Text color='green'>✅ Mocks setup completed successfully!</Text>
        <Text color='gray'>Returning to main menu...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection='column'>
        <Text color='red'>❌ {error}</Text>
        <Text color='gray'>Press any key to continue...</Text>
        <SelectInput items={[{ label: '🔙 Back to menu', value: 'back' }]} onSelect={() => setStep('new')} />
      </Box>
    );
  }

  return (
    <Box flexDirection='column'>
      <Text>🎭 Mock Setup</Text>
      <Text color='gray'>This will configure mocks for your project based on your compilot.config.json settings.</Text>
      <Text color='gray'>Current status: {config?.services?.mocks?.enabled ? 'Enabled' : 'Disabled'}</Text>
      <SelectInput
        items={mockOptions}
        indicatorComponent={({ isSelected }) => {
          if (isSelected) {
            return <Text color='red'>{'\u2192 '}</Text>;
          }
          return <Text>{'  '}</Text>;
        }}
        itemComponent={({ isSelected, label }) => {
          if (isSelected) {
            return <Text color='red'>{label}</Text>;
          }
          return <Text color='white'>{label}</Text>;
        }}
        onSelect={(item) => {
          if (item.value === 'setup') {
            handleMockSetup();
          } else if (item.value === 'back') {
            setStep('new');
          }
        }}
      />
    </Box>
  );
};

export default MockSetup;
