"use server";

import { Seed, User } from "@/types/type";
import { getData, writeData } from "./database";

const createBracket = async (peserta: User[]) => {
  if (!peserta.length) return false;

  

  const nextPowerOfTwo = (n: number) => Math.pow(2, Math.ceil(Math.log2(n)));

  // Zig-zag peserta by alamat
  const alamat: { [key: string]: User[] } = {};
  peserta.forEach((item) => {
    const key = item.alamat.toLowerCase();
    if (!alamat[key]) alamat[key] = [];
    alamat[key].push(item);
  });

  const groupUsers = Object.values(alamat);
  const maxUsers = Math.max(...groupUsers.map((g) => g.length));
  const users: User[] = [];
  for (let i = 0; i < maxUsers; i++) {
    groupUsers.forEach((group) => {
      if (i < group.length) users.push(group[i]);
    });
  }

  const usersZigZag: User[] = [];
  for (let i = 0; i < users.length; i++) {
    if (i % 2 === 0) usersZigZag.unshift(users[i]);
    else usersZigZag.push(users[i]);
  }

  const totalPeserta = usersZigZag.length;
  const totalSlot = nextPowerOfTwo(totalPeserta); // ex: 5 → 8
  const totalBay = totalSlot - totalPeserta;
  const totalRonde = Math.log2(totalSlot) + 1; // 3 + 1 = 4 ronde

  const pesertaMain = [...usersZigZag];
  let pesertaBay: User[] = [];
  if(totalBay != 0) pesertaBay = pesertaMain.splice(-totalBay);

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
      writeData(`Ronde:${round.title}`, round);
    }
    return true;
  } catch (err) {
    console.error("Error simpan:", err);
    return false;
  }
};

const updateBracket = (peserta: Seed[], ronde: string) => {
  // AMBIL PEMENANG PESERTA MASUKAN DALAM ARRAY
  const pesertaPemenang = peserta
    .map((seed) => {
      const [team1, team2] = seed.teams;
      if (team1.name !== "" && team2.name !== "") {
        return team1.score > team2.score ? team1 : team2;
      }
      return null;
    })
    .filter(Boolean);

  let nextRonde = "";
  let currentRonde = "";
  const { data: dataPeserta } = getData(`User`);
  const totalPeserta = dataPeserta.length;

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

  // MENGUBAH SKOR PESERTA SEBELUMNYA
  const { message: msg, data: pesertaSebelumnya } = getData(
    `Ronde:${currentRonde}`
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
      writeData(`Ronde:${currentRonde}`, pesertaSebelumnya);
    } catch (err) {
      console.error("Error simpan:", err);
      return false;
    }
  }

  // MENGISI PESERTA PADA BABAK BERIKUTNYA
  const { message, data: rondeBerikutnya } = getData(`Ronde:${nextRonde}`);
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

  try {
    writeData(`Ronde:${nextRonde}`, rondeBerikutnya);
    return nextRonde;
  } catch (err) {
    console.error("Gagal simpan ronde berikutnya:", err);
    return false;
  }
};

export { createBracket, updateBracket };
