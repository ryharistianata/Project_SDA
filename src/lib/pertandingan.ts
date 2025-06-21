"use server";

import { Seed, User } from "@/types/type";
import {
  deleteData,
  getData,
  getNamaFileInFolder,
  writeData,
} from "./database";
import { redirect } from "next/navigation";
import { MixinAlert } from "./alert";

// ALGORITMA ROUND ROBIN
const RoundRobbin = (n: number) => Math.pow(2, Math.ceil(Math.log2(n)));

// FUNGSI UNTUK MEMBAGI PESERTA ATAS BAWAH
const shuffle = <T>(array: T[]): T[] => {
  const atas: T[] = [];
  const bawah: T[] = [];
  for (let i = 0; i < array.length; i++) {
    if (i % 2 === 0) atas.push(array[i]);
    else bawah.push(array[i]);
  }
  return [...atas, ...bawah];
};

const urutkanByAlamat = (peserta: User[]) => {
  const alamat: { [key: string]: User[] } = {};
  peserta.forEach((item) => {
    const key = item.alamat.toLowerCase();
    if (!alamat[key]) alamat[key] = [];
    alamat[key].push(item);
  });

  return Object.values(alamat);
};

const bagiPeserta = (GroupPeserta: User[][]) => {
  const atas: User[] = [];
  const bawah: User[] = [];
  GroupPeserta.forEach((group) => {
    const half = Math.ceil(group.length / 2);
    atas.push(...group.slice(0, half));
    bawah.push(...group.slice(half));
  });

  return [atas, bawah];
};

// FUNGSI UNTUK MERESET SEMUA DATA
const resetData = (namaFolder: string) => {
  const { message, data } = getNamaFileInFolder(namaFolder);
  if (message === "success") {
    for (const file of data) {
      const namaFile = file.split(".")[0];
      deleteData(`${namaFolder}:${namaFile}`);
    }
  }
};

// FUNGSI UNTUK MENGAMBIL PEMENANG PESERTA
const getPemenang = (peserta: Seed[]) => {
  const antrian: Seed[] = [];
  const pesertaPemenang = peserta
    .map((seed: Seed) => {
      const [team1, team2] = seed.teams;
      if (team1.name !== "" && team2.name !== "") {
        // CEK JIKA SCORE SAMA MASUK KEDALAM ANTRIAN
        if (team1.score === team2.score) {
          antrian.push(seed);
          return {
            name: "",
            score: 0,
            gambar: "",
            alamat: "",
            tim: "",
          };
        } else {
          // CEK JIKA SCORE BERBEDA MASUK KEDALAM PEMENANG
          return team1.score > team2.score ? team1 : team2;
        }
      }
      return null;
    })
    .filter(Boolean);

  return { pesertaPemenang, antrian };
};

const createBracket = async (peserta: User[]) => {
  if (!peserta.length) return false;

  // RESET SEMUA DATA
  resetData("Repechange");
  resetData("Ronde");
  resetData("Antrian");
  resetData("Pemenang");

  // ACAK PESERTA
  const acakPeserta: User[] = peserta.sort(() => Math.random() - 0.5);

  // KELOMPOKAN PESERTA BERDASARKAN ALAMAT
  const groupUsers = urutkanByAlamat(acakPeserta);
  // BAGI PESERTA ATAS DAN BAWAH
  let [atas, bawah] = bagiPeserta(groupUsers);
  atas = shuffle(atas);
  bawah = shuffle(bawah);
  const users: User[] = [...atas, ...bawah];

  // BUAT BRACKET
  const totalPeserta = users.length;
  const totalSlot = RoundRobbin(totalPeserta);
  const totalBay = totalSlot - totalPeserta;
  const totalRonde = Math.log2(totalSlot) + 1;

  // Masukkan peserta jika ada yang nge bye
  const pesertaMain = [...users];
  let pesertaBay: User[] = [];
  if (totalBay > 0) {
    pesertaBay = pesertaMain.splice(-totalBay);
    const acakPeserta: User[] = pesertaBay.sort(() => Math.random() - 0.5);
    const groupUsers = urutkanByAlamat(acakPeserta);
    let [atas, bawah] = bagiPeserta(groupUsers);
    atas = shuffle(atas);
    bawah = shuffle(bawah);
    pesertaBay = [...atas, ...bawah];
  }

  // Buat semua bracket ronde
  const bracket: any[] = [];
  for (let i = 0; i < totalRonde; i++) {
    const title =
      i === totalRonde - 1
        ? "Winner"
        : i === totalRonde - 2
        ? "Finals"
        : `${i + 1}`;
    const jumlahSeed = Math.pow(2, totalRonde - i - 2); // 8 → Round 1 = 4 match, Round 2 = 2 match
    const seeds = Array.from({ length: jumlahSeed }, (_, j) => ({
      id: j + 1,
      date: "",
      roundTitle: "Utama",
      teams: [
        { name: "", score: 0, gambar: "", alamat: "", tim: "" },
        { name: "", score: 0, gambar: "", alamat: "", tim: "" },
      ],
    }));
    bracket.push({ title, seeds });
  }

  // ISI WINNER
  const findIndex = bracket.findIndex((round) => round.title === "Winner");
  if (findIndex !== -1) {
    bracket[findIndex].seeds[0] = {
      id: 1,
      date: "",
      roundTitle: "Utama",
      teams: [{ name: "", score: 0, gambar: "", alamat: "", tim: "" }],
    };
  }

  // ISI ROUND 1 (dari pesertaMain)
  const round1 = bracket[0];
  for (let i = 0; i < pesertaMain.length; i += 2) {
    const team1 = pesertaMain[i];
    const team2 = pesertaMain[i + 1];
    round1.seeds[Math.floor(i / 2)].teams = [
      {
        name: team1?.username || "",
        score: 0,
        gambar: team1?.gambar || "",
        alamat: team1?.alamat || "",
        tim: team1?.namaTim || "",
      },
      {
        name: team2?.username || "",
        score: 0,
        gambar: team2?.gambar || "",
        alamat: team2?.alamat || "",
        tim: team2?.namaTim || "",
      },
    ];
  }

  // ISI BAY kE ROUND 2
  const round2 = bracket[1];
  for (let i = 0; i < pesertaBay.length; i++) {
    for (let j = round2.seeds.length - 1; j >= 0; j--) {
      const seed = round2.seeds[j];

      // ISI teams[1] dulu baru teams[0]
      if (seed.teams[1].name === "") {
        seed.teams[1].name = pesertaBay[i].username;
        seed.teams[1].gambar = pesertaBay[i].gambar;
        seed.teams[1].tim = pesertaBay[i].namaTim;
        seed.teams[1].alamat = pesertaBay[i].alamat;
        break;
      } else if (seed.teams[0].name === "") {
        seed.teams[0].name = pesertaBay[i].username;
        seed.teams[0].gambar = pesertaBay[i].gambar;
        seed.teams[0].tim = pesertaBay[i].namaTim;
        seed.teams[0].alamat = pesertaBay[i].alamat;
        break;
      }
    }
  }

  try {
    for (const round of bracket) {
      writeData(`Ronde:${round.title}`, round);
    }
    return bracket[0].title;
  } catch (err) {
    console.error("Error simpan:", err);
    return false;
  }
};

const updateBracket = (peserta: Seed[], ronde: string, folder: string) => {
  // AMBIL PEMENANG PESERTA MASUKAN DALAM ARRAY
  const { pesertaPemenang, antrian } = getPemenang(peserta);

  // CEK RONDE ANTRIAN
  if (folder != "Antrian") {
    const { message: messageAntrian } = getData(`Antrian:${ronde}`);
    if (messageAntrian === "success") {
      MixinAlert("info", "Masuk kedalam antrian");
      redirect(`/antrian/${ronde}`);
    }
  }

  // CEK RONDE ANTRIAN PESERTA
  if (folder == "Antrian") {
    // CEK JIKA SKOR MASIH SAMA LAGI MASUK KEDALAM ANTRIAN
    if (antrian.length > 0) {
      MixinAlert("warning", "Skor masih sama, masuk kedalam antrian");
      redirect(`/antrian/${ronde}`);
    }

    // AMBIL DATA PESERTA ANTRIAN
    const { data: dataAntrian, message: messageAntrian } = getData(
      `Antrian:${ronde}`
    );

    if (messageAntrian === "success") {
      const { message: messageSebelum, data: rondeSebelum } = getData(
        `${dataAntrian.bracket}:${dataAntrian.title}`
      );

      if (messageSebelum === "success") {
        for (
          let i = 0, index = 0;
          i < rondeSebelum.seeds.length && index < pesertaPemenang.length;
          i++
        ) {
          const seed = rondeSebelum.seeds[i];

          for (let t = 0; t < seed.teams.length; t++) {
            if (seed.teams[t].name === "") {
              const antrian = pesertaPemenang[index];
              seed.teams[t] = {
                name: antrian?.name,
                score: 0,
                gambar: antrian?.gambar,
                alamat: antrian?.alamat,
                tim: antrian?.tim,
              };
              index++;
            }
          }
        }

        // MENGUBAH SKOR SEBELUMNYA
        const { message: msg, data: pesertaSebelumnya } = getData(
          `${dataAntrian.bracket}:${dataAntrian.rondeSebelum}`
        );
        if (msg === "success") {
          for (let i = 0; i < pesertaSebelumnya.seeds.length; i++) {
            const seed: Seed = pesertaSebelumnya.seeds[i];
            const pesertaSekarang: Seed[] = peserta;
            for (let p = 0; p < pesertaSekarang.length; p++) {
              for (let t = 0; t < seed.teams.length; t++) {
                if (seed.teams[t].name === pesertaSekarang[p].teams[t]?.name) {
                  seed.teams[t].score = pesertaSekarang[p].teams[t]?.score;
                }
              }
            }
          }

          writeData(
            `${dataAntrian.bracket}:${dataAntrian.rondeSebelum}`,
            pesertaSebelumnya
          );
        }

        writeData(`${dataAntrian.bracket}:${dataAntrian.title}`, rondeSebelum);
        deleteData(`Antrian:${ronde}`);
        redirect(`/${dataAntrian.bracket.toLowerCase()}/${ronde}`);
      }
    }
  }

  let nextRonde = "";
  let currentRonde = "";
  const { data: dataRepechange } = getData("Repechange");
  const totalCurrentPeserta = dataRepechange
    .map((item: any) => item?.seeds)
    .flat();
  const { data: dataPeserta } = getData(`User`);
  const totalPeserta =
    folder == "Repechange" ? totalCurrentPeserta.length : dataPeserta.length;

  // CARI RONDE SELANJUTNYA
  if (totalPeserta == 2) {
    nextRonde = "Winner";
    currentRonde = "Finals";
  } else if (totalPeserta > 2 && totalPeserta <= 4) {
    switch (ronde) {
      case "1":
        nextRonde = "Finals";
        currentRonde = "1";
        break;
      default:
        nextRonde = "Winner";
        currentRonde = "Finals";
        break;
    }
  } else if (totalPeserta > 4 && totalPeserta <= 8) {
    switch (ronde) {
      case "1":
        nextRonde = "2";
        currentRonde = "1";
        break;
      case "2":
        nextRonde = "Finals";
        currentRonde = "2";
        break;
      default:
        nextRonde = "Winner";
        currentRonde = "Finals";
        break;
    }
  } else if (totalPeserta > 8 && totalPeserta <= 16) {
    switch (ronde) {
      case "1":
        nextRonde = "2";
        currentRonde = "1";
        break;
      case "2":
        nextRonde = "3";
        currentRonde = "2";
        break;
      case "3":
        nextRonde = "Finals";
        currentRonde = "3";
        break;
      default:
        nextRonde = "Winner";
        currentRonde = "Finals";
        break;
    }
  }

  // TAMBAHKAN PESERTA ANTRIAN JIKA ADA
  if (antrian.length > 0) {
    const newRonde = {
      title: nextRonde,
      rondeSebelum: currentRonde,
      bracket: folder,
      seeds: antrian,
    };
    if (nextRonde == "Winner") {
      redirect(`/${folder.toLowerCase()}/${currentRonde}`);
    }
    writeData(`Antrian:${nextRonde}`, newRonde);
  }

  // MENGUBAH SKOR PESERTA SEBELUMNYA
  const { message: msg, data: pesertaSebelumnya } = getData(
    `${folder}:${currentRonde}`
  );

  if (msg === "success") {
    for (let i = 0; i < pesertaSebelumnya.seeds.length; i++) {
      const seed: Seed = pesertaSebelumnya.seeds[i];
      const pesertaSekarang: Seed = peserta[i];

      for (let t = 0; t < seed.teams.length; t++) {
        seed.teams[t].score = pesertaSekarang.teams[t]?.score;
      }
    }

    try {
      writeData(`${folder}:${currentRonde}`, pesertaSebelumnya);
    } catch (err) {
      console.error("Error simpan:", err);
      return false;
    }
  }

  // MENGISI PESERTA PADA BABAK BERIKUTNYA
  const { message, data: rondeBerikutnya } = getData(`${folder}:${nextRonde}`);
  if (message !== "success") {
    console.error("Gagal ambil ronde berikutnya");
    return false;
  }

  for (
    let i = 0, index = 0;
    i < rondeBerikutnya.seeds.length && index < pesertaPemenang.length;
    i++
  ) {
    const seed = rondeBerikutnya.seeds[i];

    for (let t = 0; t < seed.teams.length; t++) {
      if (seed.teams[t].name === "") {
        const pemenang = pesertaPemenang[index];
        seed.teams[t] = {
          name: pemenang?.name,
          score: 0,
          gambar: pemenang?.gambar,
          alamat: pemenang?.alamat,
          tim: pemenang?.tim,
        };
        index++;
      }
    }
  }

  // MASUKKAN PEMENANG PESERTA
  if (nextRonde == "Winner") {
    if (folder == "Ronde") {
      const pesertaPemenang = peserta.map((p: Seed) => {
        const [team1, team2] = p.teams;
        if (team1.score > team2.score) {
          return [
            {
              ...team1,
              juara: "1",
            },
            {
              ...team2,
              juara: "2",
            },
          ];
        } else {
          return [
            {
              ...team2,
              juara: "1",
            },
            {
              ...team1,
              juara: "2",
            },
          ];
        }
      });
      writeData(`Pemenang:1`, pesertaPemenang);
    } else if (folder == "Repechange") {
      const pesertaPemenang = peserta.map((p: Seed) => {
        const [team1, team2] = p.teams;
        if (team1.score > team2.score) {
          return [
            {
              ...team1,
              juara: "3",
            },
            {
              ...team2,
              juara: "4",
            },
          ];
        } else {
          return [
            {
              ...team2,
              juara: "3",
            },
            {
              ...team1,
              juara: "4",
            },
          ];
        }
      });
      writeData(`Pemenang:2`, pesertaPemenang);
    }
  }

  try {
    writeData(`${folder}:${nextRonde}`, rondeBerikutnya);
    if (nextRonde === "Winner" && folder != "Repechange") {
      createRepechange();
      return "winner";
    }
    return nextRonde;
  } catch (err) {
    console.error("Gagal simpan ronde berikutnya:", err);
    return false;
  }
};

const getRepechangeParticipants = () => {
  const finalRonde = getData("Ronde:Finals");
  if (finalRonde.message !== "success") return [];

  const finalSeeds: Seed[] = finalRonde.data.seeds;
  const finalistNames: string[] = finalSeeds.flatMap((seed) =>
    seed.teams.map((t) => t.name).filter(Boolean)
  );

  const defeatedPlayers: Set<string> = new Set();

  // Cek semua ronde sebelumnya (kecuali Winner dan Finals)
  const kecuali = ["Winner", "Finals"];
  const allRounds = getNamaFileInFolder("Ronde")
    .data.map((file: string) => file.split(".")[0])
    .filter((round: string) => !kecuali.includes(round)); // Ambil semua ronde kecuali Winner dan Finals
  for (const ronde of allRounds) {
    const { message, data } = getData(`Ronde:${ronde}`);
    if (message !== "success") continue;

    const seeds: Seed[] = data.seeds;
    for (const seed of seeds) {
      const [team1, team2] = seed.teams;
      if (!team1?.name || !team2?.name) continue;

      const pemenang = team1.score > team2.score ? team1.name : team2.name;
      const kalah = pemenang === team1.name ? team2.name : team1.name;

      if (finalistNames.includes(pemenang)) {
        defeatedPlayers.add(kalah);
      }
    }
  }

  const { data: semuaUser } = getData("User");

  const pesertaRepechange = semuaUser.filter((user: User) =>
    defeatedPlayers.has(user.username)
  );

  return pesertaRepechange;
};

const createRepechange = () => {
  const peserta = getRepechangeParticipants();
  const totalPeserta = peserta.length;
  const totalSlot = RoundRobbin(totalPeserta); // ex: 5 → 8
  const totalBay = totalSlot - totalPeserta;
  const totalRonde = Math.log2(totalSlot) + 1; // 3 + 1 = 4 ronde

  const pesertaMain = [...peserta];
  let pesertaBay: User[] = [];
  if (totalBay != 0) pesertaBay = pesertaMain.splice(-totalBay);

  // Buat semua bracket ronde
  const bracket: any[] = [];
  for (let i = 0; i < totalRonde; i++) {
    const title =
      i === totalRonde - 1
        ? "Winner"
        : i === totalRonde - 2
        ? "Finals"
        : `${i + 1}`;
    const jumlahSeed = Math.pow(2, totalRonde - i - 2); // 8 → Round 1 = 4 match, Round 2 = 2 match, ...
    const seeds = Array.from({ length: jumlahSeed }, (_, j) => ({
      id: j + 1,
      date: "",
      roundTitle: "Repechange",
      teams: [
        { name: "", score: 0, gambar: "", alamat: "", tim: "" },
        { name: "", score: 0, gambar: "", alamat: "", tim: "" },
      ],
    }));
    bracket.push({ title, seeds });
  }

  // ISI WINNER
  const findIndex = bracket.findIndex((round) => round.title === "Winner");
  if (findIndex !== -1) {
    bracket[findIndex].seeds[0] = {
      id: 1,
      roundTitle: "Repechange",
      date: "",
      teams: [{ name: "", score: 0, gambar: "", alamat: "", tim: "" }],
    };
  }

  // ISI ROUND 1 (dari pesertaMain)
  const round1 = bracket[0];
  for (let i = 0; i < pesertaMain.length; i += 2) {
    const team1 = pesertaMain[i];
    const team2 = pesertaMain[i + 1];
    round1.seeds[Math.floor(i / 2)].teams = [
      {
        name: team1?.username || "",
        score: 0,
        gambar: team1?.gambar || "",
        alamat: team1?.alamat || "",
        tim: team1?.namaTim || "",
      },
      {
        name: team2?.username || "",
        score: 0,
        gambar: team2?.gambar || "",
        alamat: team2?.alamat || "",
        tim: team2?.namaTim || "",
      },
    ];
  }

  // ISI BAY ke ROUND 2
  const round2 = bracket[1];
  for (let i = 0; i < pesertaBay.length; i++) {
    for (let j = round2.seeds.length - 1; j >= 0; j--) {
      const seed = round2.seeds[j];

      // ISI teams[1] dulu baru teams[0]
      if (seed.teams[1].name === "") {
        seed.teams[1].name = pesertaBay[i].username;
        seed.teams[1].gambar = pesertaBay[i].gambar;
        seed.teams[1].tim = pesertaBay[i].namaTim;
        seed.teams[1].alamat = pesertaBay[i].alamat;
        break;
      } else if (seed.teams[0].name === "") {
        seed.teams[0].name = pesertaBay[i].username;
        seed.teams[0].gambar = pesertaBay[i].gambar;
        seed.teams[0].tim = pesertaBay[i].namaTim;
        seed.teams[0].alamat = pesertaBay[i].alamat;
        break;
      }
    }
  }

  try {
    for (const round of bracket) {
      writeData(`Repechange:${round.title}`, round);
    }
    return true;
  } catch (err) {
    console.error("Error simpan:", err);
    return false;
  }
};

export { createBracket, updateBracket };
