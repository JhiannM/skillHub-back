import { createCustomerProfile, createProviderProfile, createUser, findExistingUserByEmail, findUserByEmail } from "./auth.repository.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../config/jwt.js";

const RoleProfileCreators = {
  CUSTOMER: createCustomerProfile,
  PROVIDER: createProviderProfile
}

//Registro de usuario
export async function register( name, email, password, role) {

  const existingUser = await findExistingUserByEmail(email);

  //Validar que no exista un usuario con el mismo email
  if (existingUser) {
    const error = new Error("El email ya esta registrado");
    error.statusCode = 409;
    throw error;
  }
//Hashear la contraseña
  const passwordHash = await bcrypt.hash(password, 12);

  //Creación del usuario en la BD
  const user = await createUser(crypto.randomUUID(), name, email, passwordHash, role);

  await RoleProfileCreators[role](user.id, { phone: null, city: null });

  const newUser = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  //Generar token JWT
  const token = await generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  //Retornamos el token y la información del usuario

  return { token, user: newUser };
}


export async function login(email, password) {
  

  //Buscar usuario

  const user = await findUserByEmail(email);

  if(!user){
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  //Comparar la contraseña ingresada con el hash guardado
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if(!isPasswordValid){
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  //Generar Token JWT

  const token = await generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  //Retornar token y usuario

  return {token, user: {
    name: user.name,
    email: user.email,
    role: user.role,
  }}
}
