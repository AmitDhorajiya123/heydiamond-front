import React from 'react';
import MasterPage from '../components/MasterPage';
import fluorescenceApi from '../apis/fluorescence';

const Fluorescence = () => (
    <MasterPage
        config={{
            title: 'Fluorescence Management',
            singular: 'Fluorescence',
            addButtonLabel: 'Add Fluorescence',
            displayField: 'fluorescence_code',
            api: fluorescenceApi,
            fields: [
                { key: 'fluorescence_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter fluorescence code (e.g. NONE)' },
                { key: 'display_order', label: 'Display Order', type: 'number', min: 0, placeholder: '0' },
            ],
        }}
    />
);

export default Fluorescence;
