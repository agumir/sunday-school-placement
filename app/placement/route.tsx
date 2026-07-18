import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

interface PlacementData {
    member_id: number;
    class_id: number;
    notes?: string;
}

export async function GET() {
    try {
        const placements = await query(`
            SELECT p.*,
                   CONCAT(m.first_name, ' ', m.last_name) as member_name,
                   c.class_name,
                   m.date_of_birth,
                   EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.date_of_birth)) as age
            FROM placements p
            JOIN members m ON p.member_id = m.id
            JOIN classes c ON p.class_id = c.id
            WHERE p.status = 'Active'
            ORDER BY p.placement_date DESC
        `);
        return NextResponse.json(placements.rows);
    } catch (error) {
        console.error('Error fetching placements:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch placements' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body: PlacementData = await request.json();
        const { member_id, class_id, notes } = body;

        // Validate required fields
        if (!member_id || !class_id) {
            return NextResponse.json(
                { error: 'Member ID and Class ID are required' },
                { status: 400 }
            );
        }

        // Check if member exists
        const memberExists = await query(
            'SELECT id, status FROM members WHERE id = $1',
            [member_id]
        );

        if (memberExists.rows.length === 0) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        // Check if member is active
        if (memberExists.rows[0].status !== 'Active') {
            return NextResponse.json(
                { error: 'Cannot place inactive member' },
                { status: 400 }
            );
        }

        // Check if class exists and has capacity
        const classData = await query(
            'SELECT id, capacity, status FROM classes WHERE id = $1',
            [class_id]
        );

        if (classData.rows.length === 0) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        if (classData.rows[0].status !== 'Active') {
            return NextResponse.json(
                { error: 'Class is not active' },
                { status: 400 }
            );
        }

        // Check class capacity
        const enrollmentCount = await query(
            'SELECT COUNT(*) as count FROM placements WHERE class_id = $1 AND status = $2',
            [class_id, 'Active']
        );

        if (parseInt(enrollmentCount.rows[0].count) >= classData.rows[0].capacity) {
            return NextResponse.json(
                { error: 'Class is at full capacity' },
                { status: 400 }
            );
        }

        // Check if member already has active placement
        const existing = await query(
            'SELECT * FROM placements WHERE member_id = $1 AND status = $2',
            [member_id, 'Active']
        );

        if (existing.rows.length > 0) {
            // End current placement
            await query(
                'UPDATE placements SET status = $1, notes = CONCAT(notes, $2) WHERE id = $3',
                ['Transferred', ' - Transferred on ' + new Date().toISOString().split('T')[0], existing.rows[0].id]
            );
        }

        // Create new placement
        const result = await query(
            `INSERT INTO placements (member_id, class_id, notes)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [member_id, class_id, notes || '']
        );

        // Update class enrollment count
        await query(
            'UPDATE classes SET current_enrollment = current_enrollment + 1 WHERE id = $1',
            [class_id]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating placement:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create placement' },
            { status: 500 }
        );
    }
}