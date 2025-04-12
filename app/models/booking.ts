export type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'blocked' | 'break';

export class Booking {
  id: string;
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  bay: number;
  status: BookingStatus;

  constructor(data: {
    id: string;
    customerName: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    bay: number;
    status: BookingStatus;
  }) {
    this.id = data.id;
    this.customerName = data.customerName;
    this.date = data.date;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.description = data.description;
    this.bay = data.bay;
    this.status = data.status;
  }

  getStatusColor(): string {
    switch (this.status) {
      case 'upcoming':
        return 'bg-purple-100 text-purple-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'break':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  isBlocked(): boolean {
    return this.status === 'blocked' || this.status === 'break';
  }

  isBreak(): boolean {
    return this.status === 'break';
  }

  getDuration(): number {
    const start = parseInt(this.startTime.split(':')[0]);
    const end = parseInt(this.endTime.split(':')[0]);
    return end - start;
  }

  getTopPosition(): number {
    const startHour = parseInt(this.startTime.split(':')[0]);
    return (startHour - 8) * 60; // Assuming 8 AM is the start time
  }

  getHeight(): number {
    return this.getDuration() * 60;
  }

  // Helper method to convert time string to minutes since 8 AM
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours - 8) * 60 + minutes;
  }

  // Check if this booking overlaps with another booking
  overlapsWith(other: Booking): boolean {
    if (this.date !== other.date || this.bay !== other.bay) {
      return false;
    }

    const thisStart = this.timeToMinutes(this.startTime);
    const thisEnd = this.timeToMinutes(this.endTime);
    const otherStart = this.timeToMinutes(other.startTime);
    const otherEnd = this.timeToMinutes(other.endTime);

    return (
      (thisStart >= otherStart && thisStart < otherEnd) ||
      (thisEnd > otherStart && thisEnd <= otherEnd) ||
      (thisStart <= otherStart && thisEnd >= otherEnd)
    );
  }

  // Validate if the booking times are valid
  isValid(): boolean {
    const start = this.timeToMinutes(this.startTime);
    const end = this.timeToMinutes(this.endTime);
    return start >= 0 && end <= 540 && start < end; // 540 minutes = 9 hours (8 AM to 5 PM)
  }
} 