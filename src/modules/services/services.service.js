import { randomUUID } from "crypto";
import {
  createService,
  findServicesByProvider,
  findServiceById,
  updateService,
  deleteService,
} from "./services.repository.js";

export async function create(providerId, data) {
  const id = randomUUID();
  return await createService(id, providerId, data);
}

export async function getMyServices(providerId) {
  return await findServicesByProvider(providerId);
}

export async function getServiceById(id) {
  const service = await findServiceById(id);
  if (!service) {
    const error = new Error("Servicio no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return service;
}

export async function update(id, providerId, data) {
  const existing = await findServiceById(id);
  if (!existing) {
    const error = new Error("Servicio no encontrado");
    error.statusCode = 404;
    throw error;
  }
  if (existing.provider_id !== providerId) {
    const error = new Error("No tienes permiso para editar este servicio");
    error.statusCode = 403;
    throw error;
  }
  return await updateService(id, providerId, data);
}

export async function remove(id, providerId) {
  const existing = await findServiceById(id);
  if (!existing) {
    const error = new Error("Servicio no encontrado");
    error.statusCode = 404;
    throw error;
  }
  if (existing.provider_id !== providerId) {
    const error = new Error("No tienes permiso para eliminar este servicio");
    error.statusCode = 403;
    throw error;
  }
  await deleteService(id, providerId);
}
