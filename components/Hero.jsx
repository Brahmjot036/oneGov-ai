import Image from 'next/image'
export default function Hero(){
return (
<section className="mt-42 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
<div>
<h1 className="text-4xl md:text-5xl font-extrabold leading-tight">OnegovAI — Government schemes, simplified by AI</h1>
<p className="mt-4 text-gray-600">Search, chat, and explore any central/state scheme. Multilingual support, rich metadata, and an AI assistant that explains eligibility, documents, and step-by-step process.</p>
<div className="mt-6 flex gap-4">
<a href="#chat" className="px-5 py-3 bg-blue-600 text-white rounded-lg">Talk to the Assistant</a>
<a href="#features" className="px-5 py-3 border rounded-lg">Explore Schemes</a>
</div>
</div>
<div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden shadow-xl">
{/* Reference the uploaded screenshot path; copy it to public/first for production */}
<Image src="/screenshot.png" alt="Onegov preview" fill style={{objectFit:'cover'}}/>
</div>
</section>
)
}