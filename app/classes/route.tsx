import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

interface ClassData {
    class_name: string;
    age_group: string;
    teacher_name: string;
    assistant_teacher: string;
    room_number: string;
    capacity: number;
}

export async function GET() {
    try {
        const classes = await query(`
            SELECT c.*,
                   COUNT(DISTINCT p.member_id) as current_enrollment
            FROM classes c
            LEFT JOIN placements p ON c.id = p.class_id AND p.status = 'Active'
            GROUP BY c.id
            ORDER BY c.age_group
        `);
        return NextResponse.json(classes.rows);
    } catch (error) {
        console.error('Error fetching classes:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch classes' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body: ClassData = await request.json();
        const {
            class_name, age_group, teacher_name,
            assistant_teacher, room_number, capacity
        } = body;

        // Validate required fields
        if (!class_name) {
            return NextResponse.json(
                { error: 'Class name is required' },
                { status: 400 }
            );
        }

        // Validate capacity
        if (capacity && (capacity < 1 || capacity > 100)) {
            return NextResponse.json(
                { error: 'Capacity must be between 1 and 100' },
                { status: 400 }
            );
        }

        // Check if class with same name already exists
        const existingClass = await query(
            'SELECT id FROM classes WHERE LOWER(class_name) = LOWER($1)',
            [class_name.trim()]
        );

        if (existingClass.rows.length > 0) {
            return NextResponse.json(
                { error: 'A class with this name already exists' },
                { status: 409 }
            );
        }

        const result = await query(
            `INSERT INTO classes 
             (class_name, age_group, teacher_name, assistant_teacher, room_number, capacity)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [class_name.trim(), age_group, teacher_name, assistant_teacher, room_number, capacity || 15]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating class:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create class' },
            { status: 500 }
        );
    }
}