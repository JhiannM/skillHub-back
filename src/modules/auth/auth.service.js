import { createUser, findExistingUserByEmail, roleSpecificInsert } from "./auth.repository.js";
import bcrypt from "bcryptjs";
import { generateToken } from "./auth.utils.js";

//Registro de usuario
export async function register(name, email, password, role) {

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
  const user = await createUser(name, email, passwordHash, role);

  await roleSpecificInsert(user.id, role);

  const newUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  //Generar token JWT
  const token = await generateToken(newUser);

  //Retornamos el token y la información del usuario

  return { token, user: newUser };
}


export async function login(email, password) {
  

  //Buscar usuario

  const user = await findExistingUserByEmail(email);

  if(!user){
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  //Compactar contraseña

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
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }}
}