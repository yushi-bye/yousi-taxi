
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

const YULI_CENTER = [23.333, 121.314]

export default function MapView({mode, user, rides, setRides}){
  const mapDivRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  const [pickup, setPickup] = useState({lat:23.333, lng:121.314, addr:'玉里車站'})
  const [dropoff, setDropoff] = useState({lat:23.331, lng:121.316, addr:'玉里醫院'})
  const [drivers, setDrivers] = useState(Array.from({length:15}, (_,i)=>({id:i, lat:23.333+ (Math.random()-0.5)*0.02, lng:121.314+(Math.random()-0.5)*0.02, name:`司機${i+1}`, status:'available'})))
  const [currentRide, setCurrentRide] = useState(null)
  const [selecting, setSelecting] = useState('pickup') // pickup or dropoff

  // init map
  useEffect(()=>{
    if(mapRef.current) return
    const map = L.map(mapDivRef.current).setView(YULI_CENTER, 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)
    mapRef.current = map

    map.on('click', (e)=>{
      const {lat, lng} = e.latlng
      if(selecting==='pickup'){
        setPickup({lat, lng, addr: `${lat.toFixed(4)}, ${lng.toFixed(4)} (地圖點選)`})
      } else {
        setDropoff({lat, lng, addr: `${lat.toFixed(4)}, ${lng.toFixed(4)} (地圖點選)`})
      }
    })
  }, [selecting])

  // update markers
  useEffect(()=>{
    if(!mapRef.current) return
    markersRef.current.forEach(m=> mapRef.current.removeLayer(m))
    markersRef.current = []

    const pickupIcon = L.divIcon({html:'🟢', className:'', iconSize:[30,30]})
    const dropIcon = L.divIcon({html:'🔴', className:'', iconSize:[30,30]})
    
    const m1 = L.marker([pickup.lat, pickup.lng], {icon: pickupIcon}).addTo(mapRef.current).bindPopup(`上車: ${pickup.addr}`)
    const m2 = L.marker([dropoff.lat, dropoff.lng], {icon: dropIcon}).addTo(mapRef.current).bindPopup(`下車: ${dropoff.addr}`)
    markersRef.current.push(m1,m2)

    drivers.forEach(d=>{
      const icon = L.divIcon({html:`<div style="background:#FACC15;padding:2px 6px;border-radius:12px;border:2px solid black;font-size:12px">🚕${d.name}</div>`, className:'', iconSize:[60,20]})
      const m = L.marker([d.lat, d.lng], {icon}).addTo(mapRef.current)
      markersRef.current.push(m)
    })

    // draw line
    const line = L.polyline([[pickup.lat, pickup.lng],[dropoff.lat, dropoff.lng]], {color:'#111827', dashArray:'8 8'}).addTo(mapRef.current)
    markersRef.current.push(line)

  }, [pickup, dropoff, drivers])

  // animate drivers
  useEffect(()=>{
    const iv = setInterval(()=>{
      setDrivers(d=>d.map(x=>({...x, lat:x.lat+(Math.random()-0.5)*0.0005, lng:x.lng+(Math.random()-0.5)*0.0005})))
    }, 2000)
    return ()=>clearInterval(iv)
  },[])

  function haversine(a,b){
    const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180
    const x=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2
    return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x))
  }
  const distance = haversine(pickup, dropoff)
  const calcFare = Math.round(75 + distance*25 + (new Date().getHours()>=22?30:0))

  function requestRide(){
    const ride={id:'YS-'+Date.now(), passenger:user.phone||user.name, pickup, dropoff, distance:distance.toFixed(2), fare:calcFare, status:'matching', createdAt:new Date().toISOString()}
    setCurrentRide(ride)
    const newRides=[ride, ...rides]
    setRides(newRides)
    localStorage.setItem('yousi_rides', JSON.stringify(newRides))
    setTimeout(()=>{
      const nearest = drivers[0]
      setCurrentRide({...ride, status:'matched', driver:nearest})
      setTimeout(()=> setCurrentRide(r=>({...r, status:'in_progress'})), 3000)
      setTimeout(()=> setCurrentRide(r=>({...r, status:'completed'})), 8000)
    }, 2000)
  }

  // LINE Pay real integration note
  function handleLinePay(){
    if(!currentRide){
      alert('請先叫車，產生訂單後再付款')
      return
    }
    // 這裡是前端示範，真正的 LINE Pay 需要後端
    // 流程: 前端呼叫你的後端 /api/linepay/request -> 後端呼叫 LINE Pay API -> 回傳 paymentUrl -> window.location = paymentUrl
    const isSandbox = confirm(`這是 LINE Pay 串接示範\n\n訂單 ${currentRide.id}\n金額 NT$${currentRide.fare}\n\n真實串接需要:\n1. 申請 LINE Pay 商家帳號\n2. 後端 API (Node.js /api/linepay)\n3. 按確定我帶你去看串接文件`)
    if(isSandbox){
      window.open('https://pay.line.me/portal/tw/business', '_blank')
    }
  }

  if(mode==='admin'){
    return <div style={{padding:20}}><h2>管理後台</h2><p>總行程 {rides.length}</p><table border="1" cellPadding="8" style={{width:'100%', borderCollapse:'collapse'}}><thead><tr><th>ID</th><th>乘客</th><th>距離</th><th>金額</th><th>狀態</th></tr></thead><tbody>{rides.map(r=><tr key={r.id}><td>{r.id}</td><td>{r.passenger}</td><td>{r.distance}km</td><td>NT${r.fare}</td><td>{r.status}</td></tr>)}</tbody></table><button onClick={()=>{const csv='id,passenger,fare\n'+rides.map(r=>`${r.id},${r.passenger},${r.fare}`).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv])); a.download='rides.csv'; a.click()}} style={{marginTop:12, padding:'8px 16px'}}>匯出CSV</button></div>
  }
  if(mode==='driver'){
    return <div style={{padding:20}}><h2>司機模式 - {user.name}</h2><p>今日收入 NT$2,430 | 8趟</p><div style={{background:'white', padding:16, borderRadius:12, marginTop:12}}><b>新訂單</b><p>{pickup.addr} → {dropoff.addr} | NT${calcFare}</p><button onClick={()=>alert('已接單')} style={{padding:10, background:'#22c55e', color:'white', border:'none', borderRadius:8}}>接受</button></div><div ref={mapDivRef} style={{height:400, marginTop:20, borderRadius:12}}></div></div>
  }

  return (
    <div style={{flex:1, display:'flex', flexDirection:'row', height:'100%'}}>
      <div style={{flex:1, position:'relative'}}>
        <div ref={mapDivRef} style={{width:'100%', height:'100%'}}></div>
        <div style={{position:'absolute', top:10, left:10, background:'white', padding:'8px 12px', borderRadius:20, zIndex:1000, boxShadow:'0 2px 8px rgba(0,0,0,0.2)', display:'flex', gap:8}}>
          <button onClick={()=>setSelecting('pickup')} style={{padding:'6px 12px', borderRadius:12, border:selecting==='pickup'?'2px solid #111827':'1px solid #ddd', background:selecting==='pickup'?'#FACC15':'white'}}>🟢 設定上車點</button>
          <button onClick={()=>setSelecting('dropoff')} style={{padding:'6px 12px', borderRadius:12, border:selecting==='dropoff'?'2px solid #111827':'1px solid #ddd', background:selecting==='dropoff'?'#FACC15':'white'}}>🔴 設定下車點</button>
        </div>
      </div>
      <div style={{width:380, background:'white', padding:20, borderLeft:'1px solid #ddd', overflowY:'auto'}}>
        <h3>叫車 • 真實地圖版</h3>
        <p style={{fontSize:12, color:'#666'}}>點地圖可直接設定上車/下車點</p>
        <label>上車</label><input value={pickup.addr} onChange={e=>setPickup({...pickup, addr:e.target.value})} style={{width:'100%', padding:8, marginBottom:8, border:'2px solid #22c55e', borderRadius:8}}/>
        <label>下車</label><input value={dropoff.addr} onChange={e=>setDropoff({...dropoff, addr:e.target.value})} style={{width:'100%', padding:8, marginBottom:8, border:'2px solid #ef4444', borderRadius:8}}/>
        <p>距離 {distance.toFixed(2)}km | 預估 NT${calcFare}</p>
        <button onClick={requestRide} style={{width:'100%', padding:14, background:'#111827', color:'#FACC15', border:'none', borderRadius:12, fontWeight:'bold', fontSize:16}}>立即叫車 NT${calcFare}</button>
        {currentRide && <div style={{marginTop:16, padding:12, background:'#f0fdf4', borderRadius:12, border:'1px solid #22c55e'}}><b>{currentRide.id}</b><p>狀態: {currentRide.status} {currentRide.driver && `| 司機 ${currentRide.driver.name} 即將抵達`}</p><p style={{fontSize:12}}>從 {currentRide.pickup.addr} → {currentRide.dropoff.addr}</p></div>}
        <div style={{marginTop:20, padding:12, background:'#f8fafc', borderRadius:12}}>
          <h4>付款 • LINE Pay 真實串接說明</h4>
          <button onClick={handleLinePay} style={{width:'100%', padding:12, background:'#00C300', color:'white', border:'none', borderRadius:8, marginBottom:8, fontWeight:'bold', fontSize:16}}>LINE Pay 真實付款 (需後端)</button>
          <button style={{width:'100%', padding:10, background:'#E60012', color:'white', border:'none', borderRadius:8, marginBottom:6}}>街口支付 (待串接)</button>
          <input placeholder="優惠碼 YOUSI100" style={{width:'100%', marginTop:8, padding:8, borderRadius:8, border:'1px solid #ddd'}}/>
          <div style={{marginTop:12, fontSize:12, color:'#666', background:'white', padding:8, borderRadius:8}}>
            <b>真實 LINE Pay 需要：</b><br/>
            1. 申請 merchant<br/>
            2. 建立後端 API /api/linepay/request<br/>
            3. 後端呼叫 https://api-pay.line.me<br/>
            4. 前端跳轉 paymentUrl<br/>
            我已在程式碼註解寫好，部署到 Vercel 後可直接加 Serverless Function
          </div>
        </div>
      </div>
    </div>
  )
}
