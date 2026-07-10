"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function registerUser(data: {

name: string;

email: string;

password: string;

}) {

const exist = await prisma.user.findUnique({

where: {

email: data.email,

},

});

if (exist)

return {

success: false,

message: "Email already exists",

};

const hash = await bcrypt.hash(data.password, 10);

await prisma.user.create({

data: {

name: data.name,

email: data.email,

password: hash,

},

});

return {

success: true,

};

}

"use server";

import { signIn } from "@/auth";

export async function login(formData: FormData) {
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: "/dashboard",
  });
}