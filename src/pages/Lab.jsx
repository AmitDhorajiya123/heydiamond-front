import React from 'react';
import MasterPage from '../components/MasterPage';
import labApi from '../apis/lab';

const Lab = () => (
    <MasterPage
        config={{
            title: 'Lab Management',
            singular: 'Lab',
            addButtonLabel: 'Add Lab',
            displayField: 'lab_code',
            api: labApi,
            fields: [
                { key: 'lab_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter lab code (e.g. GIA)' },
                { key: 'lab_name', label: 'Name', required: true, maxLength: 100, placeholder: 'Enter lab name' },
                { key: 'display_order', label: 'Display Order', type: 'number', min: 0, placeholder: '0' },
            ],
        }}
    />
);

export default Lab;
