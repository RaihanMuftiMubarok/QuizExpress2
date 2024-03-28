var express = require("express");
var router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
var connection = require("../config/database.js");
const Model_Kapal = require("../model/Model_Kapal.js");
const Model_Pemilik = require("../model/Model_Pemilik.js");
const Model_Dpi = require("../model/Model_Dpi.js");
const Model_Alat_tangkap = require("../model/Model_Alat_tangkap.js");
const Model_User = require("../model/Model_User.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/upload");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get("/", async function (req, res, next) {
  try {
    let id = req.session.userId;
    let Data = await Model_User.getId(id);
    if (Data.length > 0) {
      let rows = await Model_Kapal.getAll();
      res.render("kapal/index", {
        data: rows,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/login");
  }
});

router.get("/create", async function (req, res, next) {
  let pemilik = await Model_Pemilik.getAll();
  let dpi = await Model_Dpi.getAll();
  let alat = await Model_Alat_tangkap.getAll();
  res.render("kapal/create", {
    nama_kapal: "",
    id_pemilik: "",
    id_dpi: "",
    id_alat_tangkap: "",
    data: pemilik,
    data2: dpi,
    data3: alat,
  });
});

router.post("/store", upload.single("foto_kapal"), async function (req, res, next) {
  try {
    let { nama_kapal, id_pemilik, id_dpi, id_alat_tangkap } = req.body;
    let Data = {
      nama_kapal,
      id_pemilik,
      id_dpi,
      id_alat_tangkap,
      foto_kapal: req.file.filename
    };
    await Model_Kapal.Store(Data);
    req.flash("success", "Berhasil menyimpan data!");
    res.redirect("/kapal");
  } catch {
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/kapal");
  }
});

router.get("/edit/(:id)", async function (req, res, next) {
  let id = req.params.id;
  let rows = await Model_Kapal.getId(id);
  let pemilik = await Model_Pemilik.getAll();
  let dpi = await Model_Dpi.getAll();
  let alat = await Model_Alat_tangkap.getAll();
  res.render("kapal/edit", {
    id: rows[0].id_kapal,
    nama_kapal: rows[0].nama_kapal,
    id_pemilik: rows[0].id_pemilik,
    id_dpi: rows[0].id_dpi,
    id_alat_tangkap: rows[0].id_alat_tangkap,
    foto_kapal: rows[0].foto_kapal,
    data: pemilik,
    data2: dpi,
    data3: alat,
  });
});

router.post("/update/(:id)",upload.single("foto_kapal"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let filebaru = req.file ? req.file.filename : null;
    let rows = await Model_Kapal.getId(id);
    const namaFileLama = rows[0].foto_kapal;

    if(filebaru && namaFileLama){
      const pathFileLama = path.join(__dirname, '../public/images/upload', namaFileLama);
      fs.unlinkSync(pathFileLama);
    }

    let { nama_kapal, id_pemilik, id_dpi, id_alat_tangkap } = req.body;
    let foto_kapal= filebaru || namaFileLama;
    let Data = {
      nama_kapal,
      id_pemilik,
      id_dpi,
      id_alat_tangkap,
      foto_kapal
    };
    await Model_Kapal.Update(id, Data);
    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/kapal");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/kapal");
  }
});

router.get("/delete/(:id)", async function (req, res) {
  let id = req.params.id;
  let rows = await Model_Kapal.getId(id);
  const namaFileLama = rows[0].foto_kapal;
  if(namaFileLama){
    const pathFileLama = path.join(__dirname, '../public/images/upload', namaFileLama);
    fs.unlinkSync(pathFileLama);
  }
  await Model_Kapal.Delete(id);
  req.flash("success", "Data terhapus!");
  res.redirect("/kapal");
});

module.exports = router;
