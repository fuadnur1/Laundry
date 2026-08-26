export const createHealthController = ({ databaseHealthCheck }) => async (_request, response) => {
  try {
    await databaseHealthCheck();

    return response.status(200).json({
      success: true,
      message: 'LAUNDRRY API is healthy.',
      data: {
        service: 'laundrry-backend',
        status: 'healthy',
        database: 'connected',
        provider: 'supabase',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return response.status(503).json({
      success: false,
      message: 'LAUNDRRY API is unavailable.',
      data: {
        service: 'laundrry-backend',
        status: 'unhealthy',
        database: 'disconnected',
        provider: 'supabase',
        timestamp: new Date().toISOString(),
      },
    });
  }
};
