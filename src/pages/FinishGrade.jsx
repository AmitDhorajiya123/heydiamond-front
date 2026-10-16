import React from 'react';
import MasterPage from '../components/MasterPage';
import finishGradeApi from '../apis/finishGrade';

const FinishGrade = () => (
    <MasterPage
        config={{
            title: 'Finish Grade Management',
            singular: 'Finish grade',
            addButtonLabel: 'Add Finish Grade',
            displayField: 'finish_grade_code',
            api: finishGradeApi,
            fields: [
                { key: 'finish_grade_code', label: 'Code', required: true, maxLength: 50, mono: true, placeholder: 'Enter finish grade code (e.g. EX)' },
                { key: 'finish_grade_name', label: 'Name', required: true, maxLength: 100, placeholder: 'Enter finish grade name' },
                { key: 'grade_group', label: 'Grade Group', required: true, maxLength: 50, placeholder: 'Enter grade group' },
                { key: 'display_order', label: 'Display Order', type: 'number', min: 0, placeholder: '0' },
            ],
        }}
    />
);

export default FinishGrade;
