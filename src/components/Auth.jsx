import { useState } from 'react'
export default function Auth({onLogin}){
  const [phone, setPhone] = useState('0912345678')
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')
  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#111827'}}>
      <div style={{background:'white', padding:32, borderRadius:16, width:360}}>
        <h2 style={{marginTop:0}}>登入 Yousi</h2>
        <p style={{fontSize:14, color:'#666'}}>Demo: 乘客 0912345678 / 司機 0922333444 / 管理 admin / OTP 1234</p>
        {step===1 ? <>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="手機" style={{width:'100%', padding:12, marginTop:12, borderRadius:8, border:'1px solid #ddd'}}/>
          <button onClick={()=>setStep(2)} style={{width:'100%', marginTop:12, padding:12, background:'#FACC15', border:'none', borderRadius:8, fontWeight:'bold'}}>取得 OTP</button>
        </> : <>
          <p>OTP已發送到 {phone}，測試碼: <b>1234</b></p>
          <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="1234" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd'}}/>
          <button onClick={()=>{
            let role = phone==='0922333444'?'driver': phone==='admin'?'admin':'passenger'
            if(otp==='1234') onLogin({phone, role, name: role==='driver'?'林明輝司機':'玉里乘客'})
          }} style={{width:'100%', marginTop:12, padding:12, background:'#111827', color:'white', border:'none', borderRadius:8}}>登入</button>
        </>}
      </div>
    </div>
  )
}
