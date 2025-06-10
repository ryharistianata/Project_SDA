export interface User {
    id: string;
    username: string;
    namaTim: string;
    email: string;
    alamat: string;
    gambar: string;
    password: string;
    createdAt: string;
    role: "user" | "admin";
}