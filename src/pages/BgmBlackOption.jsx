import React from 'react';
import MasterPage from '../components/MasterPage';
import bgmBlackOptionApi from '../apis/bgmBlackOption';

const BgmBlackOption = () => (
    <MasterPage
        config={{
            title: 'BGM / Black Option Management',
            singular: 'BGM/Black option',
            addButtonLabel: 'Add BGM/Black Option',
            displayField: 'option_name',
            api: bgmBlackOptionApi,
            fields: [
                { key: 'option_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter option code (e.g. NO_BGM)' },
                { key: 'option_name', label: 'Name', required: true, maxLength: 100, placeholder: 'Enter option name' },
            ],
        }}
    />
);

export default BgmBlackOption;
