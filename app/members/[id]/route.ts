import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

interface MemberUpdateData {
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

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Invalid member ID' },
                { status: 400 }
            );
        }

        const result = await query('SELECT * FROM members WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching member:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch member' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Invalid member ID' },
                { status: 400 }
            );
        }

        const body: MemberUpdateData = await request.json();
        const {
            first_name, last_name, date_of_birth, gender,
            parent_name, phone, email, address, medical_notes, status
        } = body;

        // Validate required fields
        if (!first_name || !last_name || !date_of_birth) {
            return NextResponse.json(
                { error: 'First name, last name, and date of birth are required' },
                { status: 400 }
            );
        }

        // Validate email format if provided
        if (email && !isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate status
        if (status && !['Active', 'Inactive', 'Transferred'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be Active, Inactive, or Transferred' },
                { status: 400 }
            );
        }

        const result = await query(
            `UPDATE members 
             SET first_name = $1, last_name = $2, date_of_birth = $3, 
                 gender = $4, parent_name = $5, phone = $6, 
                 email = $7, address = $8, medical_notes = $9, status = $10
             WHERE id = $11
             RETURNING *`,
            [first_name, last_name, date_of_birth, gender, parent_name,
             phone, email, address, medical_notes, status, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update member' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Invalid member ID' },
                { status: 400 }
            );
        }

        // Check if member exists
        const memberExists = await query(
            'SELECT id FROM members WHERE id = $1',
            [id]
        );

        if (memberExists.rows.length === 0) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        // Check if member has active placements
        const activePlacements = await query(
            'SELECT COUNT(*) as count FROM placements WHERE member_id = $1 AND status = $2',
            [id, 'Active']
        );

        if (parseInt(activePlacements.rows[0].count) > 0) {
            return NextResponse.json(
                { 
                    error: 'Cannot delete member with active placements. Remove from class first.',
                    activePlacements: parseInt(activePlacements.rows[0].count)
                },
                { status: 400 }
            );
        }

        await query('DELETE FROM members WHERE id = $1', [id]);

        return NextResponse.json({ 
            message: 'Member deleted successfully',
            id: parseInt(id)
        });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete member' },
            { status: 500 }
        );
    }
}