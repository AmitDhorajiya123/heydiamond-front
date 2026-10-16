import React, { useState, useEffect } from 'react';
import MasterPage from '../components/MasterPage';
import subcategoryApi from '../apis/subcategory';
import categoryApi from '../apis/category';

const Subcategory = () => {
    const [categoryOptions, setCategoryOptions] = useState([]);

    // Load categories for the dropdown + table label lookup
    useEffect(() => {
        let active = true;
        categoryApi.list({ per_page: 100 })
            .then((res) => {
                const rows = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
                if (active) {
                    setCategoryOptions(rows.map((c) => ({
                        value: c.category_id,
                        label: `${c.category_code} - ${c.category_name}`,
                    })));
                }
            })
            .catch(() => { /* toast handled by MasterPage list errors */ });
        return () => { active = false; };
    }, []);

    return (
        <MasterPage
            config={{
                title: 'Subcategory Management',
                singular: 'Subcategory',
                addButtonLabel: 'Add Subcategory',
                displayField: 'subcategory_name',
                api: subcategoryApi,
                fields: [
                    {
                        key: 'category_id',
                        label: 'Category',
                        type: 'select',
                        required: true,
                        valueType: 'number',
                        options: categoryOptions,
                        placeholder: 'Select category',
                    },
                    { key: 'subcategory_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter subcategory code' },
                    { key: 'subcategory_name', label: 'Name', required: true, maxLength: 100, placeholder: 'Enter subcategory name' },
                ],
            }}
        />
    );
};

export default Subcategory;
