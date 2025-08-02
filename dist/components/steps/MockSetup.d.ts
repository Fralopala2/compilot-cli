import { type FC } from 'react';
type MockSetupProps = {
    setStep: (step: string) => void;
    config: any;
};
declare const MockSetup: FC<MockSetupProps>;
export default MockSetup;
