"use client";
import { FormEvent, useState } from "react";

export function ResidentEntryForm(){
 const [nik,setNik]=useState(""); const [checked,setChecked]=useState(false); const [exists,setExists]=useState(false); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
 async function checkNik(){ setMessage(""); setChecked(false); if(!/^\d{16}$/.test(nik)) return setMessage("NIK harus tepat 16 digit angka."); setLoading(true); const r=await fetch("/api/residents/check-nik",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nik})}); const j=await r.json(); setLoading(false); if(!r.ok)return setMessage(j.message); setChecked(true); setExists(j.data.exists); setMessage(j.message); }
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");const f=new FormData(e.currentTarget);const body=Object.fromEntries(f.entries());body.nik=nik;const r=await fetch("/api/residents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json();setLoading(false);if(!r.ok)return setMessage(j.message);setMessage("Data warga berhasil disimpan.");setNik("");setChecked(false);(e.target as HTMLFormElement).reset();}
 return <div className="card"><div className="grid"><label>NIK<input value={nik} onChange={e=>{setNik(e.target.value.replace(/\D/g,"").slice(0,16));setChecked(false);}} inputMode="numeric" placeholder="16 digit NIK"/></label><button type="button" onClick={checkNik} disabled={loading}>{loading?"Memeriksa...":"Periksa NIK"}</button>{message&&<div className={`alert ${checked&&!exists?"successbox":""}`}>{message}</div>}</div>
 {checked&&exists&&<p className="danger"><strong>Data tidak dapat dimasukkan kembali.</strong> Hubungi admin bila diperlukan koreksi.</p>}
 {checked&&!exists&&<form onSubmit={save} className="form-grid" style={{marginTop:22}}>
  <label className="full">Nama lengkap<input name="fullName" required minLength={2}/></label>
  <label>Jenis kelamin<select name="gender" required><option value="">Pilih</option><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option></select></label>
  <label>Tanggal lahir<input name="birthDate" type="date"/></label>
  <label className="full">Alamat<textarea name="address" required minLength={5} rows={3}/></label>
  <label>RT<input name="rt" required inputMode="numeric" maxLength={3}/></label><label>RW<input name="rw" required inputMode="numeric" maxLength={3}/></label>
  <label>Desa/Kelurahan<input name="village"/></label><label>Kecamatan<input name="district"/></label>
  <label>Nomor HP<input name="phoneNumber" inputMode="tel" placeholder="08..."/></label><label>Catatan<input name="note"/></label>
  <button className="full" disabled={loading}>{loading?"Menyimpan...":"Simpan data"}</button>
 </form>}
 </div>;
}
