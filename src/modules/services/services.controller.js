import * as servicesService from "./services.service.js";
import { successResponse } from "../../utils/response.js";

export async function createService(req, res, next) {
  try {
    const { name, description, category, mode, basePrice } = req.body;
    const service = await servicesService.create(req.user.id, {
      name, description, category, mode, basePrice,
    });
    return successResponse(res, "Servicio creado exitosamente", service, 201);
  } catch (error) {
    next(error);
  }
}

export async function getMyServices(req, res, next) {
  try {
    const services = await servicesService.getMyServices(req.user.id);
    return successResponse(res, "Servicios obtenidos", services);
  } catch (error) {
    next(error);
  }
}

export async function getServiceById(req, res, next) {
  try {
    const service = await servicesService.getServiceById(req.params.serviceId);
    return successResponse(res, "Servicio obtenido", service);
  } catch (error) {
    next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const { name, description, category, mode, basePrice } = req.body;
    const service = await servicesService.update(req.params.serviceId, req.user.id, {
      name, description, category, mode, basePrice,
    });
    return successResponse(res, "Servicio actualizado", service);
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    await servicesService.remove(req.params.serviceId, req.user.id);
    return successResponse(res, "Servicio eliminado exitosamente");
  } catch (error) {
    next(error);
  }
}
