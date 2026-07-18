-- Create Members Table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    parent_name VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(200),
    address TEXT,
    medical_notes TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Transferred'))
);

-- Create Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    age_group VARCHAR(50),
    teacher_name VARCHAR(200),
    assistant_teacher VARCHAR(200),
    room_number VARCHAR(20),
    capacity INTEGER DEFAULT 15,
    current_enrollment INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Full'))
);

-- Create Placements Table
CREATE TABLE IF NOT EXISTS placements (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    placement_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Transferred', 'Graduated')),
    notes TEXT,
    UNIQUE(member_id, class_id, status)
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    attendance_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
    notes TEXT
);

-- Insert Sample Departments
INSERT INTO departments (department_name, descriptions, head_of_the_department, capacity) VALUES
('Education Department', '2-3 years', 'Mary Johnson', 10),
('Finance Department', '4-5 years', 'Sarah Williams', 12),
('Development Department', '5-6 years', 'John Smith', 15),
('Youth Affairs Department', '6-8 years', 'Lisa Brown', 15),
('Evangelism Department', '8-10 years', 'Michael Davis', 18),
('Research Department', '10-12 years', 'Patricia Miller', 20),
('Childrens Ministry Department', '13+ years', 'Robert Wilson', 25);

-- Insert Sample Members
INSERT INTO members (first_name, last_name, date_of_birth, gender, parent_name, phone, email) VALUES
('Emma', 'Johnson', '2019-03-15', 'Female', 'Mary Johnson', '(555) 123-4567', 'emma.j@example.com'),
('Noah', 'Smith', '2018-07-22', 'Male', 'John Smith', '(555) 234-5678', 'noah.s@example.com'),
('Olivia', 'Williams', '2017-11-08', 'Female', 'Sarah Williams', '(555) 345-6789', 'olivia.w@example.com'),
('Liam', 'Brown', '2016-05-30', 'Male', 'Lisa Brown', '(555) 456-7890', 'liam.b@example.com'),
('Ava', 'Davis', '2015-09-12', 'Female', 'Michael Davis', '(555) 567-8901', 'ava.d@example.com'),
('Ethan', 'Miller', '2014-02-18', 'Male', 'Patricia Miller', '(555) 678-9012', 'ethan.m@example.com'),
('Sophia', 'Wilson', '2013-06-25', 'Female', 'Robert Wilson', '(555) 789-0123', 'sophia.w@example.com');