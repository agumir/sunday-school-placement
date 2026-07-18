'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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

interface MemberListProps {
    onSelectMember: (member: Member) => void;
    refreshTrigger?: number;
}

export default function MemberList({ onSelectMember, refreshTrigger = 0 }: MemberListProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadMembers();
    }, [refreshTrigger]);

    const loadMembers = async (): Promise<void> => {
        try {
            setLoading(true);
            const res = await fetch('/api/members');
            if (!res.ok) throw new Error('Failed to load members');
            const data = await res.json();
            setMembers(data);
        } catch (error) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (!confirm('Are you sure you want to delete this member?')) return;

        try {
            const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to delete');
            }
            toast.success('Member deleted successfully');
            loadMembers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete');
        }
    };

    const calculateAge = (dateOfBirth: string): number => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Inactive':
                return 'bg-red-100 text-red-800';
            case 'Transferred':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center py-4">Loading members...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Age</th>
                        <th className="px-4 py-2 text-left">Parent</th>
                        <th className="px-4 py-2 text-left">Classes</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => (
                        <tr key={member.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">
                                {member.first_name} {member.last_name}
                            </td>
                            <td className="px-4 py-2">{calculateAge(member.date_of_birth)} years</td>
                            <td className="px-4 py-2">{member.parent_name || '-'}</td>
                            <td className="px-4 py-2">{member.class_count || 0}</td>
                            <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(member.status)}`}>
                                    {member.status}
                                </span>
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => onSelectMember(member)}
                                    className="text-blue-600 hover:text-blue-800 mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {members.length === 0 && (
                <div className="text-center py-4 text-gray-500">No members found</div>
            )}
        </div>
    );
}