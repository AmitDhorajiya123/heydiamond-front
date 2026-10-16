import React from 'react';
import MasterPage from '../components/MasterPage';
import clarityApi from '../apis/clarity';

const Clarity = () => (
    <MasterPage
        config={{
            title: 'Clarity Management',
            singular: 'Clarity',
            addButtonLabel: 'Add Clarity',
            displayField: 'clarity_code',
            api: clarityApi,
            fields: [
                { key: 'clarity_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter clarity code (e.g. VS1)' },
                { key: 'display_order', label: 'Display Order', type: 'number', min: 0, placeholder: '0' },
            ],
        }}
    />
);

export default Clarity;
