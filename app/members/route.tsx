import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

interface MemberData {
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

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function GET() {
    try {
        const members = await query(`
            SELECT m.*, 
                   COUNT(DISTINCT p.class_id) as class_count
            FROM members m
            LEFT JOIN placements p ON m.id = p.member_id AND p.status = 'Active'
            GROUP BY m.id
            ORDER BY m.last_name, m.first_name
        `);
        return NextResponse.json(members.rows);
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch members' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body: MemberData = await request.json();
        const {
            first_name, last_name, date_of_birth, gender,
            parent_name, phone, email, address, medical_notes
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

        // Validate gender if provided
        if (gender && !['Male', 'Female'].includes(gender)) {
            return NextResponse.json(
                { error: 'Gender must be Male or Female' },
                { status: 400 }
            );
        }

        // Check if member with same email already exists
        if (email) {
            const existingMember = await query(
                'SELECT id FROM members WHERE email = $1',
                [email]
            );
            if (existingMember.rows.length > 0) {
                return NextResponse.json(
                    { error: 'A member with this email already exists' },
                    { status: 409 }
                );
            }
        }

        const result = await query(
            `INSERT INTO members 
             (first_name, last_name, date_of_birth, gender, parent_name, 
              phone, email, address, medical_notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [first_name.trim(), last_name.trim(), date_of_birth, gender,
             parent_name, phone, email, address, medical_notes]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating member:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create member' },
            { status: 500 }
        );
    }
}