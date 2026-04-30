import {
  findProviderByUserId,
  updateProviderProfile,
  getProviderProfileCompletion,
  searchProviders,
  getPublicProviderProfile,
} from "./providers.repository.js";

export async function getMyProfile(userId) {
  const provider = await findProviderByUserId(userId);
  if (!provider) {
    const error = new Error("Perfil de prestador no encontrado");
    error.statusCode = 404;
    throw error;
  }
  const completion = await getProviderProfileCompletion(userId);
  return { ...provider, profile_completion: Number(completion) };
}

export async function updateProfile(userId, data) {
  const provider = await findProviderByUserId(userId);
  if (!provider) {
    const error = new Error("Perfil de prestador no encontrado");
    error.statusCode = 404;
    throw error;
  }

  // Normalizar mainCategory a mayúsculas (por si el frontend envía "tecnologia")
  if (data.mainCategory) {
    data.mainCategory = data.mainCategory.toUpperCase();
  }

  const updated = await updateProviderProfile(userId, data);
  const completion = await getProviderProfileCompletion(userId);
  return { ...updated, profile_completion: Number(completion) };
}

export async function search(filters) {
  const providers = await searchProviders(filters);
  return providers;
}

export async function getPublicProfile(userId) {
  const provider = await getPublicProviderProfile(userId);
  if (!provider) {
    const error = new Error("Prestador no encontrado");
    error.statusCode = 404;
    throw error;
  }
  const completion = await getProviderProfileCompletion(userId);
  return { ...provider, profile_completion: Number(completion) };
}