import React from 'react';
import MasterPage from '../components/MasterPage';
import sizeRangeApi from '../apis/sizeRange';

const SizeRange = () => (
    <MasterPage
        config={{
            title: 'Size Range Management',
            singular: 'Size range',
            addButtonLabel: 'Add Size Range',
            displayField: 'size_range_code',
            api: sizeRangeApi,
            fields: [
                { key: 'size_range_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter size range code (e.g. 1ct)' },
                { key: 'range_type', label: 'Range Type', required: true, maxLength: 50, placeholder: 'Enter range type' },
                { key: 'min_carat', label: 'Min Carat', type: 'decimal', required: true, min: 0, step: '0.001', placeholder: '0.000' },
                { key: 'max_carat', label: 'Max Carat', type: 'decimal', required: true, min: 0, step: '0.001', placeholder: '0.000' },
                { key: 'display_order', label: 'Display Order', type: 'number', min: 0, placeholder: '0' },
            ],
        }}
    />
);

export default SizeRange;
