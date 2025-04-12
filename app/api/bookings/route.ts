import { NextResponse } from 'next/server';
import { Booking } from '@/app/models/booking';
import { bayBreaks } from '@/app/config/bay-breaks';

// Sample data for generating random bookings
const customerNames = [
  'John Smith',
  'Sarah Johnson',
  'Michael Brown',
  'Emily Davis',
  'David Wilson',
  'Lisa Anderson',
  'Robert Taylor',
  'Jennifer Martinez',
  'William Thomas',
  'Jessica Garcia'
];

const serviceDescriptions = [
  'Oil Change',
  'Tire Rotation',
  'Brake Service',
  'Engine Tune-up',
  'Transmission Service',
  'Battery Replacement',
  'Wheel Alignment',
  'Air Filter Replacement',
  'Coolant Flush',
  'Spark Plug Replacement'
];

function generateRandomTime(existingBookings: Booking[], bayBreak: { startTime: string; endTime: string } | null): string {
  const availableHours = Array.from({ length: 9 }, (_, i) => i + 8); // 8 AM to 5 PM
  const availableMinutes = [0, 15, 30, 45];

  // Filter out break time if it exists
  if (bayBreak) {
    const breakStart = parseInt(bayBreak.startTime.split(':')[0]);
    const breakEnd = parseInt(bayBreak.endTime.split(':')[0]);
    const breakHours = Array.from({ length: breakEnd - breakStart }, (_, i) => i + breakStart);
    availableHours.splice(availableHours.indexOf(breakStart), breakEnd - breakStart);
  }

  // Filter out times that would overlap with existing bookings
  const availableTimes = availableHours.flatMap(hour => 
    availableMinutes.map(minute => {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const booking = new Booking({
        id: 'temp',
        customerName: 'temp',
        date: 'temp',
        startTime: time,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        description: 'temp',
        bay: 0,
        status: 'upcoming'
      });

      const hasOverlap = existingBookings.some(existing => booking.overlapsWith(existing));
      return hasOverlap ? null : time;
    })
  ).filter(Boolean);

  if (availableTimes.length === 0) {
    throw new Error('No available time slots');
  }

  return availableTimes[Math.floor(Math.random() * availableTimes.length)] as string;
}

function generateRandomBooking(date: string, bay: number, existingBookings: Booking[]): Booking | null {
  const bayBreak = bayBreaks.find(breakTime => breakTime.bay === bay);
  
  try {
    const startTime = generateRandomTime(existingBookings, bayBreak || null);
    const duration = Math.floor(Math.random() * 3) + 1; // 1 to 3 hours
    const endHour = parseInt(startTime.split(':')[0]) + duration;
    const endTime = `${endHour.toString().padStart(2, '0')}:${startTime.split(':')[1]}`;

    const booking = new Booking({
      id: `B${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      date,
      startTime,
      endTime,
      description: serviceDescriptions[Math.floor(Math.random() * serviceDescriptions.length)],
      bay,
      status: 'upcoming'
    });

    // Check if the booking is valid and doesn't overlap with existing bookings
    if (!booking.isValid() || existingBookings.some(existing => booking.overlapsWith(existing))) {
      // If invalid or overlapping, try again
      return generateRandomBooking(date, bay, existingBookings);
    }

    return booking;
  } catch (error) {
    // If no available time slots, return null
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') || '0');
  const year = parseInt(searchParams.get('year') || '2024');
  const bay = parseInt(searchParams.get('bay') || '1');

  console.log(`API called with month: ${month}, year: ${year}, bay: ${bay}`);

  const bookings: Booking[] = [];
  const today = new Date();
  const currentDate = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Generate bookings for each day in the month
  for (let date = new Date(currentDate); date <= lastDay; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    const dayBookings: Booking[] = [];

    // Generate 1-3 bookings per day
    const numBookings = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numBookings; i++) {
      const booking = generateRandomBooking(dateStr, bay, dayBookings);
      if (booking) {
        dayBookings.push(booking);
      }
    }

    // Set status based on date
    dayBookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      if (bookingDate < today) {
        booking.status = 'completed';
        console.log(`Past booking: ${booking.date} marked as completed`);
      } else if (bookingDate.toDateString() === today.toDateString()) {
        booking.status = Math.random() > 0.5 ? 'ongoing' : 'upcoming';
        console.log(`Today's booking: ${booking.date} marked as ${booking.status}`);
      } else {
        booking.status = 'upcoming';
        console.log(`Future booking: ${booking.date} marked as upcoming`);
      }
    });

    bookings.push(...dayBookings);
  }

  // Sort bookings by date and time
  bookings.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });

  return NextResponse.json(bookings);
} 