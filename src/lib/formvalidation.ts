"use server";

import { User } from "@/types/type";
import { formLoginSchema, formRegisterSchema } from "./formschema";
import bcrypt from "bcrypt";
import redis from "./redis";
import { cookies } from "next/headers";
import axios from "axios";
import currentDateTime from "./date";

const formValidationLogin = async (prev: unknown, formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  const validated = formLoginSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error?.flatten().fieldErrors };
  }

  const keys = await redis.keys("User:*");
  for (const key of keys) {
    const user: User = JSON.parse((await redis.get(key)) as string);
    if (user.email === validated.data.email) {
      if (await bcrypt.compare(validated.data.password, user.password)) {
        const cookie = await cookies();
        const session = Math.random().toString(36).substring(2, 7);
        const token = await redis.keys("Session:*");
        for (const tok of token) {
          const userToken: User = JSON.parse((await redis.get(tok)) as string);
          if (userToken.id === user.id) {
            await redis.del(tok);
          }
        }
        await redis.set(`Session:${session}`, JSON.stringify(user), "EX", 3600);
        cookie.set("Session", session, {
          httpOnly: true,
          secure: true,
          path: "/",
          maxAge: 3600,
        });
        return {
          message: "Berhasil Login",
          type: "success",
        };
      }
    }
  }

  return {
    message: "Email atau Password salah",
    type: "error",
  };
};

const formValidationRegister = async (prev: unknown, formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  console.log(data);
  const validated = formRegisterSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error?.flatten().fieldErrors };
  }

  try {
    const keys = await redis.keys("User:*");
    for (const key of keys) {
      const user: User = JSON.parse((await redis.get(key)) as string);
      if (user.email === validated.data.email) {
        return {
          message: "Email sudah terdaftar",
          type: "error",
        };
      }
    }

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", data.gambar as Blob);
    const { data: url } = await axios.post(
      "https://catbox.moe/user/api.php",
      form
    );
    if(!url) throw new Error("Gagal Upload Gambar")

    validated.data.password = await bcrypt.hash(validated.data.password, 10);
    const id = Math.random().toString(36).substring(2, 9);

    const user: User = {
      id,
      username: validated.data.username,
      namaTim: validated.data.namaTim,
      email: validated.data.email,
      gambar: url,
      alamat: validated.data.alamat,
      password: validated.data.password,
      createdAt: currentDateTime(),
      role: "user",
    };

    await redis.set(`User:${id}`, JSON.stringify(user));
    return {
      message: "Berhasil Register",
      type: "success",
    };
  } catch (error) {
    return {
      message: "Error: " + error,
      type: "error",
    }
  }
};

const logout = async () => {
  const cookie = await cookies();
  await redis.del(`Session:${cookie.get("Session")?.value}`);
  cookie.delete("Session");
}

export { formValidationLogin, formValidationRegister, logout };
