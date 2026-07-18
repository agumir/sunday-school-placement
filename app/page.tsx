'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import MemberForm from '@/components/MemberForm';
import MemberList from '@/components/MemberList';
import PlacementDashboard from '@/components/PlacementDashboard';
import ClassList from '@/components/ClassList';

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

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    parent_name: string;
    phone: string;
    email: string;
    address: string;
    medical_notes: string;
    enrollment_date: string;
    status: string;
    class_count?: number;
    classes?: string;
}

export default function Home() {
    const [activeTab, setActiveTab] = useState<'members' | 'classes' | 'placement'>('members');
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const handleMemberSuccess = (): void => {
        setEditingMember(null);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleClassSelect = (cls: Class): void => {
        console.log('Edit class:', cls);
        // Add your edit logic here
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            
            <header className="bg-blue-600 text-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold">Sunday School Member Placement</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6 border-b">
                    <nav className="flex space-x-4">
                        <button
                            onClick={() => {
                                setActiveTab('members');
                                setEditingMember(null);
                            }}
                            className={`px-4 py-2 font-medium ${
                                activeTab === 'members'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Members
                        </button>
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`px-4 py-2 font-medium ${
                                activeTab === 'classes'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Classes
                        </button>
                        <button
                            onClick={() => setActiveTab('placement')}
                            className={`px-4 py-2 font-medium ${
                                activeTab === 'placement'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Placement
                        </button>
                    </nav>
                </div>

                {activeTab === 'members' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingMember ? 'Edit Member' : 'Add New Member'}
                            </h2>
                            <MemberForm
                                initialData={editingMember}
                                onSuccess={handleMemberSuccess}
                            />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Member List</h2>
                            <MemberList 
                                onSelectMember={setEditingMember} 
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <ClassList 
                            onSelectClass={handleClassSelect}
                            refreshTrigger={refreshTrigger}
                        />
                    </div>
                )}

                {activeTab === 'placement' && (
                    <PlacementDashboard />
                )}
            </main>
        </div>
    );
}