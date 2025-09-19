export const BookingApiClient = {
  // Book game (assign analyst)
  bookGame: async (matchId: string, analystId: string) => {
    try {
      const response = await fetch('/api/GameBooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, analystId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
            return { success: false, message: data.error }; // always an object
        }
        throw new Error('Failed to book game');
        }

        return { success: true, message: data.message, match: data.match };
    } catch (err: any) {
      console.error('Failed to book game', err); // only log unexpected errors
      alert(err.message || 'Failed to book game');
      throw err; 
    }
  },
};
