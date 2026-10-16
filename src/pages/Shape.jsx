import React from 'react';
import MasterPage from '../components/MasterPage';
import shapeApi from '../apis/shape';

const Shape = () => (
    <MasterPage
        config={{
            title: 'Shape Management',
            singular: 'Shape',
            addButtonLabel: 'Add Shape',
            displayField: 'shape_code',
            api: shapeApi,
            fields: [
                { key: 'shape_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter shape code (e.g. ROUND)' },
                { key: 'shape_name', label: 'Name', required: true, maxLength: 100, placeholder: 'Enter shape name' },
                { key: 'display_order', label: 'Display Order', type: 'number', min: 0, placeholder: '0' },
            ],
        }}
    />
);

export default Shape;
