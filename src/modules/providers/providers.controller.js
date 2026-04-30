import * as providersService from "./providers.service.js";
import { successResponse } from "../../utils/response.js";

export async function getMyProfile(req, res, next) {
  try {
    const profile = await providersService.getMyProfile(req.user.id);
    return successResponse(res, "Perfil obtenido", profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const {
      phone, city, bio, skills, portfolioUrl, schedule,
      basePrice, serviceDescription, mainCategory, yearsExperience,
    } = req.body;

    const profile = await providersService.updateProfile(req.user.id, {
      phone, city, bio, skills, portfolioUrl, schedule,
      basePrice, serviceDescription, mainCategory, yearsExperience,
    });

    return successResponse(res, "Perfil actualizado exitosamente", profile);
  } catch (error) {
    next(error);
  }
}

export async function searchProviders(req, res, next) {
  try {
    const { category, city, keyword, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const providers = await providersService.search({
      category,
      city,
      keyword,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      limit: parseInt(limit),
      offset,
    });

    return successResponse(res, "Prestadores encontrados", { providers, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProfile(req, res, next) {
  try {
    const { providerId } = req.params;
    const profile = await providersService.getPublicProfile(providerId);
    return successResponse(res, "Perfil del prestador obtenido", profile);
  } catch (error) {
    next(error);
  }
}
