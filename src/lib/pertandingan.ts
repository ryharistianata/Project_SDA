"use server";

import { Seed, User } from "@/types/type";
import { deleteData, getData, getNamaFileInFolder, writeData } from "./database";

const RoundRobbin = (n: number) => Math.pow(2, Math.ceil(Math.log2(n)));

const createBracket = async (peserta: User[]) => {
  if (!peserta.length) return false;

  const { message, data: fileRepechange } = getNamaFileInFolder("Repechange");
  const { message: messageRonde, data: fileRonde } = getNamaFileInFolder("Ronde");
  if (message === "success" || messageRonde === "success") {
    for (const file of fileRepechange) {
      deleteData(`Repechange:${file.split(".")[0]}`);
    }
    for (const file of fileRonde) {
      deleteData(`Ronde:${file.split(".")[0]}`);
    }
  }

  // Zig-zag peserta by alamat
  const alamat: { [key: string]: User[] } = {};
  peserta.forEach((item) => {
    const key = item.alamat.toLowerCase();
    if (!alamat[key]) alamat[key] = [];
    alamat[key].push(item);
  });

  // Urutkan peserta secara vertical
  const groupUsers = Object.values(alamat);
  const maxUsers = Math.max(...groupUsers.map((g) => g.length));
  const users: User[] = [];
  for (let i = 0; i < maxUsers; i++) {
    groupUsers.forEach((group) => {
      if (i < group.length) users.push(group[i]);
    });
  }

  // Buat repechange
  const totalPeserta = users.length;
  const totalSlot = RoundRobbin(totalPeserta); // Pengecekkan total bracket
  const totalBay = totalSlot - totalPeserta;
  const totalRonde = Math.log2(totalSlot) + 1; // 3 + 1 = 4 ronde

  // Masukkan peserta jika ada yang nge bye
  const pesertaMain = [...users];
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
    const jumlahSeed = Math.pow(2, totalRonde - i - 2); // 8 → Round 1 = 4 match, Round 2 = 2 match
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

const updateBracket = (peserta: Seed[], ronde: string, folder: string) => {
  // AMBIL PEMENANG PESERTA MASUKAN DALAM ARRAY
  const pesertaPemenang = peserta.map((seed) => {
      const [team1, team2] = seed.teams;
      if (team1.name !== "" && team2.name !== "") {
        return team1.score > team2.score ? team1 : team2;
      }
      return null;
    })
    .filter(Boolean);

  let nextRonde = "";
  let currentRonde = "";
  const { data: dataRepechange } = getData("Repechange");
  const totalCurrentPeserta = dataRepechange.map((item: any) => item?.seeds).flat();
  const { data: dataPeserta } = getData(`User`);
  const totalPeserta = folder == "Repechange" ? totalCurrentPeserta.length : dataPeserta.length;

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

  try {
    writeData(`${folder}:${nextRonde}`, rondeBerikutnya);
    if(nextRonde === "Winner" && folder != "Repechange") {
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
  const allRounds = getNamaFileInFolder("Ronde").data.map((file: string) => file.split(".")[0]).filter((round: string) => !kecuali.includes(round)); // Ambil semua ronde kecuali Winner dan Finals
  for (const ronde of allRounds) {
    const { message, data } = getData(`Ronde:${ronde}`);
    if (message !== "success") continue;

    const seeds: Seed[] = data.seeds;
    for (const seed of seeds) {
      const [team1, team2] = seed.teams;
      if (!team1?.name || !team2?.name) continue;

      const pemenang =
        team1.score > team2.score ? team1.name : team2.name;
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
      writeData(`Repechange:${round.title}`, round);
    }
    return true;
  } catch (err) {
    console.error("Error simpan:", err);
    return false;
  }
};

export { createBracket, updateBracket };
