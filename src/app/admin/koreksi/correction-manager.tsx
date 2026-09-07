"use client";
import { DataTable } from "@/components/data-table";
import{useCallback,useEffect,useState}from"react";type Item={id:string;reason:string;proposedData:Record<string,unknown>;status:string;reviewNote:string|null;resident:{fullName:string;nikLastFour:string};requestedBy:{name:string}};export function CorrectionManager(){const[rows,setRows]=useState<Item[]>([]);const[message,setMessage]=useState("");const load=useCallback(async()=>{const r=await fetch("/api/admin/corrections");const j=await r.json();if(r.ok)setRows(j.data)},[]);useEffect(()=>{void load()},[load]);async function review(id:string,decision:"APPROVED"|"REJECTED"){const reviewNote=prompt(decision==="APPROVED"?"Catatan persetujuan (opsional)":"Alasan penolakan")||"";const r=await fetch(`/api/admin/corrections/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({decision,reviewNote})});const j=await r.json();setMessage(j.message);if(r.ok)await load()}return <div className="card">{message&&<div className="alert">{message}</div>}<DataTable rows={rows} columns={[
 {key:"resident",label:"Warga",value:r=>r.resident.fullName+" "+r.resident.nikLastFour,render:r=><>{r.resident.fullName}<br/><span className="muted">****{r.resident.nikLastFour}</span></>},
 {key:"officer",label:"Petugas",value:r=>r.requestedBy.name},
 {key:"changes",label:"Perubahan",value:r=>JSON.stringify(r.proposedData),render:r=><code>{JSON.stringify(r.proposedData)}</code>},
 {key:"reason",label:"Alasan",value:r=>r.reason},
 {key:"status",label:"Status",value:r=>r.status},
 {key:"actions",label:"Aksi",className:"actions",render:r=>r.status==="PENDING"&&<><button onClick={()=>review(r.id,"APPROVED")}>Setujui</button><button className="danger-button" onClick={()=>review(r.id,"REJECTED")}>Tolak</button></>}
 ]}/></div>}
