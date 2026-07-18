'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    status: string;
}

interface Class {
    id: number;
    class_name: string;
    capacity: number;
    current_enrollment: number;
    status: string;
}

interface Placement {
    id: number;
    member_id: number;
    class_id: number;
    placement_date: string;
    status: string;
    notes: string;
    member_name: string;
    class_name: string;
    date_of_birth: string;
    age: number;
}

export default function PlacementDashboard() {
    const [members, setMembers] = useState<Member[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [placements, setPlacements] = useState<Placement[]>([]);
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (): Promise<void> => {
        try {
            const [membersRes, classesRes, placementsRes] = await Promise.all([
                fetch('/api/members'),
                fetch('/api/classes'),
                fetch('/api/placement')
            ]);

            setMembers(await membersRes.json());
            setClasses(await classesRes.json());
            setPlacements(await placementsRes.json());
        } catch (error) {
            toast.error('Failed to load data');
        }
    };

    const handlePlacement = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/placement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    member_id: parseInt(selectedMember),
                    class_id: parseInt(selectedClass),
                    notes
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to place member');
            }

            toast.success('Member placed successfully!');
            setSelectedMember('');
            setSelectedClass('');
            setNotes('');
            loadData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to place member');
        } finally {
            setLoading(false);
        }
    };

    const availableMembers = members.filter(m => m.status === 'Active');
    const availableClasses = classes.filter(c => 
        c.status === 'Active' && c.current_enrollment < c.capacity
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Place Member in Class</h3>
                <form onSubmit={handlePlacement} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Member *</label>
                        <select
                            required
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a member</option>
                            {availableMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.first_name} {member.last_name}
                                </option>
                            ))}
                        </select>
                        {availableMembers.length === 0 && (
                            <p className="text-sm text-yellow-600 mt-1">No active members available</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Select Class *</label>
                        <select
                            required
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a class</option>
                            {availableClasses.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.class_name} ({cls.current_enrollment}/{cls.capacity})
                                </option>
                            ))}
                        </select>
                        {availableClasses.length === 0 && (
                            <p className="text-sm text-yellow-600 mt-1">No available classes with capacity</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any special notes about this placement"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || availableMembers.length === 0 || availableClasses.length === 0}
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                    >
                        {loading ? 'Placing...' : 'Place Member in Class'}
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Current Placements</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Member</th>
                                <th className="px-4 py-2 text-left">Age</th>
                                <th className="px-4 py-2 text-left">Class</th>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {placements.map((placement) => (
                                <tr key={placement.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{placement.member_name}</td>
                                    <td className="px-4 py-2">{Math.floor(placement.age)} years</td>
                                    <td className="px-4 py-2">{placement.class_name}</td>
                                    <td className="px-4 py-2">
                                        {new Date(placement.placement_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            {placement.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {placements.length === 0 && (
                        <div className="text-center py-4 text-gray-500">No active placements</div>
                    )}
                </div>
            </div>
        </div>
    );
}