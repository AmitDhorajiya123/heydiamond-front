import React from 'react';
import MasterPage from '../components/MasterPage';
import categoryApi from '../apis/category';

const Category = () => (
    <MasterPage
        config={{
            title: 'Category Management',
            singular: 'Category',
            addButtonLabel: 'Add Category',
            displayField: 'category_name',
            api: categoryApi,
            fields: [
                { key: 'category_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter category code' },
                { key: 'category_name', label: 'Name', required: true, maxLength: 100, placeholder: 'Enter category name' },
            ],
        }}
    />
);

export default Category;
