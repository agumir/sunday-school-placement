import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

interface ClassUpdateData {
    class_name: string;
    age_group: string;
    teacher_name: string;
    assistant_teacher: string;
    room_number: string;
    capacity: number;
    status: string;
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Invalid class ID' },
                { status: 400 }
            );
        }

        const classExists = await query(
            'SELECT id FROM classes WHERE id = $1',
            [id]
        );

        if (classExists.rows.length === 0) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        const placements = await query(
            'SELECT COUNT(*) as count FROM placements WHERE class_id = $1 AND status = $2',
            [id, 'Active']
        );

        const activePlacements = parseInt(placements.rows[0].count);
        
        if (activePlacements > 0) {
            return NextResponse.json(
                { 
                    error: 'Cannot delete class with active placements. Transfer or graduate members first.',
                    activePlacements
                },
                { status: 400 }
            );
        }

        await query('DELETE FROM classes WHERE id = $1', [id]);

        return NextResponse.json({ 
            message: 'Class deleted successfully',
            id: parseInt(id)
        });
    } catch (error) {
        console.error('Error deleting class:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete class' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Invalid class ID' },
                { status: 400 }
            );
        }

        const body: ClassUpdateData = await request.json();
        const {
            class_name, age_group, teacher_name,
            assistant_teacher, room_number, capacity, status
        } = body;

        if (!class_name) {
            return NextResponse.json(
                { error: 'Class name is required' },
                { status: 400 }
            );
        }

        const result = await query(
            `UPDATE classes 
             SET class_name = $1, age_group = $2, teacher_name = $3,
                 assistant_teacher = $4, room_number = $5, capacity = $6, status = $7
             WHERE id = $8
             RETURNING *`,
            [class_name, age_group, teacher_name, assistant_teacher, 
             room_number, capacity, status, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating class:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update class' },
            { status: 500 }
        );
    }
}