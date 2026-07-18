'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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

interface ClassListProps {
    onSelectClass: (cls: Class) => void;
    refreshTrigger?: number;
}

interface ClassFormData {
    class_name: string;
    age_group: string;
    teacher_name: string;
    assistant_teacher: string;
    room_number: string;
    capacity: number;
}

export default function ClassList({ onSelectClass, refreshTrigger = 0 }: ClassListProps) {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [formData, setFormData] = useState<ClassFormData>({
        class_name: '',
        age_group: '',
        teacher_name: '',
        assistant_teacher: '',
        room_number: '',
        capacity: 15
    });

    useEffect(() => {
        loadClasses();
    }, [refreshTrigger]);

    const loadClasses = async (): Promise<void> => {
        try {
            setLoading(true);
            const res = await fetch('/api/classes');
            if (!res.ok) throw new Error('Failed to load classes');
            const data = await res.json();
            setClasses(data);
        } catch (error) {
            toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create class');
            }

            toast.success('Class created successfully!');
            setShowAddForm(false);
            setFormData({
                class_name: '',
                age_group: '',
                teacher_name: '',
                assistant_teacher: '',
                room_number: '',
                capacity: 15
            });
            loadClasses();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create class');
        }
    };

    const handleDeleteClass = async (id: number): Promise<void> => {
        if (!confirm('Are you sure you want to delete this class? This will also remove all placements.')) return;

        try {
            const res = await fetch(`/api/classes/${id}`, { 
                method: 'DELETE' 
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to delete class');
            }
            toast.success('Class deleted successfully');
            loadClasses();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete class');
        }
    };

    const getStatusColor = (status: string, currentEnrollment: number, capacity: number): string => {
        if (status === 'Inactive') return 'bg-gray-100 text-gray-800';
        if (currentEnrollment >= capacity) return 'bg-red-100 text-red-800';
        if (currentEnrollment >= capacity * 0.8) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    if (loading) return <div className="text-center py-4">Loading classes...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Classes</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    {showAddForm ? 'Cancel' : '+ Add Class'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Class Name *</label>
                            <input
                                type="text"
                                name="class_name"
                                required
                                value={formData.class_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Grades 1-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Age Group</label>
                            <input
                                type="text"
                                name="age_group"
                                value={formData.age_group}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 6-8 years"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Teacher</label>
                            <input
                                type="text"
                                name="teacher_name"
                                value={formData.teacher_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Teacher name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Assistant Teacher</label>
                            <input
                                type="text"
                                name="assistant_teacher"
                                value={formData.assistant_teacher}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Assistant teacher name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Room Number</label>
                            <input
                                type="text"
                                name="room_number"
                                value={formData.room_number}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 101"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Capacity</label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                                max="50"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                    >
                        Create Class
                    </button>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Class Name</th>
                            <th className="px-4 py-2 text-left">Age Group</th>
                            <th className="px-4 py-2 text-left">Teacher</th>
                            <th className="px-4 py-2 text-left">Enrollment</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((cls) => (
                            <tr key={cls.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">{cls.class_name}</td>
                                <td className="px-4 py-2">{cls.age_group || '-'}</td>
                                <td className="px-4 py-2">
                                    <div className="text-sm">
                                        <div>{cls.teacher_name || '-'}</div>
                                        {cls.assistant_teacher && (
                                            <div className="text-gray-500 text-xs">
                                                Asst: {cls.assistant_teacher}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                        cls.status, 
                                        cls.current_enrollment || 0, 
                                        cls.capacity
                                    )}`}>
                                        {cls.current_enrollment || 0} / {cls.capacity}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        cls.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        cls.status === 'Full' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {cls.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => onSelectClass(cls)}
                                        className="text-blue-600 hover:text-blue-800 mr-2 text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClass(cls.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {classes.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        No classes created yet. Add your first class above!
                    </div>
                )}
            </div>
        </div>
    );
}