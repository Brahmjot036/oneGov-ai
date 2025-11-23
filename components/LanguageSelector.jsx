'use client'
import { useState } from 'react'

export default function LanguageSelector(){
const [lang, setLang] = useState('en')
return (
<select value={lang} onChange={(e)=>setLang(e.target.value)} className="border rounded-md px-2 py-1 bg-white">
<option value="en">EN</option>
<option value="hi">HI</option>
<option value="bn">BN</option>
<option value="ta">TA</option>
<option value="te">TE</option>
</select>
)
}
