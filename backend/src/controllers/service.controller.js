import { supabase } from '../config/database.js';

export const fetchAvailableLaundryServices = async () => {
  const { data, error } = await supabase
    .from('laundry_services')
    .select(`
      id,
      name,
      category,
      description,
      unit_type,
      unit_price,
      estimated_hours,
      express_available,
      express_surcharge,
      provider:partner_profiles!laundry_services_partner_id_fkey!inner (
        user_id,
        business_name,
        business_address,
        average_rating,
        is_open,
        verification_status
      )
    `)
    .eq('is_active', true)
    .eq('partner_profiles.verification_status', 'APPROVED')
    .eq('partner_profiles.is_open', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Supabase laundry service query failed:', error.message);
    throw new Error('Unable to retrieve laundry services.');
  }

  return data ?? [];
};

const normalizeProvider = (provider) => {
  const value = Array.isArray(provider) ? provider[0] : provider;

  if (!value) {
    return null;
  }

  return {
    id: value.user_id,
    businessName: value.business_name,
    address: value.business_address,
    averageRating: Number(value.average_rating),
  };
};

const normalizeService = (service) => ({
  id: service.id,
  name: service.name,
  category: service.category,
  description: service.description,
  price: Number(service.unit_price),
  unitType: service.unit_type,
  estimatedHours: service.estimated_hours,
  expressAvailable: service.express_available,
  expressSurcharge: Number(service.express_surcharge),
  provider: normalizeProvider(service.provider),
});

export const createListServicesController = ({
  serviceRepository = fetchAvailableLaundryServices,
} = {}) => async (_request, response, next) => {
  try {
    const services = await serviceRepository();
    const normalizedServices = services.map(normalizeService);

    return response.status(200).json({
      success: true,
      message: 'Available laundry services retrieved successfully.',
      data: normalizedServices,
      meta: {
        count: normalizedServices.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const listServices = createListServicesController();
export const getServicesByPartner = async (req, res, next) => {
  try {
    const { partnerId } = req.params;

    const { data, error } = await supabase
      .from("laundry_services")
      .select(`
        id,
        partner_id,
        name,
        category,
        description,
        unit_type,
        unit_price,
        estimated_hours,
        express_available,
        express_surcharge,
        is_active,
        created_at,
        updated_at
      `)
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      services: data || [],
    });
  } catch (error) {
    next(error);
  }
};