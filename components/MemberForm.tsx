'use client';

import { useState } from 'react';
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
    status: string;
}

interface MemberFormProps {
    onSuccess: () => void;
    initialData?: Member | null;
}

interface FormData {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    parent_name: string;
    phone: string;
    email: string;
    address: string;
    medical_notes: string;
}

export default function MemberForm({ onSuccess, initialData = null }: MemberFormProps) {
    const [formData, setFormData] = useState<FormData>(
        initialData || {
            first_name: '',
            last_name: '',
            date_of_birth: '',
            gender: '',
            parent_name: '',
            phone: '',
            email: '',
            address: '',
            medical_notes: '',
        }
    );
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData ? `/api/members/${initialData.id}` : '/api/members';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save member');
            }

            toast.success(initialData ? 'Member updated successfully!' : 'Member added successfully!');
            onSuccess();
            
            if (!initialData) {
                setFormData({
                    first_name: '',
                    last_name: '',
                    date_of_birth: '',
                    gender: '',
                    parent_name: '',
                    phone: '',
                    email: '',
                    address: '',
                    medical_notes: '',
                });
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                        type="text"
                        name="first_name"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input
                        type="text"
                        name="last_name"
                        required
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                    <input
                        type="date"
                        name="date_of_birth"
                        required
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Parent/Guardian Name</label>
                <input
                    type="text"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Medical Notes</label>
                <textarea
                    name="medical_notes"
                    rows={2}
                    value={formData.medical_notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
                {loading ? 'Saving...' : initialData ? 'Update Member' : 'Add Member'}
            </button>
        </form>
    );
}