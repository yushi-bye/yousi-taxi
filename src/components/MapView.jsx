import { useEffect, useRef, useState } from 'react'
export default function MapView({mode, user, rides, setRides}){
  const mapRef = useRef(null)
  const [pickup, setPickup] = useState({lat:23.333, lng:121.314, addr:'玉里車站'})
  const [dropoff, setDropoff] = useState({lat:23.331, lng:121.316, addr:'玉里醫院'})
  const [drivers, setDrivers] = useState(Array.from({length:15}, (_,i)=>({id:i, lat:23.333+ (Math.random()-0.5)*0.02, lng:121.314+(Math.random()-0.5)*0.02, name:`司機${i+1}`, status:'available'})))
  const [currentRide, setCurrentRide] = useState(null)
  const [fare, setFare] = useState(190)

  useEffect(()=>{
    const iv = setInterval(()=>{
      setDrivers(d=>d.map(x=>({...x, lat:x.lat+(Math.random()-0.5)*0.0005, lng:x.lng+(Math.random()-0.5)*0.0005})))
    }, 1800)
    return ()=>clearInterval(iv)
  },[])

  function haversine(a,b){
    const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180
    const x=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2
    return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x))
  }
  const distance = haversine(pickup, dropoff)
  const calcFare = Math.round(75 + distance*20 + (new Date().getHours()>=22?20:0))

  function requestRide(){
    const ride={id:'YS-'+Date.now(), passenger:user.phone, pickup, dropoff, distance:distance.toFixed(2), fare:calcFare, status:'matching', createdAt:new Date().toISOString()}
    setCurrentRide(ride)
    setRides([ride, ...rides])
    localStorage.setItem('yousi_rides', JSON.stringify([ride, ...rides]))
    setTimeout(()=>{
      const nearest = drivers[0]
      setCurrentRide({...ride, status:'matched', driver:nearest})
      setTimeout(()=> setCurrentRide(r=>({...r, status:'in_progress'})), 3000)
      setTimeout(()=> setCurrentRide(r=>({...r, status:'completed'})), 8000)
    }, 2000)
  }

  if(mode==='admin'){
    return <div style={{padding:20}}><h2>管理後台</h2><p>總行程 {rides.length}</p><table border="1" cellPadding="8" style={{width:'100%', borderCollapse:'collapse'}}><tr><th>ID</th><th>乘客</th><th>距離</th><th>金額</th><th>狀態</th></tr>{rides.map(r=><tr key={r.id}><td>{r.id}</td><td>{r.passenger}</td><td>{r.distance}km</td><td>NT${r.fare}</td><td>{r.status}</td></tr>)}</table><button onClick={()=>{const csv='id,passenger,fare\n'+rides.map(r=>`${r.id},${r.passenger},${r.fare}`).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv])); a.download='rides.csv'; a.click()}}>匯出CSV</button></div>
  }
  if(mode==='driver'){
    return <div style={{padding:20}}><h2>司機模式 - {user.name}</h2><p>今日收入 NT$2,430 | 8趟</p><div style={{background:'white', padding:16, borderRadius:12, marginTop:12}}><b>新訂單</b><p>{pickup.addr} → {dropoff.addr} | NT${calcFare}</p><button onClick={()=>alert('已接單')} style={{padding:10, background:'#22c55e', color:'white', border:'none', borderRadius:8}}>接受</button></div></div>
  }

  return (
    <div style={{flex:1, display:'flex'}}>
      <div style={{flex:1, background:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:64}}>🗺️</div>
          <p>地圖：玉里 {pickup.lat.toFixed(3)}, {pickup.lng.toFixed(3)}</p>
          <p>{drivers.length} 台車即時移動中</p>
          <div style={{display:'flex', gap:4, flexWrap:'wrap', justifyContent:'center', maxWidth:300}}>
            {drivers.map(d=><span key={d.id} style={{background:'#FACC15', padding:'4px 8px', borderRadius:10, fontSize:12}}>🚕 {d.name}</span>)}
          </div>
        </div>
      </div>
      <div style={{width:360, background:'white', padding:20, borderLeft:'1px solid #ddd', overflowY:'auto'}}>
        <h3>叫車</h3>
        <label>上車</label><input value={pickup.addr} onChange={e=>setPickup({...pickup, addr:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}}/>
        <label>下車</label><input value={dropoff.addr} onChange={e=>setDropoff({...dropoff, addr:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}}/>
        <p>距離 {distance.toFixed(2)}km | 預估 NT${calcFare}</p>
        <div style={{display:'flex', gap:8, marginBottom:12}}>{['economy','comfort','xl','pet'].map(t=><button key={t} style={{flex:1, padding:6, borderRadius:8, border:'1px solid #ddd'}}>{t}</button>)}</div>
        <button onClick={requestRide} style={{width:'100%', padding:14, background:'#111827', color:'#FACC15', border:'none', borderRadius:12, fontWeight:'bold'}}>立即叫車 NT${calcFare}</button>
        {currentRide && <div style={{marginTop:16, padding:12, background:'#f0fdf4', borderRadius:12}}><b>{currentRide.id}</b><p>狀態: {currentRide.status} {currentRide.driver && `| 司機 ${currentRide.driver.name} 即將抵達`}</p></div>}
        <div style={{marginTop:20}}>
          <h4>付款</h4>
          <button style={{width:'100%', padding:10, background:'#00C300', color:'white', border:'none', borderRadius:8, marginBottom:6}}>LINE Pay 付款</button>
          <button style={{width:'100%', padding:10, background:'#E60012', color:'white', border:'none', borderRadius:8}}>街口支付</button>
          <input placeholder="優惠碼 YOUSI100" style={{width:'100%', marginTop:8, padding:8}}/>
        </div>
      </div>
    </div>
  )
}
