import React from 'react';
import MasterPage from '../components/MasterPage';
import locationApi from '../apis/location';

const Location = () => (
    <MasterPage
        config={{
            title: 'Location Management',
            singular: 'Location',
            addButtonLabel: 'Add Location',
            displayField: 'location_code',
            // Locations API uses plain numeric IDs (not encrypted)
            idKey: 'location_id',
            api: locationApi,
            fields: [
                { key: 'location_code', label: 'Code', required: true, maxLength: 10, mono: true, placeholder: 'Enter location code (e.g. INDIA)' },
                { key: 'location_name', label: 'Name', required: true, maxLength: 100, placeholder: 'Enter location name' },
                { key: 'display_order', label: 'Display Order', type: 'number', placeholder: '0' },
            ],
        }}
    />
);

export default Location;
