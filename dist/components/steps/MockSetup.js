import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useState } from 'react';
import Spinner from 'ink-spinner';
import { setupMocks } from '../../utils/mock-setup.js';
const MockSetup = ({ setStep, config }) => {
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [setupComplete, setSetupComplete] = useState(false);
    const [error, setError] = useState(null);
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
        }
        catch (err) {
            setError(`Error setting up mocks: ${err instanceof Error ? err.message : String(err)}`);
            setIsSettingUp(false);
        }
    };
    if (isSettingUp) {
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(Box, null,
                React.createElement(Spinner, { type: "dots" }),
                React.createElement(Text, null, " Setting up mocks..."))));
    }
    if (setupComplete) {
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, { color: "green" }, "\u2705 Mocks setup completed successfully!"),
            React.createElement(Text, { color: "gray" }, "Returning to main menu...")));
    }
    if (error) {
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, { color: "red" },
                "\u274C ",
                error),
            React.createElement(Text, { color: "gray" }, "Press any key to continue..."),
            React.createElement(SelectInput, { items: [{ label: '🔙 Back to menu', value: 'back' }], onSelect: () => setStep('new') })));
    }
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, null, "\uD83C\uDFAD Mock Setup"),
        React.createElement(Text, { color: "gray" }, "This will configure mocks for your project based on your compilot.config.json settings."),
        React.createElement(Text, { color: "gray" },
            "Current status: ",
            config?.services?.mocks?.enabled ? 'Enabled' : 'Disabled'),
        React.createElement(SelectInput, { items: mockOptions, indicatorComponent: ({ isSelected }) => {
                if (isSelected) {
                    return React.createElement(Text, { color: 'red' }, '\u2192 ');
                }
                return React.createElement(Text, null, '  ');
            }, itemComponent: ({ isSelected, label }) => {
                if (isSelected) {
                    return React.createElement(Text, { color: 'red' }, label);
                }
                return React.createElement(Text, { color: 'white' }, label);
            }, onSelect: (item) => {
                if (item.value === 'setup') {
                    handleMockSetup();
                }
                else if (item.value === 'back') {
                    setStep('new');
                }
            } })));
};
export default MockSetup;
