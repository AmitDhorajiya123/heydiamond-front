import React from 'react';
import MasterPage from '../components/MasterPage';
import colorApi from '../apis/color';

const Color = () => (
    <MasterPage
        config={{
            title: 'Color Management',
            singular: 'Color',
            addButtonLabel: 'Add Color',
            displayField: 'color_code',
            api: colorApi,
            fields: [
                { key: 'color_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter color code (e.g. D)' },
                { key: 'color_type', label: 'Type', required: true, maxLength: 100, placeholder: 'Enter color type' },
                { key: 'display_order', label: 'Display Order', type: 'number', min: 0, placeholder: '0' },
            ],
        }}
    />
);

export default Color;
