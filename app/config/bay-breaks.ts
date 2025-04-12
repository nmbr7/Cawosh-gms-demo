export interface BayBreak {
  bay: number;
  startTime: string;
  endTime: string;
  description: string;
}

export const bayBreaks: BayBreak[] = [
  {
    bay: 1,
    startTime: '13:00', // 1 PM
    endTime: '14:00',   // 2 PM
    description: 'Lunch Break'
  },
  {
    bay: 2,
    startTime: '12:00', // 12 PM
    endTime: '13:00',   // 1 PM
    description: 'Lunch Break'
  },
  {
    bay: 3,
    startTime: '12:30', // 12:30 PM
    endTime: '13:30',   // 1:30 PM
    description: 'Lunch Break'
  }
]; 