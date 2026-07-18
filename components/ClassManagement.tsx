'use client';

import { useState } from 'react';
import ClassList from './ClassList';

interface Class {
    id: number;
    class_name: string;
    age_group: string;
    teacher_name: string;
    assistant_teacher: string;
    room_number: string;
    capacity: number;
    current_enrollment: number;
    status: string;
}

export default function ClassManagement() {
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const handleSelectClass = (cls: Class): void => {
        setEditingClass(cls);
        console.log('Editing class:', cls);
        // You could open a modal or edit form here
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Class Management</h2>
            <ClassList 
                onSelectClass={handleSelectClass}
                refreshTrigger={refreshTrigger}
            />
        </div>
    );
}