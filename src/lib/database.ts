/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
import path from "path";

const getData = (namaTable: string, where?: {[key: string]: string | number}) => {
    if(namaTable.includes(":")) {
        const [namaFolder, file] = namaTable.split(":");
        const pathname = path.join(process.cwd(), "src", "data", namaFolder, `${file}.json`);
        if(fs.existsSync(pathname)) {
            const data = JSON.parse(fs.readFileSync(pathname, "utf-8"));
            return {
                message: "success",
                data
            }
        } else {
            return {
                message: "Nama table tidak ditemukan",
                data: []
            };
        }
    } else {
        const pathname = path.join(process.cwd(), "src", "data", namaTable);
        if(fs.existsSync(pathname)) {
            const filename = fs.readdirSync(pathname);
            const data = filename.map((file: string) => {
                const filepath = path.join(pathname, file);
                return JSON.parse(fs.readFileSync(filepath, "utf-8"));
            });

            if(where) {
                const kondisi = Object.entries(where);
                const find: boolean[] = Array(kondisi.length).fill(false);
                for (const item of data) {
                    for (const [index, [key, value]] of kondisi.entries()) {
                        if(item[key] === value) {
                            find[index] = true;
                            if(!find.includes(false)) {
                                return {
                                    message: "success",
                                    data: item
                                }
                            }
                        }
                    }
                }

                return {
                    message: "Data tidak ditemukan",
                    data: []
                }
            }

            return {
                message: "success",
                data
            };
        } else {
            return {
                message: "Nama table tidak ditemukan",
                data: []
            };
        }
    }
}

const writeData = (namaTable: string, data: any, ex: number = 0) => {
    if(namaTable.includes(":")) {
        const [namaFolder, file] = namaTable.split(":");
        const pathdir = path.join(process.cwd(), "src", "data", namaFolder);
        if(!fs.existsSync(pathdir)) fs.mkdirSync(pathdir, { recursive: true });
        if(!data?.id) data.id = file; 
        fs.writeFileSync(path.join(pathdir, `${file}.json`), JSON.stringify(data, null, 2));

        if(ex) {
            const timeout = setTimeout(() => {
                if(fs.existsSync(path.join(pathdir, `${file}.json`))) 
                fs.unlinkSync(path.join(pathdir, `${file}.json`));
                clearTimeout(timeout);
            }, ex * 1000);
        }

        return {
            message: "success",
            data
        }
    } else {
        throw new Error(`Nama table tidak valid: Format table harus namaFolder:namaFile`);
    }
}

const updateData = (namaTable: string, updateData: any) => {
    try {
        const { data, message }: any = getData(namaTable);
        if(message === "success") {
            const [key, value]: any = Object.entries(updateData)[0] 
            const newData = {
                ...data,
                [key]: value
            }
            fs.writeFileSync(path.join(process.cwd(), "data.json"), JSON.stringify(newData, null, 2));
            return {
                message: "success",
                data: newData
            }
        } else {
            return {
                message: "Nama table tidak ditemukan",
                data: []
            };
        }
    } catch(error) {
        throw new Error(`Nama table tidak valid: Format table harus namaFolder:namaFile`);
    }
}

const deleteData = (namaTable: string) => {
    if(namaTable.includes(":")) {
        const [namaFolder, file] = namaTable.split(":");
        const pathname = path.join(process.cwd(), "src", "data", namaFolder, `${file}.json`);
        if(fs.existsSync(pathname)) {
            fs.unlinkSync(pathname);
            return {
                message: "success",
            }
        } else {
            return {
                message: "Nama table tidak ditemukan",
            };
        }
    } else {
        throw new Error(`Nama table tidak valid: Format table harus namaFolder:namaFile`);
    }
}

const getNamaFileInFolder = (namaTable: string) => {
    const pathname = path.join(process.cwd(), "src", "data", namaTable);
    if(fs.existsSync(pathname)) {
        const filename = fs.readdirSync(pathname);
        return {
            message: "success",
            data: filename
        };
    } else {
        return {
            message: "Nama table tidak ditemukan",
            data: []
        };
    }
}

const uploadFile = async (file: File) => {
    const pathname = path.join(process.cwd(), "public", "gambar");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const namaFile = Math.random().toString(36).substring(2, 9)
    const extensi = file.name.split(".").pop()
    fs.writeFileSync(path.join(pathname, `${namaFile}.${extensi}`), buffer);

    return {
        message: "success",
        url: `/gambar/${namaFile}.${extensi}`,
    }
}

export { getData, writeData, updateData, deleteData, uploadFile, getNamaFileInFolder };